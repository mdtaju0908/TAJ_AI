"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, Loader2, Paperclip, Mic, SlidersHorizontal, Image as ImageIcon, Search, FileText } from 'lucide-react';
import { MessageBubble } from './chat/MessageBubble';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type { RouteMode } from '@/lib/aiRouter';
import { AttachmentPreview, Attachment } from './AttachmentPreview';
import { useChatStore, ChatMessage } from '@/hooks/useChatStore';
import toast from 'react-hot-toast';

interface ChatInterfaceProps {
  id?: string;
  initialMessages?: ChatMessage[];
  mode?: RouteMode;
}

export function ChatInterface({ id, initialMessages, mode: routeMode = 'chat' }: ChatInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const { chats, activeChatId, createNewChat, ensureChat, selectChat, setMessages, addMessage, updateMessage, settings } = useChatStore();
  const currentChat = chats.find(c => c.id === activeChatId);
  const messages = currentChat?.messages || [];
  const commandActive = /^\/(image|search|summarize)\b/.test(input.trim());
  const activeCommand = (input.trim().match(/^\/(image|search|summarize)\b/)?.[1] as 'image' | 'search' | 'summarize' | undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [currentChat?.messages, settings.autoScroll]);

  useEffect(() => {
    if (id) {
      ensureChat(id);
      return;
    }
    if (!activeChatId && chats.length > 0) {
      selectChat(chats[0].id);
    }
  }, [id, activeChatId, chats, ensureChat, selectChat]);

  useEffect(() => {
    if (!initialMessages || !currentChat) return;
    if (currentChat.messages.length > 0) return;
    const seeded = initialMessages.map(m => ({ ...m, id: m.id || Math.random().toString(36).slice(2) }));
    setMessages(currentChat.id, seeded);
  }, [initialMessages, currentChat, setMessages]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const onAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).slice(2),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    e.target.value = '';
  };

  const onRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const mockReplies = [
    "Here’s a quick take: I can help you draft, refine, or break this into steps. What do you want to do next?",
    "I can walk through this with you. Share the goal and I’ll propose a clean plan.",
    "Got it. I can help validate details, suggest improvements, or draft a response.",
    "Here’s a concise summary and next steps. Tell me where you want to go deeper.",
  ];

  const buildMockResponse = (content: string) => {
    const base = mockReplies[Math.floor(Math.random() * mockReplies.length)];
    const modePrefix = routeMode !== 'chat' ? `${routeMode.toUpperCase()} • ` : '';
    if (!content) return base;
    return `${modePrefix}${base}\n\nYou said: "${content.slice(0, 120)}${content.length > 120 ? '…' : ''}"`;
  };

  const playSound = () => {
    if (!settings.soundNotification) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 180);
    } catch {}
  };

  const showDesktopNotification = (body: string) => {
    if (!settings.desktopNotifications) return;
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        new Notification('TAJ AI', { body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    } catch {}
  };

  const handleFormSubmit = (e: React.FormEvent, overrideContent?: string) => {
    e.preventDefault();
    const content = (overrideContent || input).trim();
    if (!content && attachments.length === 0) return;

    const chatId = activeChatId || createNewChat();
    const isRegenerate = !!overrideContent;

    const userMsgContent = attachments.length > 0 && !isRegenerate
      ? `${content}\n\n${attachments.map(a => `[${a.name}]`).join(' ')}`
      : content;

    if (!isRegenerate) {
      const userMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: 'user',
        content: userMsgContent,
        timestamp: new Date().toISOString(),
      };
      addMessage(chatId, userMsg);
      setInput("");
      setAttachments([]);
    }

    setIsLoading(true);

    const assistantMsgId = Math.random().toString(36).slice(2);
    addMessage(chatId, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    const delay = 1000 + Math.floor(Math.random() * 1000);
    typingTimeoutRef.current = window.setTimeout(() => {
      updateMessage(chatId, assistantMsgId, buildMockResponse(userMsgContent));
      setIsLoading(false);
      playSound();
      showDesktopNotification('AI response is ready.');
    }, delay);
  };

  const onRegenerate = (id: string) => {
    const assistantMessageIndex = messages.findIndex(m => m.id === id);
    if (assistantMessageIndex > 0) {
      const userMessage = messages[assistantMessageIndex - 1];
      if (userMessage && userMessage.role === 'user') {
        if (currentChat) {
          setMessages(currentChat.id, messages.slice(0, assistantMessageIndex));
        }
        handleFormSubmit(new Event('submit') as any, userMessage.content);
      }
    }
  };

  const onDelete = (id: string) => {
    const messageIndex = messages.findIndex(m => m.id === id);
    if (messageIndex === -1) return;

    const messageToDelete = messages[messageIndex];
    let messagesToDelete = [id];

    if (messageToDelete.role === 'user' && messages[messageIndex + 1]?.role === 'assistant') {
      messagesToDelete.push(messages[messageIndex + 1].id);
    }

    if (!currentChat) return;
    setMessages(currentChat.id, messages.filter(m => !messagesToDelete.includes(m.id)));
  };

  const onEdit = (id: string) => {
    const messageIndex = messages.findIndex(m => m.id === id);
    if (messageIndex === -1 || messages[messageIndex].role !== 'user') return;

    const messageToEdit = messages[messageIndex];
    setInput(messageToEdit.content);

    if (!currentChat) return;
    setMessages(currentChat.id, messages.slice(0, messageIndex));

    const el = document.querySelector('textarea');
    if (el) el.focus();
  };

  return (
    <div 
      className="flex flex-col h-full relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-2xl z-50 flex items-center justify-center">
          <span className="text-white font-semibold text-lg">Drop files to attach</span>
        </div>
      )}
      
      <div ref={containerRef} className="flex-1 overflow-y-auto pt-4 pb-32 md:pt-6 md:pb-40 scroll-smooth">
        <div className="max-w-[850px] mx-auto px-4 md:px-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.25)] flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome to TAJ AI</h2>
              <p className="text-gray-300 max-w-md">
                Smart. Fast. Reliable. Start by typing a message below.
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m as any} onEdit={onEdit} onDelete={onDelete} onRegenerate={onRegenerate} />
                ))}
              </AnimatePresence>
              {settings.typingAnimation && isLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start mb-6">
                   <div className="flex items-start space-x-3 bg-[#262626] rounded-2xl p-4 rounded-bl-none text-white">
                     <Bot className="w-5 h-5 text-[#3B82F6]" />
                     <div className="space-y-2 animate-pulse pt-0.5">
                       <div className="h-3 bg-gray-500 rounded-md w-48"></div>
                       <div className="h-3 bg-gray-500 rounded-md w-32"></div>
                     </div>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent">
          <div className="max-w-[850px] mx-auto relative">
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  key="attachment-preview"
                  className="mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} />
                </motion.div>
              )}
            </AnimatePresence>
            <form
              onSubmit={handleFormSubmit}
              className={`relative flex items-end w-full p-2 bg-[#1e1f20]/90 backdrop-blur-lg border rounded-[32px] shadow-xl focus-within:ring-1 transition-all duration-200 ${commandActive ? 'border-blue-500/50 ring-blue-500/40' : 'border-[#3c3e41] focus-within:border-blue-500/50 focus-within:ring-blue-500/30'}`}
            >
              <div className="flex items-center gap-1.5 pb-2 pl-2">
                <div className="relative" ref={toolsRef}>
                  <button
                    type="button"
                    onClick={() => setIsToolsOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-[#2c2d2e] rounded-full transition-all text-sm font-medium"
                    title="Tools"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Tools</span>
                  </button>
                  <AnimatePresence>
                    {isToolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute left-0 bottom-full mb-2 w-48 rounded-xl border border-white/10 bg-[#141820]/95 backdrop-blur-xl shadow-2xl p-2 z-20"
                      >
                        {[
                          { label: 'Generate image', command: '/image ' },
                          { label: 'Search', command: '/search ' },
                          { label: 'Summarize', command: '/summarize ' },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={() => {
                              setInput(prev => {
                                const base = prev.trim();
                                const replacement = (item as any).command as string;
                                if (!base || base[0] !== '/') return replacement;
                                return replacement + base.replace(/^\/\w+\s*/, '');
                              });
                              setIsToolsOpen(false);
                              const el = document.querySelector('textarea');
                              if (el) el.focus();
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/10 transition-all"
                          >
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={onAttachClick}
                  className="p-2 text-gray-400 hover:text-gray-100 hover:bg-[#2c2d2e] rounded-full transition-all"
                  title="Upload file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-w-0 py-3 px-3 relative">
                {commandActive && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2 text-blue-400">
                    {activeCommand === 'image' && <ImageIcon className="w-4 h-4" />}
                    {activeCommand === 'search' && <Search className="w-4 h-4" />}
                    {activeCommand === 'summarize' && <FileText className="w-4 h-4" />}
                  </div>
                )}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFormSubmit(e as any);
                    }
                  }}
                  onInput={(e) => {
                    const ta = e.currentTarget;
                    ta.style.height = 'auto';
                    ta.style.height = Math.min(200, ta.scrollHeight) + 'px';
                  }}
                  rows={1}
                  placeholder="Message TAJ AI..."
                  className={`w-full bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 resize-none overflow-y-auto max-h-[200px] leading-relaxed custom-scrollbar ${settings.fontSize === 'sm' ? 'text-[14px]' : settings.fontSize === 'lg' ? 'text-[18px]' : 'text-[16px]'} ${commandActive ? 'pl-10' : ''}`}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center gap-1.5 pb-2 pr-2">
                <button
                  type="button"
                  onClick={() => toast('Voice input is coming soon')}
                  className="p-2 text-gray-400 hover:text-gray-100 hover:bg-[#2c2d2e] rounded-full transition-all"
                  title="Use Microphone"
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  type="submit"
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  className={cn(
                    "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
                    (!input.trim() && attachments.length === 0) || isLoading
                      ? "bg-transparent text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-md hover:scale-105"
                  )}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
            <input ref={fileInputRef} type="file" multiple accept="*/*" className="hidden" onChange={onFileSelected} />
            <p className="text-[10px] text-center text-gray-500 mt-2">
              TAJ AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
    </div>
  );
}
