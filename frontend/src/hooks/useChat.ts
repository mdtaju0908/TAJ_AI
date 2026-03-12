"use client";

import { useRef } from "react";
import { mockStream } from "@/lib/streaming";
import { useChatStore } from "@/hooks/useChatStore";

export function useChat() {
  const abortRef = useRef<AbortController | null>(null);
  const { activeChatId, addMessage, updateMessage, createNewChat } = useChatStore();

  const ensureChatId = () => activeChatId || createNewChat();

  const send = async (content: string) => {
    const chatId = ensureChatId();
    const userMsgId = Math.random().toString(36).slice(2);
    addMessage(chatId, { id: userMsgId, role: "user", content, timestamp: new Date().toISOString() });
    const assistantId = Math.random().toString(36).slice(2);
    addMessage(chatId, { id: assistantId, role: "assistant", content: "", timestamp: new Date().toISOString() });
    abortRef.current = new AbortController();
    let acc = "";
    for await (const chunk of mockStream(content, 30, abortRef.current.signal)) {
      acc += chunk;
      updateMessage(chatId, assistantId, acc);
    }
  };

  const abort = () => {
    abortRef.current?.abort();
  };

  const retry = (lastUserContent: string) => send(lastUserContent);

  const editMessage = (chatId: string, messageId: string, content: string) => {
    updateMessage(chatId, messageId, content);
  };

  return { send, abort, retry, editMessage };
}
