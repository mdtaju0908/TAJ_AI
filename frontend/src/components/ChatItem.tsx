"use client";

import Link from 'next/link';
import { MessageSquare, Pin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export interface ChatItemData {
  id: string;
  title: string;
  pinned?: boolean;
  updatedAt?: string;
}

interface ChatItemProps {
  chat: ChatItemData;
  href: string;
  active?: boolean;
  onPin: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string) => void;
  collapsed?: boolean;
}

export function ChatItem({ chat, href, active, onPin, onRename, onDelete, collapsed = false }: ChatItemProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <Link
      href={href}
      title={collapsed ? chat.title : undefined}
      className={cn(
        "group flex items-center p-2 rounded-lg text-sm transition-all duration-200",
        "hover:bg-[rgba(59,130,246,0.1)]",
        active
          ? "bg-[rgba(59,130,246,0.2)] text-white"
          : "text-gray-300 hover:text-white",
        collapsed ? "justify-center" : "justify-between"
      )}
    >
      <div className={cn("flex items-center space-x-3 overflow-hidden", collapsed && "space-x-0")}>
        <MessageSquare className="w-4 h-4 shrink-0" />
        {!collapsed && <span className="truncate">{chat.title}</span>}
      </div>
      {!collapsed && (
        <div className="flex items-center gap-1">
          {chat.pinned && <Pin className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(v => !v);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white rounded-md hover:bg-[rgba(59,130,246,0.1)]"
              title="More"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1f2937] border border-[rgba(59,130,246,0.2)] rounded-lg shadow-lg z-10 p-1">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPin(chat.id); setMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-[rgba(59,130,246,0.1)] rounded-md"
                >
                  <Pin className="w-4 h-4" />
                  <span>{chat.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(chat.id, chat.title); setMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-[rgba(59,130,246,0.1)] rounded-md"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <div className="my-1 h-[1px] bg-[rgba(59,130,246,0.2)]" />
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(chat.id); setMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-400 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
