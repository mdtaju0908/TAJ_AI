"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSections } from './SidebarSections';
import { SidebarFooter } from './SidebarFooter';
import type { ChatItemData } from './ChatItem';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<ChatItemData[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const handler = () => {
      setCollapsed(false);
      setTimeout(() => {
        const el = document.getElementById('sidebar-search-input') as HTMLInputElement | null;
        el?.focus();
      }, 150);
    };
    window.addEventListener('tajai:open-search' as any, handler);
    return () => window.removeEventListener('tajai:open-search' as any, handler);
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch {}
  };

  const onNewChat = async () => {
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
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this chat?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setChats((cur) => cur.filter(c => c._id !== id));
      }
    } catch {}
  };

  const onRename = async (id: string, currentTitle: string) => {
    const title = prompt('Rename chat', currentTitle || 'Untitled');
    if (!title) return;
    const prev = chats;
    setChats(chats.map(c => (c._id === id ? { ...c, title } : c)));
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        setChats(prev);
      } else {
        const updated = await res.json();
        if (updated && updated._id) {
          setChats(cur => cur.map(c => (c._id === id ? { ...c, title: updated.title } : c)));
        }
      }
    } catch {
      setChats(prev);
    }
  };

  const onPin = async (id: string) => {
    const prev = chats;
    setChats(chats => {
      const updated = chats.map(c => c._id === id ? { ...c, pinned: !c.pinned } : c);
      return [...updated].sort((a, b) => {
        const ap = a.pinned ? 1 : 0;
        const bp = b.pinned ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
    });
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${id}/pin`, { method: 'PATCH' });
      if (!res.ok) {
        setChats(prev);
      } else {
        const updated = await res.json();
        setChats(chats => {
          const merged = chats.map(c => c._id === id ? { ...c, pinned: !!updated.pinned } : c);
          return [...merged].sort((a, b) => {
            const ap = a.pinned ? 1 : 0;
            const bp = b.pinned ? 1 : 0;
            if (ap !== bp) return bp - ap;
            return (b.updatedAt || '').localeCompare(a.updatedAt || '');
          });
        });
      }
    } catch {
      setChats(prev);
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 m-3 md:m-4 rounded-2xl transition-all duration-300 ease-in-out",
          "bg-white/10 backdrop-blur-md border border-[rgba(255,255,255,0.1)]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.4)]",
          "md:translate-x-0 flex flex-col justify-between",
          collapsed ? "w-[72px]" : "w-[280px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(v => !v)}
        />
        <SidebarSections
          chats={chats}
          search={search}
          onSearch={setSearch}
          onNewChat={onNewChat}
          onPin={onPin}
          onRename={onRename}
          onDelete={onDelete}
          collapsed={collapsed}
        />
        <SidebarFooter collapsed={collapsed} />
      </div>
    </>
  );
}
