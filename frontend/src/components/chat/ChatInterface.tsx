"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, Paperclip, Mic, SlidersHorizontal, Image as ImageIcon, Search, FileText } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type { RouteMode } from '../../lib/aiRouter';
import { AttachmentPreview, Attachment } from './AttachmentPreview';
import { useChatStore } from '../../stores/chatStore';
import { useShallow } from 'zustand/react/shallow';
import { useChat } from '../../hooks/useChat';
import type { Message } from '../../types/message';
import { Button } from '../ui/Button';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../stores/settingsStore';

interface ChatInterfaceProps {
  id?: string;
  initialMessages?: Message[];
  mode?: RouteMode;
}

const TOOLS = [
  { id: 'image', icon: ImageIcon, label: 'Generate Image', description: 'Create an image from text' },
  { id: 'search', icon: Search, label: 'Web Search', description: 'Search the web for info' },
  { id: 'summarize', icon: FileText, label: 'Summarize', description: 'Summarize text or content' },
];

export function ChatInterface({ id, initialMessages, mode: routeMode = 'chat' }: ChatInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [input, setInput] = useState<string>("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuth();
  const { guestMessageCount, incrementGuestMessageCount, setShowAuthModal } = useUIStore();
  const settings = useSettingsStore();
  
  const { 
    chats, 
    activeChatId, 
    createChat, 
    setActiveChat,
    addMessage,
    setMessages,
  } = useChatStore(
    useShallow((state: any) => ({
      chats: state.chats,
      activeChatId: state.activeChatId,
      createChat: state.createChat,
      setActiveChat: state.setActiveChat,
      addMessage: state.addMessage,
      setMessages: state.setMessages,
    }))
  );

  const effectiveChatId = id || activeChatId || "";
  const { messages, isLoading, sendMessage, cancel, retry, editUserMessage } = useChat(effectiveChatId);
  const currentChat = chats.find((c: any) => c.id === effectiveChatId);

  // Command detection
  const commandMatch = input.match(/^\/(\w*)$/);
  const showCommandMenu = !!commandMatch;
  const commandFilter = commandMatch ? commandMatch[1].toLowerCase() : "";

  useEffect(() => {
    const el = containerRef.current;
    if (el && settings.autoScroll) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, settings.autoScroll]);

  useEffect(() => {
    if (id) {
      setActiveChat(id);
      return;
    }
    if (!activeChatId && chats.length > 0) {
      setActiveChat(chats[0].id);
    } else if (!activeChatId && chats.length === 0) {
      createChat();
    }
  }, [id, activeChatId, chats, setActiveChat, createChat]);

  // Seed initial messages if provided and chat is empty
  useEffect(() => {
    if (!initialMessages || !currentChat) return;
    if (currentChat.messages.length > 0) return;
    
    // Ensure seeding only happens once
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
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleToolSelect = (toolId: string) => {
    setInput(`/${toolId} `);
    setIsToolsOpen(false);
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    if (!isAuthenticated) {
      incrementGuestMessageCount();
      if (guestMessageCount >= 5) { // Allow some guest usage
        setShowAuthModal(true);
        return;
      }
    }

    let chatId = effectiveChatId;
    if (!chatId) {
       chatId = createChat();
    }

    const content = input;
    setInput("");
    setAttachments([]);
    
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const onEdit = (id: string) => {
    const messageIndex = messages.findIndex(m => m.id === id);
    if (messageIndex === -1 || messages[messageIndex].role !== 'user') return;

    const messageToEdit = messages[messageIndex];
    setInput(messageToEdit.content);
    editUserMessage(id, messageToEdit.content); 
    
    const el = document.querySelector('textarea');
    if (el) el.focus();
  };

  const onDelete = (id: string) => {
    // Placeholder for delete logic
    console.log("Delete message", id);
  };

  const onRegenerate = (id: string) => {
    retry();
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
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-2xl z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none">
          <span className="text-white font-semibold text-lg bg-black/50 px-4 py-2 rounded-lg">Drop files to attach</span>
        </div>
      )}
      
      <div ref={containerRef} className="flex-1 overflow-y-auto pt-4 pb-32 md:pt-6 md:pb-40 scroll-smooth custom-scrollbar">
        <div className="max-w-[850px] mx-auto px-4 md:px-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.25)] flex items-center justify-center mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome to TAJ AI</h2>
              <p className="text-gray-300 max-w-md">
                Smart. Fast. Reliable. Start by typing a message below or select a tool.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl mt-8">
                {TOOLS.map((tool) => (
                   <button 
                     key={tool.id}
                     onClick={() => handleToolSelect(tool.id)}
                     className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                   >
                     <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                       <tool.icon className="w-5 h-5" />
                     </div>
                     <div className="text-center">
                       <div className="font-medium text-white text-sm">{tool.label}</div>
                       <div className="text-xs text-gray-400 mt-1">{tool.description}</div>
                     </div>
                   </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((m) => (
                  <MessageBubble 
                    key={m.id} 
                    message={m} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    onRegenerate={onRegenerate} 
                  />
                ))}
              </AnimatePresence>
              {settings.typingAnimation && isLoading && (
                <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex items-center space-x-2 bg-[#1e293b] rounded-2xl px-4 py-3 rounded-bl-none text-white border border-white/5">
                     <Bot className="w-4 h-4 text-blue-400" />
                     <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                     </div>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-20">
          <div className="max-w-[850px] mx-auto relative">
            <AnimatePresence>
               {showCommandMenu && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute bottom-full left-0 mb-2 w-64 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                 >
                   <div className="p-1">
                     {TOOLS.filter(t => t.id.startsWith(commandFilter)).map((tool, i) => (
                       <button
                         key={tool.id}
                         onClick={() => handleToolSelect(tool.id)}
                         className={cn(
                           "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/10 transition-colors",
                           i === 0 && "bg-white/5"
                         )}
                       >
                         <tool.icon className="w-4 h-4 text-blue-400" />
                         <span>/{tool.id}</span>
                         <span className="ml-auto text-xs text-gray-500">{tool.label}</span>
                       </button>
                     ))}
                   </div>
                 </motion.div>
               )}
            </AnimatePresence>

            {attachments.length > 0 && (
              <AttachmentPreview attachments={attachments} onRemove={onRemoveAttachment} />
            )}

            <form onSubmit={handleFormSubmit} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-end p-2 shadow-2xl transition-all focus-within:border-blue-500/50 focus-within:bg-[#1e293b]">
                <div className="flex items-center gap-1 pb-2 pl-1">
                   <div className="relative" ref={toolsRef}>
                     <Button
                       type="button"
                       variant="ghost"
                       size="icon"
                       onClick={() => setIsToolsOpen(!isToolsOpen)}
                       className={cn("text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors", isToolsOpen && "text-blue-400 bg-blue-500/10")}
                       title="Tools"
                     >
                       <SlidersHorizontal className="w-5 h-5" />
                     </Button>
                     <AnimatePresence>
                       {isToolsOpen && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95, y: 10 }}
                           animate={{ opacity: 1, scale: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95, y: 10 }}
                           className="absolute bottom-full left-0 mb-2 w-56 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden p-1 z-30"
                         >
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</div>
                            {TOOLS.map(tool => (
                              <button
                                key={tool.id}
                                onClick={() => handleToolSelect(tool.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/10 transition-colors text-left"
                              >
                                <tool.icon className="w-4 h-4 text-blue-400" />
                                {tool.label}
                              </button>
                            ))}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                   
                   <Button
                     type="button"
                     variant="ghost"
                     size="icon"
                     onClick={onAttachClick}
                     className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                     title="Attach file"
                   >
                     <Paperclip className="w-5 h-5" />
                   </Button>
                   <input
                     type="file"
                     ref={fileInputRef}
                     onChange={onFileSelected}
                     className="hidden"
                     multiple
                   />
                </div>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... (Type / for tools)"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 resize-none max-h-32 min-h-[50px] py-3 px-2 custom-scrollbar"
                  rows={1}
                />
                
                <div className="pb-2 pr-1">
                  <Button
                    type="submit"
                    disabled={(!input.trim() && attachments.length === 0) || isLoading}
                    className={cn(
                      "rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-200",
                      input.trim() || attachments.length > 0 
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                        : "bg-white/5 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? <Bot className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </form>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-500">
                TAJ AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}
