"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, Loader2, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  id?: string;
  initialMessages?: { id?: string; role: 'user' | 'assistant'; content: string }[];
}

export function ChatInterface({ id, initialMessages }: ChatInterfaceProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string | undefined>(id);
  const [approxTokens, setApproxTokens] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>(
    (initialMessages || []).map(m => ({
      id: m.id || Math.random().toString(36).slice(2),
      role: m.role,
      content: m.content,
    }))
  );
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // If id prop changes, update internal state
  useEffect(() => {
    if (id) setChatId(id);
  }, [id]);

  // Persist to localStorage
  useEffect(() => {
    const key = chatId ? `tajai.chat.${chatId}` : 'tajai.chat.local';
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {}
  }, [messages, chatId]);

  const onAttachClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt') {
      const text = await file.text();
      setMessages(prev => [
        ...prev,
        { id: Math.random().toString(36).slice(2), role: 'user', content: `File: ${file.name}\n\n${text}` },
      ]);
    } else {
      alert('Only .txt files supported currently.');
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;
    const userMsg = { id: Math.random().toString(36).slice(2), role: 'user' as const, content };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/chat-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], chatId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chatId && data.chatId !== chatId) {
          setChatId(data.chatId);
          try {
            window.history.replaceState({}, '', `/chat/${data.chatId}`);
          } catch {}
        }
        const assistantMsg = { id: Math.random().toString(36).slice(2), role: 'assistant' as const, content: data.reply || '' };
        setMessages(prev => [...prev, assistantMsg]);
        const contentLength = (assistantMsg.content || '').length;
        setApproxTokens(prev => prev + Math.ceil(contentLength / 4));
      } else {
        alert('Failed to send message');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.25)] flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome to TAJ AI</h2>
            <p className="text-gray-300 max-w-md">
              Smart. Fast. Reliable. Start by typing a message below.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role as 'user' | 'assistant'}
              content={m.content}
              onEdit={(text) => setInput(text)}
            />
          ))
        )}
        {isLoading && (
           <div className="flex justify-start mb-6">
             <div className="flex items-center space-x-2 bg-[rgba(255,255,255,0.07)] backdrop-blur-[15px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-4 rounded-bl-none text-white">
               <Loader2 className="w-5 h-5 animate-spin text-[#3B82F6]" />
               <span className="text-sm text-gray-300">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-center bg-[rgba(255,255,255,0.07)] backdrop-blur-[15px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-[14px]">
            <button
              type="button"
              className="absolute left-3 text-gray-300 hover:text-white transition-colors"
              title="Attach file (Coming soon)"
              onClick={onAttachClick}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message TAJ AI..."
              className="w-full pl-12 pr-12 bg-transparent border-none focus:outline-none text-white placeholder-gray-300"
              disabled={isLoading}
            />

            <div className="absolute right-3 flex items-center space-x-2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_30px_rgba(59,130,246,0.25)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={onFileSelected} />
        </div>
      </div>
    </div>
  );
}
