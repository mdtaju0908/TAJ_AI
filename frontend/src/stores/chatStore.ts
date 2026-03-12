"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Chat } from "@/types/chat";
import type { Message } from "@/types/message";

type FontSize = "sm" | "md" | "lg";
type Theme = "dark" | "light" | "system";

interface Settings {
  theme: Theme;
  language: string;
  fontSize: FontSize;
  typingAnimation: boolean;
  autoScroll: boolean;
  soundNotification: boolean;
  desktopNotifications: boolean;
  emailUpdates: boolean;
  twoFactorEnabled: boolean;
  saveHistory: boolean;
}

interface ChatStore {
  chats: Chat[];
  activeChatId?: string;
  settings: Settings;
  isSettingsOpen: boolean;
  createNewChat: () => string;
  ensureChat: (id: string) => void;
  selectChat: (id: string) => void;
  setMessages: (id: string, messages: Message[]) => void;
  addMessage: (id: string, message: Message) => void;
  updateMessage: (id: string, messageId: string, content: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  togglePin: (id: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
  updateSetting: (key: keyof Settings, value: any) => void;
  clearChatHistory: () => void;
  exportChats: (format: "json" | "txt") => void;
  deleteAllData: () => void;
}

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: undefined,
      settings: {
        theme: "dark",
        language: "en",
        fontSize: "md",
        typingAnimation: true,
        autoScroll: true,
        soundNotification: false,
        desktopNotifications: false,
        emailUpdates: false,
        twoFactorEnabled: false,
        saveHistory: true,
      },
      isSettingsOpen: false,
      createNewChat: () => {
        const id = generateId();
        const now = new Date().toISOString();
        const title = `New Chat`;
        set((state) => ({
          chats: [{ id, title, messages: [], updatedAt: now }, ...state.chats],
          activeChatId: id,
        }));
        return id;
      },
      ensureChat: (id: string) => {
        const exists = get().chats.some((c) => c.id === id);
        if (!exists) {
          const now = new Date().toISOString();
          set((state) => ({
            chats: [{ id, title: `New Chat`, messages: [], updatedAt: now }, ...state.chats],
            activeChatId: id,
          }));
        } else {
          set({ activeChatId: id });
        }
      },
      selectChat: (id: string) => set({ activeChatId: id }),
      setMessages: (id: string, messages: Message[]) =>
        set((state) => ({
          chats: state.chats.map((c) => (c.id === id ? { ...c, messages, updatedAt: new Date().toISOString() } : c)),
        })),
      addMessage: (id: string, message: Message) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, messages: [...c.messages, message], updatedAt: new Date().toISOString() } : c
          ),
        })),
      updateMessage: (id: string, messageId: string, content: string) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id
              ? {
                  ...c,
                  messages: c.messages.map((m) => (m.id === messageId ? { ...m, content } : m)),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),
      updateChatTitle: (id: string, title: string) =>
        set((state) => ({ chats: state.chats.map((c) => (c.id === id ? { ...c, title } : c)) })),
      deleteChat: (id: string) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          activeChatId: state.activeChatId === id ? state.chats[0]?.id : state.activeChatId,
        })),
      togglePin: (id: string) =>
        set((state) => {
          const updated = state.chats.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
          updated.sort((a, b) => {
            const ap = a.pinned ? 1 : 0;
            const bp = b.pinned ? 1 : 0;
            if (ap !== bp) return bp - ap;
            return (b.updatedAt || "").localeCompare(a.updatedAt || "");
          });
          return { chats: updated };
        }),
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      updateSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
      clearChatHistory: () =>
        set((state) => ({ chats: state.chats.map((c) => ({ ...c, messages: [] })) })),
      exportChats: (format: "json" | "txt") => {
        const chats = get().chats;
        const data = JSON.stringify(chats, null, 2);
        const txt = chats
          .map((c) => {
            const head = `# ${c.title}\n`;
            const body = c.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
            return head + body;
          })
          .join("\n\n---\n\n");
        const blob = new Blob([format === "json" ? data : txt], {
          type: format === "json" ? "application/json" : "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tajai-chats.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      deleteAllData: () => {
        set({ chats: [], activeChatId: undefined });
        try {
          localStorage.removeItem("taj-ai-chat");
        } catch {}
      },
    }),
    {
      name: "taj-ai-chat",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chats: state.chats,
        activeChatId: state.activeChatId,
        settings: state.settings,
      }),
    }
  )
);
