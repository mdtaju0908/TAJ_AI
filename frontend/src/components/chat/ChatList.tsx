"use client";

import React from 'react';
import { ChatItem, ChatItemData } from './ChatItem';
import { cn } from '@/lib/utils';
import { Search, Pin } from 'lucide-react';
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
  const { pinned, recent } = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = !q ? chats : chats.filter(c => c.title.toLowerCase().includes(q));
    return {
      pinned: filtered.filter(c => c.pinned),
      recent: filtered.filter(c => !c.pinned),
    };
  }, [chats, search]);

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
      {!collapsed ? (
        <div className="px-2 pb-2 sticky top-0 bg-gradient-to-b from-[#0f172a] via-[#0f172a]/90 to-transparent z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="sidebar-search-input"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search chats..."
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-lg",
                "bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]",
                "text-sm text-gray-200 placeholder-gray-400 outline-none focus:ring-1 focus:ring-[rgba(59,130,246,0.5)]"
              )}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpenSearch && onOpenSearch()}
          className="w-full flex items-center justify-center py-2 mt-4 text-gray-300 hover:text-white hover:bg-[rgba(59,130,246,0.1)] rounded-lg"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      )}
      
      {!collapsed && pinned.length > 0 && (
        <div className="px-2 mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Pin className="w-3 h-3" /> Pinned
        </div>
      )}
      {pinned.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          href={`/chat/${chat.id}`}
          active={pathname === `/chat/${chat.id}`}
          onPin={onPin}
          onRename={onRename}
          onDelete={onDelete}
          collapsed={collapsed}
        />
      ))}

      {!collapsed && recent.length > 0 && (
        <div className="px-2 mt-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Recent
        </div>
      )}
      {recent.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          href={`/chat/${chat.id}`}
          active={pathname === `/chat/${chat.id}`}
          onPin={onPin}
          onRename={onRename}
          onDelete={onDelete}
          collapsed={collapsed}
        />
      ))}
      
      {chats.length === 0 && !collapsed && (
        <div className="px-4 py-8 text-center text-gray-400 text-sm">
          No chats yet
        </div>
      )}
    </div>
  );
}
