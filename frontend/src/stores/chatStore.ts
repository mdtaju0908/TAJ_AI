import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types/message';

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
  newChatIndex: number;
  
  createChat: () => string;
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  clearHistory: () => void;
  
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  
  exportChats: (format: 'json' | 'txt') => void;
}

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      newChatIndex: 1,

      createChat: () => {
        const id = generateId();
        const { newChatIndex } = get();
        const title = `New Chat ${newChatIndex}`;
        const newChat: Chat = {
          id,
          title,
          messages: [],
          updatedAt: new Date().toISOString(),
          pinned: false,
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: id,
          newChatIndex: state.newChatIndex + 1,
        }));
        
        return id;
      },

      setActiveChat: (id) => set({ activeChatId: id }),

      deleteChat: (id) =>
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
        }),

      renameChat: (id, title) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),

      togglePin: (id) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      clearHistory: () => set({ chats: [], activeChatId: null, newChatIndex: 1 }),

      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, message],
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

      exportChats: (format) => {
        const { chats } = get();
        const data = format === 'json' 
          ? JSON.stringify(chats, null, 2)
          : chats.map(c => 
              `Chat: ${c.title}\nDate: ${c.updatedAt}\n\n${c.messages.map(m => 
                `${m.role.toUpperCase()}: ${m.content}`
              ).join('\n\n')}`
            ).join('\n\n---\n\n');
            
        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taj-ai-history.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);
