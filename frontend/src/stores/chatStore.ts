import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types/message';
import { chatService } from '@/services/chat';
import { toast } from 'react-hot-toast';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  pinned?: boolean;
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  
  fetchChats: () => Promise<void>;
  fetchChat: (id: string) => Promise<void>;
  createChat: () => Promise<string | null>;
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => Promise<void>;
  renameChat: (id: string, title: string) => Promise<void>;
  togglePin: (id: string) => void;
  clearHistory: () => void;
  
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      isLoading: false,

      fetchChats: async () => {
        set({ isLoading: true });
        try {
          const res = await chatService.getChats();
          if (res.success) {
            set({ chats: res.data });
          }
        } catch (error) {
          toast.error('Failed to load chats');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchChat: async (id: string) => {
        set({ isLoading: true });
        try {
          const res = await chatService.getChat(id);
          if (res.success && res.data) {
            const { chat, messages } = res.data;
            set((state) => {
              const existingChatIndex = state.chats.findIndex(c => c.id === id);
              if (existingChatIndex >= 0) {
                const updatedChats = [...state.chats];
                updatedChats[existingChatIndex] = { ...chat, messages };
                return { chats: updatedChats };
              } else {
                return { chats: [{ ...chat, messages }, ...state.chats] };
              }
            });
          }
        } catch (error) {
          toast.error('Failed to load chat');
        } finally {
          set({ isLoading: false });
        }
      },

      createChat: async () => {
        set({ isLoading: true });
        try {
          const res = await chatService.createChat();
          if (res.success) {
            const newChat = res.data;
            set((state) => ({
              chats: [newChat, ...state.chats],
              activeChatId: newChat.id,
            }));
            return newChat.id;
          }
          return null;
        } catch (error) {
          toast.error('Failed to create chat');
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      setActiveChat: (id) => set({ activeChatId: id }),

      deleteChat: async (id) => {
        try {
          const res = await chatService.deleteChat(id);
          if (res.success) {
            set((state) => {
              const newChats = state.chats.filter((c) => c.id !== id);
              return {
                chats: newChats,
                activeChatId:
                  state.activeChatId === id
                    ? newChats.length > 0
                      ? newChats[0].id
                      : null
                    : state.activeChatId,
              };
            });
            toast.success('Chat deleted');
          }
        } catch (error) {
          toast.error('Failed to delete chat');
        }
      },

      renameChat: async (id, title) => {
        try {
          const res = await chatService.renameChat(id, title);
          if (res.success) {
            set((state) => ({
              chats: state.chats.map((c) =>
                c.id === id ? { ...c, title } : c
              ),
            }));
          }
        } catch (error) {
          toast.error('Failed to rename chat');
        }
      },

      togglePin: (id) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      clearHistory: () => set({ chats: [], activeChatId: null }),

      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...(c.messages || []), message],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      updateMessage: (chatId, messageId, content) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                }
              : c
          ),
        })),

      setMessages: (chatId, messages) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ activeChatId: state.activeChatId }),
    }
  )
);
