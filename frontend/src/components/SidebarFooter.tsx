"use client";

import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';

export function SidebarFooter({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { openSettings } = useChatStore();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="px-3 py-3 border-t border-[rgba(59,130,246,0.2)]">
      <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <button onClick={openSettings} className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] text-gray-300 hover:text-white" title="Settings">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] text-gray-300 hover:text-white" title="Toggle theme">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
      </div>
    </div>
  );
}
