"use client";

import { useState, useRef, useCallback } from "react";
import { streamChatResponse } from "@/services/chat";
import { useChatStore } from "@/stores/chatStore";
import { useShallow } from 'zustand/react/shallow';
import type { Message } from "@/types/message";

export function useChat(chatId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { chats, addMessage, updateMessage, setMessages } = useChatStore(
    useShallow((state) => ({
      chats: state.chats,
      addMessage: state.addMessage,
      updateMessage: state.updateMessage,
      setMessages: state.setMessages,
    }))
  );

  const currentChat = chats.find(c => c.id === chatId);
  const messages = currentChat?.messages || [];

  const sendMessage = async (content: string, isRegenerate = false) => {
    if (!content.trim() && !isRegenerate) return;
    
    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      if (!isRegenerate) {
        const userMsg: Message = {
          id: Math.random().toString(36).slice(2),
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        };
        addMessage(chatId, userMsg);
      }

      const assistantId = Math.random().toString(36).slice(2);
      addMessage(chatId, {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      });

      let acc = "";
      for await (const chunk of streamChatResponse(content || "Regenerating...", chatId, { signal: abortRef.current.signal })) {
        acc += chunk;
        updateMessage(chatId, assistantId, acc);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Failed to send message:', error);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const retry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove last assistant message if it exists
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        setMessages(chatId, messages.slice(0, -1));
      }
      sendMessage(lastUserMessage.content, true);
    }
  }, [messages, chatId, sendMessage, setMessages]);

  const editUserMessage = useCallback((messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Remove all messages after this one and start over
    const updatedMessages = messages.slice(0, messageIndex);
    setMessages(chatId, updatedMessages);
    sendMessage(newContent);
  }, [messages, chatId, sendMessage, setMessages]);

  return {
    messages,
    isLoading,
    sendMessage,
    cancel,
    retry,
    editUserMessage,
  };
}
