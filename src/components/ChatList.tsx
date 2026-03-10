"use client";

import React from 'react';
import { ChatItem, ChatItemData } from './ChatItem';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ChatListProps {
  chats: ChatItemData[];
  search: string;
  onSearch: (v: string) => void;
  onPin: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string) => void;
}

export function ChatList({
  chats,
  search,
  onSearch,
  onPin,
  onRename,
  onDelete,
  collapsed = false,
  onOpenSearch,
}: ChatListProps & { collapsed?: boolean; onOpenSearch?: () => void }) {
  const pathname = usePathname();
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(c => c.title.toLowerCase().includes(q));
  }, [chats, search]);

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-2 custom-scrollbar">
      {!collapsed ? (
        <div className="px-2 pb-2 sticky top-0 bg-transparent backdrop-blur-[6px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="sidebar-search-input"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search chats..."
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-xl",
                "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)]",
                "text-sm text-gray-200 placeholder-gray-400 outline-none"
              )}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpenSearch && onOpenSearch()}
          className="flex items-center justify-center py-2 mt-4"
          title="Search"
        >
          <Search className="w-5 h-5 text-gray-400" />
        </button>
      )}
      {!collapsed && (
        <div className="px-4 mt-2 mb-1 text-xs font-semibold text-gray-200 uppercase tracking-wider">
          Recent Chats
        </div>
      )}
      {filtered.map((chat) => (
        <ChatItem
          key={chat._id}
          chat={chat}
          href={`/chat/${chat._id}`}
          active={pathname === `/chat/${chat._id}`}
          onPin={onPin}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
      {filtered.length === 0 && !collapsed && (
        <div className="px-4 py-8 text-center text-gray-300 text-sm">
          No chats found
        </div>
      )}
    </div>
  );
}
