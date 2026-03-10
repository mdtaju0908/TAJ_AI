 "use client";
 
 import React, { useEffect, useRef, useState } from 'react';
 import { Send, Bot, Loader2, SlidersHorizontal, Paperclip, FileText, Image as ImageIcon, Brain, Search, Microscope, Mic } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type { RouteMode } from '@/lib/aiRouter';

interface ChatInterfaceProps {
  id?: string;
  initialMessages?: { id?: string; role: 'user' | 'assistant'; content: string; images?: string[] }[];
  mode?: RouteMode;
}

export function ChatInterface({ id, initialMessages, mode: routeMode = 'chat' }: ChatInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string | undefined>(id);
  const [approxTokens, setApproxTokens] = useState<number>(0);
  const userIdRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modeButtonRef = useRef<HTMLButtonElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; images?: string[] }>>(
    (initialMessages || []).map(m => ({
      id: m.id || Math.random().toString(36).slice(2),
      role: m.role,
      content: m.content,
      images: m.images,
    }))
  );
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'fast' | 'thinking' | 'research' | 'search'>('fast');
  const [modeMenuOpen, setModeMenuOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const [attachments, setAttachments] = useState<Array<{ id: string; kind: 'text' | 'image'; name: string; url?: string }>>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      const k = 'tajai.userId';
      const existing = localStorage.getItem(k);
      if (existing) {
        userIdRef.current = existing;
      } else {
        const uid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(k, uid);
        userIdRef.current = uid;
      }
    } catch {
      userIdRef.current = 'anonymous';
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!modeMenuOpen) return;
      const target = e.target as Node;
      if (modeMenuRef.current?.contains(target) || modeButtonRef.current?.contains(target)) return;
      setModeMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [modeMenuOpen]);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setInput(prev => (prev ? prev + ' ' + text : text));
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    recognitionRef.current = rec;
  }, []);

  const onMicClick = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isRecording) {
      try { rec.stop(); } catch {}
      setIsRecording(false);
      return;
    }
    try {
      setIsRecording(true);
      rec.start();
    } catch {
      setIsRecording(false);
    }
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
      setAttachments(prev => [
        ...prev,
        { id: Math.random().toString(36).slice(2), kind: 'text', name: file.name },
      ]);
    } else if (ext && ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      const url = URL.createObjectURL(file);
      setAttachments(prev => [
        ...prev,
        { id: Math.random().toString(36).slice(2), kind: 'image', name: file.name, url },
      ]);
    } else {
      alert('Supported: .txt, .png, .jpg, .jpeg, .webp');
    }
    e.target.value = '';
  };

  const buildHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userIdRef.current) headers['x-user-id'] = userIdRef.current;
    return headers;
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
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ message: content, mode: routeMode }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {}
      if (!res.ok) {
        alert((data && data.error) ? String(data.error) : 'Failed to send message');
        return;
      }
      if (data?.success !== true) {
        alert('AI service error');
        return;
      }
      if (Array.isArray(data.images) && data.images.length > 0) {
        const assistantImg = { id: Math.random().toString(36).slice(2), role: 'assistant' as const, content: '', images: data.images };
        setMessages(prev => [...prev, assistantImg]);
      } else {
        const assistantMsg = { id: Math.random().toString(36).slice(2), role: 'assistant' as const, content: data.reply || '' };
        setMessages(prev => [...prev, assistantMsg]);
        const contentLength = (assistantMsg.content || '').length;
        setApproxTokens(prev => prev + Math.ceil(contentLength / 4));
        if (data.audioUrl && typeof data.audioUrl === 'string') {
          try {
            const audio = new Audio(data.audioUrl);
            await audio.play();
          } catch {}
        }
      }
    } catch {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3">
        <div className="inline-flex items-center gap-2 text-xs text-blue-200 px-3 py-1 rounded-full bg-[rgba(59,130,246,0.2)] border border-[rgba(59,130,246,0.3)] shadow-[0_0_18px_rgba(59,130,246,0.25)]">
          <span>Mode</span>
          <span className="font-semibold capitalize">{routeMode}</span>
        </div>
      </div>
      {/* Messages Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
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
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                layout
              >
                <MessageBubble
                  id={m.id}
                  role={m.role as 'user' | 'assistant'}
                  content={m.content}
                  images={m.images}
                  onEdit={(text) => setInput(text)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="flex items-center space-x-3 bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-4 rounded-bl-none text-white shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.25)]">
              <div className="relative">
                <Bot className="w-5 h-5 text-[#3B82F6]" />
                <div className="absolute inset-0 rounded-full blur-[8px] animate-pulse" />
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-[#3B82F6]" />
              <span className="text-sm text-gray-300">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4">
        <div className="max-w-3xl mx-auto relative">
          {attachments.length > 0 && (
            <div className="w-full mb-3 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(15,17,24,0.85)] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(59,130,246,0.2)] p-3">
              <div className="flex items-stretch gap-3">
                {attachments
                  .filter(a => a.kind === 'text')
                  .slice(0, 1)
                  .map(a => (
                    <div key={a.id} className="flex-1 min-w-[180px] max-w-[260px] rounded-xl bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)] text-blue-100 p-3 flex flex-col items-center">
                      <div className="w-full text-xs font-semibold truncate mb-2">{a.name}</div>
                      <div className="flex flex-col items-center justify-center rounded-lg bg-[rgba(59,130,246,0.18)] border border-[rgba(59,130,246,0.35)] w-full h-28">
                        <FileText className="w-6 h-6 mb-2 text-blue-200" />
                        <span className="text-sm font-bold tracking-wide">TXT</span>
                      </div>
                    </div>
                  ))}
                {attachments
                  .filter(a => a.kind === 'image')
                  .slice(0, 1)
                  .map(a => (
                    <div key={a.id} className="w-28 h-28 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center">
                      {a.url ? (
                        <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative flex items-center bg-[rgba(10,10,10,0.78)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_24px_rgba(59,130,246,0.25)]">
            <div className="absolute left-3 flex items-center gap-2">
              <button
                type="button"
                ref={modeButtonRef}
                className="text-gray-200 hover:text-white transition-all px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] hover:shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                title="Tools"
                onClick={() => setModeMenuOpen(prev => !prev)}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="text-sm">Tools</span>
                </div>
              </button>
              <button
                type="button"
                onClick={onAttachClick}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-gray-100 hover:shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                title="Upload file or photo"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            <div
              ref={modeMenuRef}
              className={cn(
                "absolute left-3 bottom-full mb-3 w-64 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#0a0a0a]/85 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_24px_rgba(59,130,246,0.2)] p-2 transition-all duration-200",
                modeMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <button
                type="button"
                onClick={() => { setMode('thinking'); setModeMenuOpen(false); }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-white transition-all duration-200",
                  mode === 'thinking'
                    ? "bg-[rgba(59,130,246,0.2)] ring-1 ring-[rgba(59,130,246,0.35)]"
                    : "hover:bg-[rgba(255,255,255,0.06)]"
                )}
              >
                <Brain className="w-4 h-4 text-blue-300" />
                <span>Thinking</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('research'); setModeMenuOpen(false); }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-white transition-all duration-200",
                  mode === 'research'
                    ? "bg-[rgba(59,130,246,0.2)] ring-1 ring-[rgba(59,130,246,0.35)]"
                    : "hover:bg-[rgba(255,255,255,0.06)]"
                )}
              >
                <Microscope className="w-4 h-4 text-blue-300" />
                <span>Deep Research</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('search'); setModeMenuOpen(false); }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-white transition-all duration-200",
                  mode === 'search'
                    ? "bg-[rgba(59,130,246,0.2)] ring-1 ring-[rgba(59,130,246,0.35)]"
                    : "hover:bg-[rgba(255,255,255,0.06)]"
                )}
              >
                <Search className="w-4 h-4 text-blue-300" />
                <span>Web Search</span>
              </button>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={(e) => {
                const ta = e.currentTarget;
                ta.style.height = 'auto';
                ta.style.height = Math.min(200, ta.scrollHeight) + 'px';
              }}
              rows={1}
              placeholder="Message TAJ AI..."
              className="w-full pl-52 pr-44 bg-transparent border-none focus:outline-none text-white placeholder-gray-300 resize-none"
              disabled={isLoading}
            />

            <div className="absolute right-3 flex items-center space-x-2">
              <button
                type="button"
                className={cn(
                  "p-2 rounded-full text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[10px]",
                  isRecording && "ring-2 ring-blue-400 animate-pulse"
                )}
                title={isRecording ? "Stop recording" : "Start voice input"}
                onClick={onMicClick}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <input ref={fileInputRef} type="file" accept=".txt,.png,.jpg,.jpeg,.webp" className="hidden" onChange={onFileSelected} />
        </div>
      </div>
    </div>
  );
}
