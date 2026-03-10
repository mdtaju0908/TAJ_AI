"use client";
 
 import { Menu } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface SidebarHeaderProps {
   collapsed: boolean;
   onToggle: () => void;
 }
 
 export function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
   return (
     <div className={cn("px-3 py-3 flex items-center justify-between")}>
       <button
         onClick={onToggle}
         className="p-2 rounded-lg hover:bg-white/10 text-gray-200"
         title={collapsed ? "Expand" : "Collapse"}
       >
         <Menu className="w-5 h-5" />
       </button>
       {!collapsed && (
         <div className="flex items-center gap-2">
           <div className="flex items-center rounded-xl px-2 py-1 border border-[rgba(255,255,255,0.15)] bg-white/10 backdrop-blur-[12px]">
             <img src="/logo.png" alt="TAJ AI" className="h-7 w-auto" />
           </div>
           <span className="font-semibold tracking-wide text-white">TAJ AI</span>
         </div>
       )}
       <div className="w-9" />
     </div>
   );
 }
