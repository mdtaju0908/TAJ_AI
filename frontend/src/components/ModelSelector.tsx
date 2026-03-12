 "use client";
 
 import Link from 'next/link';
 import { usePathname } from 'next/navigation';
 import { cn } from '@/lib/utils';
 
 const items = [
   { href: '/chat', label: 'Chat' },
   { href: '/image', label: 'Image' },
   { href: '/code', label: 'Code' },
   { href: '/research', label: 'Research' },
 ];
 
 export function ModelSelector() {
   const pathname = usePathname();
   return (
     <div className="flex items-center gap-2 p-2">
       {items.map((it) => {
         const active = pathname === it.href;
         return (
           <Link
             key={it.href}
             href={it.href}
             className={cn(
               'text-xs px-3 py-1 rounded-full border transition-all',
               active
                 ? 'bg-[rgba(59,130,246,0.25)] border-[rgba(59,130,246,0.4)] text-white shadow-[0_0_18px_rgba(59,130,246,0.25)]'
                 : 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.12)] text-gray-200 hover:bg-[rgba(255,255,255,0.1)]'
             )}
           >
             {it.label}
           </Link>
         );
       })}
     </div>
   );
 }
 
