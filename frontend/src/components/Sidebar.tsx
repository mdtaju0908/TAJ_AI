"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSections } from './SidebarSections';
import { SidebarFooter } from './SidebarFooter';
import { useChatStore } from '@/hooks/useChatStore';

export function Sidebar({ 
  isOpen, 
  onClose, 
  isMobile,
  collapsed,
  onToggle
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  isMobile: boolean;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [search, setSearch] = useState('');
  const { chats, createNewChat, updateChatTitle, deleteChat, togglePin } = useChatStore();
  const router = useRouter();

  const onNewChat = async () => {
    const id = createNewChat();
    onClose();
    router.push(`/chat/${id}`);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this chat?')) return;
    deleteChat(id);
  };

  const onRename = async (id: string, currentTitle: string) => {
    const title = prompt('Rename chat', currentTitle || 'Untitled');
    if (!title) return;
    updateChatTitle(id, title);
  };

  const onPin = async (id: string) => {
    togglePin(id);
  };

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}
      <div
        className={cn(
          "h-full bg-[#0f172a]/80 backdrop-blur-xl border-r border-[rgba(59,130,246,0.2)]",
          "transition-all duration-300 ease-in-out",
          isMobile
            ? `fixed inset-y-0 left-0 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-[280px]`
            : `fixed inset-y-0 left-0 z-50 ${collapsed ? 'w-[70px]' : 'w-[260px]'}`,
          "flex flex-col justify-between"
        )}
      >
        <SidebarHeader
          collapsed={collapsed}
          onToggle={onToggle}
          isMobile={isMobile}
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
