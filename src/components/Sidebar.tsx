"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, MessageSquare, Trash2, Menu, X, Settings, Pencil } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface Chat {
  _id: string;
  title: string;
  updatedAt: string;
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchChats();
  }, [pathname]); // Refresh when path changes (e.g. new chat created)

  const fetchChats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Failed to load chats', error);
    }
  };

  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/chat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChats(chats.filter(c => c._id !== id));
        if (pathname === `/chat/${id}`) {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Failed to delete chat', error);
    }
  };

  const renameChat = async (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const title = prompt('Rename chat', currentTitle || 'Untitled');
    if (!title) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setChats(chats.map(c => (c._id === id ? { ...c, title } : c)));
      }
    } catch (error) {
      console.error('Failed to rename chat', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] m-3 md:m-4 rounded-2xl shadow-lg transform transition-transform duration-200 ease-in-out",
        "bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.15)]",
        "md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center rounded-xl p-2 border border-[rgba(255,255,255,0.15)] bg-white/10 backdrop-blur-[12px] shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] transition-shadow">
              <img src="/logo.png" alt="TAJ AI" className="h-10 w-auto" />
            </div>
            <span className="font-bold text-white tracking-wide">TAJ AI</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-4">
          <button 
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl transition-colors text-white"
            onClick={async () => {
              try {
                const res = await fetch('http://localhost:5000/api/chats', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: 'New Chat' }),
                });
                if (res.ok) {
                  const data = await res.json();
                  onClose();
                  router.push(`/chat/${data._id}`);
                } else {
                  router.push('/');
                }
              } catch {
                router.push('/');
              }
            }}
          >
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] shadow-[0_0_30px_rgba(59,130,246,0.25)]">
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </div>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <div className="px-2 py-1 text-xs font-semibold text-gray-200 uppercase tracking-wider">
            Recent Chats
          </div>
          {chats.map((chat) => (
            <Link
              key={chat._id}
              href={`/chat/${chat._id}`}
              onClick={onClose}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
                pathname === `/chat/${chat._id}`
                  ? "bg-white/10 text-white"
                  : "text-gray-200 hover:bg-white/10"
              )}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => renameChat(e, chat._id, chat.title)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-400 transition-opacity"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => deleteChat(e, chat._id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
          {chats.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-300 text-sm">
              No chats yet. Start a new conversation!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-200">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
