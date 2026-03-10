 "use client";
 
 import { Settings, HelpCircle, Sun, Moon } from 'lucide-react';
 import { useTheme } from 'next-themes';
 
 export function SidebarFooter({ collapsed = false }: { collapsed?: boolean }) {
   const { theme, setTheme } = useTheme();
   const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
 
  return (
    <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.1)] sticky bottom-0 bg-transparent">
       <div className={collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between"}>
         <button
           className={collapsed ? "p-2 rounded-lg hover:bg-white/10 text-gray-200" : "flex items-center gap-2 text-sm text-gray-200 hover:text-white"}
           title="Settings"
         >
           <Settings className="w-4 h-4" />
           {!collapsed && <span>Settings</span>}
         </button>
         <button
           className={collapsed ? "p-2 rounded-lg hover:bg-white/10 text-gray-200" : "flex items-center gap-2 text-sm text-gray-200 hover:text-white"}
           title="Help"
         >
           <HelpCircle className="w-4 h-4" />
           {!collapsed && <span>Help</span>}
         </button>
         <button
           onClick={toggleTheme}
           className="p-2 rounded-lg hover:bg-white/10 text-gray-200"
           title="Toggle theme"
         >
           {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
         </button>
       </div>
     </div>
   );
 }
