"use client";

export async function* mockStream(text: string, tokenMs = 40, signal?: AbortSignal) {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) return;
    yield words[i] + (i < words.length - 1 ? " " : "");
    await new Promise((r) => setTimeout(r, tokenMs));
  }
}
