"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  pinned?: boolean;
  updatedAt?: string;
}

interface ChatStore {
  chats: ChatSession[];
  activeChatId?: string;
  createNewChat: () => string;
  ensureChat: (id: string) => void;
  selectChat: (id: string) => void;
  setMessages: (id: string, messages: ChatMessage[]) => void;
  addMessage: (id: string, message: ChatMessage) => void;
  updateMessage: (id: string, messageId: string, content: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  togglePin: (id: string) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  settings: {
    theme: 'dark' | 'light' | 'system';
    language: string;
    fontSize: 'sm' | 'md' | 'lg';
    typingAnimation: boolean;
    autoScroll: boolean;
    soundNotification: boolean;
    desktopNotifications: boolean;
    emailUpdates: boolean;
    twoFactorEnabled: boolean;
    saveHistory: boolean;
  };
  updateSetting: (key: keyof ChatStore['settings'], value: any) => void;
  clearChatHistory: () => void;
  exportChats: (format: 'json' | 'txt') => void;
  deleteAllData: () => void;
}

const ChatStoreContext = createContext<ChatStore | null>(null);

const STORAGE_KEY = 'tajai.chats.v1';
const ACTIVE_KEY = 'tajai.activeChatId';
const INDEX_KEY = 'tajai.newChatIndex';
const SETTINGS_KEY = 'tajai.settings.v1';

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const newChatIndexRef = useRef(1);
  const hydratedRef = useRef(false);
  const [settings, setSettings] = useState<ChatStore['settings']>({
    theme: 'dark',
    language: 'en',
    fontSize: 'md',
    typingAnimation: true,
    autoScroll: true,
    soundNotification: false,
    desktopNotifications: false,
    emailUpdates: false,
    twoFactorEnabled: false,
    saveHistory: true,
  });

  useEffect(() => {
    try {
      const savedChats = localStorage.getItem(STORAGE_KEY);
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }
    } catch {}
    try {
      const savedActive = localStorage.getItem(ACTIVE_KEY);
      if (savedActive) setActiveChatId(savedActive);
    } catch {}
    try {
      const idx = Number(localStorage.getItem(INDEX_KEY) || '1');
      newChatIndexRef.current = Number.isFinite(idx) && idx > 0 ? idx : 1;
    } catch {}
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings(JSON.parse(s));
    } catch {}
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {}
  }, [chats]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      if (activeChatId) localStorage.setItem(ACTIVE_KEY, activeChatId);
    } catch {}
  }, [activeChatId]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(INDEX_KEY, String(newChatIndexRef.current));
    } catch {}
  }, [chats]);
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const createNewChat = useCallback(() => {
    const id = generateId();
    const title = `New Chat ${newChatIndexRef.current}`;
    newChatIndexRef.current += 1;
    const now = new Date().toISOString();
    setChats(prev => [{ id, title, messages: [], updatedAt: now }, ...prev]);
    setActiveChatId(id);
    return id;
  }, []);

  const ensureChat = useCallback((id: string) => {
    setChats(prev => {
      if (prev.some(c => c.id === id)) return prev;
      const title = `New Chat ${newChatIndexRef.current}`;
      newChatIndexRef.current += 1;
      const now = new Date().toISOString();
      return [{ id, title, messages: [], updatedAt: now }, ...prev];
    });
    setActiveChatId(id);
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (chats.length === 0) {
      createNewChat();
    }
  }, [chats.length, createNewChat]);

  useEffect(() => {
    if (!activeChatId) return;
    if (chats.some(c => c.id === activeChatId)) return;
    setActiveChatId(chats[0]?.id);
  }, [activeChatId, chats]);

  const selectChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const updateChat = useCallback((id: string, updater: (chat: ChatSession) => ChatSession) => {
    setChats(prev => prev.map(c => (c.id === id ? updater(c) : c)));
  }, []);

  const setMessages = useCallback((id: string, messages: ChatMessage[]) => {
    updateChat(id, chat => ({ ...chat, messages, updatedAt: new Date().toISOString() }));
  }, [updateChat]);

  const addMessage = useCallback((id: string, message: ChatMessage) => {
    updateChat(id, chat => ({
      ...chat,
      messages: [...chat.messages, message],
      updatedAt: new Date().toISOString(),
    }));
  }, [updateChat]);

  const updateMessage = useCallback((id: string, messageId: string, content: string) => {
    updateChat(id, chat => ({
      ...chat,
      messages: chat.messages.map(m => (m.id === messageId ? { ...m, content } : m)),
      updatedAt: new Date().toISOString(),
    }));
  }, [updateChat]);

  const updateChatTitle = useCallback((id: string, title: string) => {
    updateChat(id, chat => ({ ...chat, title }));
  }, [updateChat]);

  const deleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setChats(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c));
      return [...updated].sort((a, b) => {
        const ap = a.pinned ? 1 : 0;
        const bp = b.pinned ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
    });
  }, []);

  const value = useMemo<ChatStore>(() => ({
    chats,
    activeChatId,
    createNewChat,
    ensureChat,
    selectChat,
    setMessages,
    addMessage,
    updateMessage,
    updateChatTitle,
    deleteChat,
    togglePin,
    isSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    settings,
    updateSetting: (key, value) => setSettings(prev => ({ ...prev, [key]: value })),
    clearChatHistory: () => setChats(prev => prev.map(c => ({ ...c, messages: [] }))),
    exportChats: (format) => {
      const data = JSON.stringify(chats, null, 2);
      const txt = chats.map(c => {
        const head = `# ${c.title}\n`;
        const body = c.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
        return head + body;
      }).join('\n\n---\n\n');
      const blob = new Blob([format === 'json' ? data : txt], { type: format === 'json' ? 'application/json' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tajai-chats.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    deleteAllData: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_KEY);
        localStorage.removeItem(INDEX_KEY);
        localStorage.removeItem(SETTINGS_KEY);
      } catch {}
      setChats([]);
      setActiveChatId(undefined);
    },
  }), [chats, activeChatId, createNewChat, ensureChat, selectChat, setMessages, addMessage, updateMessage, updateChatTitle, deleteChat, togglePin, isSettingsOpen, settings]);

  return (
    <ChatStoreContext.Provider value={value}>
      {children}
    </ChatStoreContext.Provider>
  );
}

export function useChatStore() {
  const ctx = useContext(ChatStoreContext);
  if (!ctx) throw new Error('useChatStore must be used within ChatStoreProvider');
  return ctx;
}
