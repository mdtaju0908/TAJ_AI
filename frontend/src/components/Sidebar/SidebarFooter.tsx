"use client";

import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../ui/Button';

export function SidebarFooter({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const setSettingsOpen = useUIStore((state) => state.setSettingsOpen);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="px-3 py-3 border-t border-[rgba(59,130,246,0.2)]">
      <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <Button 
            onClick={() => setSettingsOpen(true)} 
            variant="ghost"
            className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] text-gray-300 hover:text-white" 
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            onClick={toggleTheme} 
            variant="ghost"
            className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] text-gray-300 hover:text-white" 
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
        
      </div>
    </div>
  );
}
