"use client";

import { Pencil } from 'lucide-react';
import { ChatList } from './ChatList';
import type { ChatItemData } from './ChatItem';
import { cn } from '@/lib/utils';

interface SidebarSectionsProps {
  chats: ChatItemData[];
  search: string;
  onSearch: (v: string) => void;
  onNewChat: () => void;
  onPin: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
}

export function SidebarSections({
  chats,
  search,
  onSearch,
  onNewChat,
  onPin,
  onRename,
  onDelete,
  collapsed,
}: SidebarSectionsProps) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="px-4 mb-3">
        <button
          onClick={onNewChat}
          className={cn(
            collapsed
              ? "w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white hover:from-[#1D4ED8] hover:to-[#2563EB] transition-all duration-200"
              : "w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white hover:from-[#1D4ED8] hover:to-[#2563EB] transition-all duration-200 hover:scale-[1.01]"
          )}
          title="New Chat"
        >
          <Pencil className={collapsed ? "w-5 h-5" : "w-5 h-5"} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>
      <ChatList
        chats={chats}
        search={search}
        onSearch={onSearch}
        onPin={onPin}
        onRename={onRename}
        onDelete={onDelete}
        collapsed={collapsed}
        onOpenSearch={() => {
          const event = new CustomEvent('tajai:open-search');
          window.dispatchEvent(event);
        }}
      />
    </div>
  );
}
