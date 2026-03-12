import { API_URL } from "@/lib/api";

export type ToolCommand = "image" | "search" | "summarize" | null;

export interface StreamOptions {
  signal?: AbortSignal;
}

export async function* streamChatResponse(
  input: string,
  chatId: string,
  opts: StreamOptions = {}
): AsyncGenerator<string> {
  const m = input.trim().match(/^\/(image|search|summarize)\b(?:\s+(.*))?$/i);
  const tool = (m?.[1]?.toLowerCase() as ToolCommand) || null;
  const payload =
    tool === null
      ? { message: input, chatId }
      : { command: tool, args: (m?.[2] || "").trim(), chatId };

  const endpoint =
    tool === null
      ? `${API_URL}/chat/stream`
      : `${API_URL}/tools/${tool}/stream`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) yield chunk;
    }
  } finally {
    reader.releaseLock();
  }
}
