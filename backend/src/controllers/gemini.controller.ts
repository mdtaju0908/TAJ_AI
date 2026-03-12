import { Response } from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { config } from '../config';
import { Chat } from '../models/Chat.model';
import { Message } from '../models/Message.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthRequest } from '../types';

interface GeminiAttachment {
  url: string;
  type?: string;
  public_id?: string;
}

interface GeminiRequestBody {
  chatId: string;
  prompt: string;
  model?: string;
  attachments?: GeminiAttachment[];
}

const MODEL_DEFAULT = 'gemini-3-flash-preview';
const MODEL_FALLBACK = 'gemini-1.5-flash-latest';
const CHAT_MODELS = new Set([
  'gemini-3-flash-preview',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
]);
const IMAGE_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-exp-image-generation', MODEL_FALLBACK];
const FREE_PLAN_LIMIT = 200;
const PRO_PLAN_LIMIT = 5000;
const WARNING_THRESHOLD = 0.85;

// String-literal safety settings compatible with both SDK versions
const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_ONLY_HIGH' },
];

const THINKING_MODELS = new Set(['gemini-3-flash-preview', 'gemini-2.5-flash']);

const isImagePrompt = (prompt: string) =>
  /^(\s*\/image\b|\s*generate\s+image(\s+of\s+.*)?$|\s*create\s+image\s+of\s+|\s*draw\s+)/i.test(
    prompt.trim()
  );

const inferMimeType = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.endsWith('.png'))  return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif'))  return 'image/gif';
  return 'image/jpeg';
};

const isImageAttachment = (file: GeminiAttachment): boolean => {
  if (file.type && file.type.startsWith('image/')) return true;
  return /(\.png|\.jpe?g|\.webp|\.gif)(\?|$)/i.test(file.url);
};

const toInlineImagePart = async (attachment: GeminiAttachment) => {
  if (!attachment.url) return null;

  const resp = await fetch(attachment.url);
  if (!resp.ok) {
    throw new ApiError(400, `Unable to fetch attachment from ${attachment.url}`);
  }

  const mimeType = (
    resp.headers.get('content-type') ||
    attachment.type ||
    inferMimeType(attachment.url)
  ).split(';')[0];

  const bytes = await resp.arrayBuffer();
  return {
    inlineData: {
      mimeType,
      data: Buffer.from(bytes).toString('base64'),
    },
  };
};

const buildUserParts = async (prompt: string, attachments: GeminiAttachment[]) => {
  const parts: any[] = [{ text: prompt }];

  for (const attachment of attachments) {
    if (!isImageAttachment(attachment)) continue;
    const part = await toInlineImagePart(attachment);
    if (part) parts.push(part);
  }

  return parts;
};

const toSSE = (res: Response, payload: unknown) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const ensureMonthlyUsage = (user: any) => {
  const now   = new Date();
  const month = now.getUTCMonth();
  const year  = now.getUTCFullYear();

  if (!user.usage) {
    user.usage = { messagesThisMonth: 0, usageMonth: month, usageYear: year };
    return;
  }

  if (user.usage.usageMonth !== month || user.usage.usageYear !== year) {
    user.usage.messagesThisMonth = 0;
    user.usage.usageMonth = month;
    user.usage.usageYear  = year;
  }
};

const extractImagesFromChunk = (chunk: any): string[] => {
  const urls: string[] = [];
  const parts: any[] = chunk?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || 'image/png';
      urls.push(`data:${mimeType};base64,${part.inlineData.data}`);
    }
  }
  return urls;
};

// @desc    Gemini chat stream  (uses @google/genai SDK)
// @route   POST /api/chat/gemini
// @access  Private
export const streamGeminiChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { chatId, prompt, model, attachments = [] } = req.body as GeminiRequestBody;

  if (!config.geminiApiKey) {
    throw new ApiError(500, 'GEMINI_API_KEY is not configured on the server');
  }

  if (!prompt?.trim()) {
    throw new ApiError(400, 'Prompt is required');
  }

  if (!chatId) {
    throw new ApiError(400, 'chatId is required');
  }

  const chat = await Chat.findOne({ _id: chatId, user: req.user.id, isDeleted: false });
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const user = req.user;
  ensureMonthlyUsage(user);

  const planLimit = user.plan === 'pro' ? PRO_PLAN_LIMIT : FREE_PLAN_LIMIT;
  if (user.usage.messagesThisMonth >= planLimit) {
    throw new ApiError(429, 'Monthly message limit reached for your plan');
  }

  const sanitizedModel = model && CHAT_MODELS.has(model) ? model : MODEL_DEFAULT;
  const imageMode     = isImagePrompt(prompt);
  const selectedModel = imageMode ? IMAGE_MODELS[0] : sanitizedModel;

  await Message.create({ chat: chatId, sender: 'user', content: prompt, attachments });
  chat.updatedAt = new Date();
  await chat.save();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // ── New @google/genai SDK ───────────────────────────────────────────────
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  let assistantText = '';
  let outputImages: string[] = [];

  try {
    const parts    = await buildUserParts(prompt, attachments);
    const contents = [{ role: 'user', parts }];

    toSSE(res, {
      type: 'meta',
      provider: 'gemini',
      model: selectedModel,
      usage: { current: user.usage.messagesThisMonth, limit: planLimit },
    });

    // Build generation config — thinkingConfig only for supported models
    const genConfig: Record<string, any> = {
      safetySettings,
      temperature: imageMode ? 0.9 : 0.7,
    };

    if (THINKING_MODELS.has(selectedModel)) {
      genConfig['thinkingConfig'] = { thinkingLevel: ThinkingLevel.HIGH };
    }

    // Stream using the new SDK: ai.models.generateContentStream(...)
    const response = await ai.models.generateContentStream({
      model: selectedModel,
      config: genConfig,
      contents,
    });

    for await (const chunk of response) {
      // New SDK: chunk.text is a property (not a method call)
      const text = chunk.text;
      if (text) {
        assistantText += text;
        toSSE(res, { type: 'chunk', value: text });
      }
      // Collect any inline image data (image-generation responses)
      const chunkImages = extractImagesFromChunk(chunk);
      outputImages.push(...chunkImages);
    }

    if (!assistantText && outputImages.length > 0) {
      assistantText = 'Generated image result is ready.';
    }

    await Message.create({
      chat: chatId,
      sender: 'ai',
      content: assistantText || 'No text response returned by model.',
      attachments: outputImages.map((url) => ({ url, type: 'image/png' })),
    });

    user.usage.messagesThisMonth += 1;
    await user.save();

    const usageRatio = user.usage.messagesThisMonth / planLimit;
    const warning = usageRatio >= WARNING_THRESHOLD
      ? `You are near your monthly limit (${user.usage.messagesThisMonth}/${planLimit}).`
      : null;

    toSSE(res, {
      type: 'done',
      text: assistantText,
      images: outputImages,
      usage: { current: user.usage.messagesThisMonth, limit: planLimit },
      warning,
    });
    res.end();
  } catch (error: any) {
    const status      = Number(error?.status || error?.statusCode || 500);
    const rawMessage  = String(error?.message || 'Gemini request failed');
    const isRateLimit = status === 429 || /429|rate\s*limit|quota/i.test(rawMessage);

    toSSE(res, {
      type:    'error',
      code:    isRateLimit ? 'rate_limit'  : 'gemini_error',
      status:  isRateLimit ? 429 : status,
      message: isRateLimit ? 'Gemini rate limit reached, try later or upgrade.' : rawMessage,
    });
    res.end();
  }
});
