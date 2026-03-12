import { api } from "@/lib/api";
import { API_URL, getHeaders } from "@/lib/api";
import { Message } from "@/types/message";

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  pinned?: boolean;
}

export interface ChatAttachment {
  url: string;
  type?: string;
  public_id?: string;
}

interface GeminiDonePayload {
  images?: string[];
  warning?: string | null;
}

interface StreamChatOptions {
  signal?: AbortSignal;
  model?: string;
  attachments?: ChatAttachment[];
  onDone?: (payload: GeminiDonePayload) => void;
}

export const chatService = {
  async getChats(): Promise<{ success: boolean; data: Chat[] }> {
    return api.get("/chats");
  },

  async createChat(): Promise<{ success: boolean; data: Chat }> {
    return api.post("/chats", {});
  },

  async getChat(id: string): Promise<{ success: boolean; data: { chat: Chat; messages: Message[] } }> {
    return api.get(`/chats/${id}`);
  },

  async sendMessage(chatId: string, content: string, role: 'user' | 'assistant'): Promise<{ success: boolean; data: Message }> {
    return api.post(`/chats/${chatId}/messages`, { content, role });
  },

  async uploadAttachments(files: Array<{ file: File; type: string }>): Promise<ChatAttachment[]> {
    const uploaded: ChatAttachment[] = [];
    for (const fileItem of files) {
      const res = await api.upload('/upload', fileItem.file);
      if (res?.success && res.data?.url) {
        uploaded.push({
          url: res.data.url,
          type: res.data.type || fileItem.type,
          public_id: res.data.public_id,
        });
      }
    }
    return uploaded;
  },

  async deleteChat(id: string): Promise<{ success: boolean }> {
    return api.delete(`/chats/${id}`);
  },

  async renameChat(id: string, title: string): Promise<{ success: boolean; data: Chat }> {
    return api.put(`/chats/${id}`, { title });
  },
  
  // Streaming is simulated for now as backend doesn't support it yet
  async *streamChatResponse(
    input: string,
    chatId: string,
    opts: StreamChatOptions = {}
  ): AsyncGenerator<string> {
    if ((opts.model || '').startsWith('gemini-')) {
      yield* this.streamGeminiResponse(input, chatId, opts);
      return;
    }

    // Send user message to backend to save it
    await this.sendMessage(chatId, input, 'user');

    // Simulate AI response delay
    const response = "This is a simulated response from the backend (LLM integration pending). I received: " + input;
    const chunks = response.split(" ");
    
    // Save assistant message start (empty) - Actually backend addMessage saves it complete
    // We should probably save the AI message AFTER generation in a real app, 
    // or stream it to backend.
    // For now, we will just simulate streaming back to UI.
    // And finally save the full message to backend?
    // The backend `addMessage` saves a message.
    // So:
    // 1. UI calls sendMessage(user) -> saved to DB.
    // 2. UI simulates stream.
    // 3. UI calls sendMessage(assistant) -> saved to DB.
    
    for (const chunk of chunks) {
      if (opts.signal?.aborted) break;
      yield chunk + " ";
      await new Promise(r => setTimeout(r, 50));
    }
    
    // Save the full AI response to backend
    if (!opts.signal?.aborted) {
        await this.sendMessage(chatId, response, 'assistant');
    }
  },

  async *streamGeminiResponse(
    input: string,
    chatId: string,
    opts: StreamChatOptions = {}
  ): AsyncGenerator<string> {
    const res = await fetch(`${API_URL}/chat/gemini`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        prompt: input,
        chatId,
        model: opts.model,
        attachments: opts.attachments || [],
      }),
      signal: opts.signal,
    });

    if (!res.ok || !res.body) {
      let message = 'Failed to connect Gemini stream';
      try {
        const data = await res.json();
        message = data?.error || data?.message || message;
      } catch {
        // no-op
      }
      throw new Error(message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const line = event
          .split('\n')
          .find((row) => row.startsWith('data: '));

        if (!line) continue;

        const payload = JSON.parse(line.slice(6));

        if (payload.type === 'chunk' && payload.value) {
          yield String(payload.value);
          continue;
        }

        if (payload.type === 'error') {
          throw new Error(payload.message || 'Gemini stream error');
        }

        if (payload.type === 'done') {
          opts.onDone?.({
            images: payload.images || [],
            warning: payload.warning || null,
          });
        }
      }
    }
  }
};
