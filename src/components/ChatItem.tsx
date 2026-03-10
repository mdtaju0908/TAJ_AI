"use client";

import Link from 'next/link';
import { MessageSquare, Pin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatItemData {
  _id: string;
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
}

export function ChatItem({ chat, href, active, onPin, onRename, onDelete }: ChatItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-300",
        "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[20px]",
        active
          ? "text-white shadow-[0_8px_32px_rgba(0,0,0,0.25),0_0_12px_rgba(59,130,246,0.25)]"
          : "text-gray-200 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.25),0_0_12px_rgba(59,130,246,0.25)]"
      )}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span className="truncate">{chat.title}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPin(chat._id); }}
          className={cn(
            "p-1 text-gray-400 hover:text-yellow-400 transition-opacity",
            chat.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          title={chat.pinned ? "Unpin chat" : "Pin chat"}
        >
          <Pin className={cn("w-4 h-4", chat.pinned ? "fill-yellow-400" : "")} />
        </button>
        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-opacity"
            title="More"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(chat._id, chat.title); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-400 transition-opacity"
          title="Rename"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(chat._id); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );
}

