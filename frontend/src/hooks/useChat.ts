"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { chatService } from "@/services/chat";
import { useChatStore } from "@/stores/chatStore";
import { useShallow } from 'zustand/react/shallow';
import type { Message } from "@/types/message";
import type { ChatAttachment } from "@/services/chat";
import { toast } from "react-hot-toast";

export function useChat(chatId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { chats, selectedModel, addMessage, updateMessage, setMessages, fetchChat } = useChatStore(
    useShallow((state) => ({
      chats: state.chats,
      selectedModel: state.selectedModel,
      addMessage: state.addMessage,
      updateMessage: state.updateMessage,
      setMessages: state.setMessages,
      fetchChat: state.fetchChat,
    }))
  );

  const currentChat = chats.find(c => c.id === chatId);
  const messages = currentChat?.messages || [];

  // Fetch chat details (including messages) when chatId changes
  useEffect(() => {
    if (chatId && chatId !== "__missing__") {
      fetchChat(chatId);
    }
  }, [chatId, fetchChat]);

  const sendMessage = async (
    content: string,
    options: { isRegenerate?: boolean; attachments?: ChatAttachment[] } = {}
  ) => {
    const isRegenerate = options.isRegenerate ?? false;

    if (!content.trim() && !isRegenerate) return;

    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      if (!isRegenerate) {
        const inputImages = (options.attachments || [])
          .filter((item) => item.type?.startsWith('image/'))
          .map((item) => item.url);

        const userMsg: Message = {
          id: Math.random().toString(36).slice(2),
          role: "user",
          content,
          images: inputImages.length > 0 ? inputImages : undefined,
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

      let assistantImages: string[] = [];
      let acc = "";
      for await (const chunk of chatService.streamChatResponse(content || "Regenerating...", chatId, {
        signal: abortRef.current.signal,
        model: selectedModel,
        attachments: options.attachments,
        onDone: ({ images, warning }) => {
          assistantImages = images || [];
          if (warning) {
            toast.error(warning);
          }
        },
      })) {
        acc += chunk;
        updateMessage(chatId, assistantId, acc);
      }

      if (assistantImages.length > 0) {
        const currentMessages = useChatStore
          .getState()
          .chats.find((chat) => chat.id === chatId)?.messages || [];

        setMessages(
          chatId,
          currentMessages.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: acc || msg.content || 'Generated image result is ready.',
                  images: assistantImages,
                }
              : msg
          )
        );
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        if (/rate\s*limit|quota|429/i.test((error as Error).message)) {
          toast.error('Gemini rate limit reached, try later or upgrade');
        }
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
      sendMessage(lastUserMessage.content, { isRegenerate: true });
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
