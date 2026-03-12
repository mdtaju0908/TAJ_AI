"use client";

import { Plus } from 'lucide-react';
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
    <div className="flex-1 flex flex-col justify-between overflow-y-hidden">
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onNewChat}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[rgba(59,130,246,0.1)] text-white hover:bg-[rgba(59,130,246,0.2)] transition-all duration-200",
            collapsed && "px-0"
          )}
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">New Chat</span>}
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
