"use client";

import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function SidebarHeader({ collapsed, onToggle, isMobile }: SidebarHeaderProps) {
  return (
    <div className={cn("px-3 py-3 flex items-center justify-between")}>
      <div className="flex items-center gap-2 flex-1">
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] text-gray-200"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl px-2 py-1 border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.1)] backdrop-blur-[12px]">
              <img src="/TAJ-AI.svg" alt="TAJ AI" className="h-7 w-auto" />
            </div>
            <span className="font-semibold tracking-wide text-white">TAJ AI</span>
          </div>
        )}
      </div>
      {isMobile && <div className="w-9" />} 
    </div>
  );
}
