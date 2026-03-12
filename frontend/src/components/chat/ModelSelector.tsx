 "use client";
 
 import Link from 'next/link';
 import { usePathname } from 'next/navigation';
 import { cn } from '@/lib/utils';
 import { useChatStore } from '@/stores/chatStore';
 
 const items = [
   { href: '/chat', label: 'Chat' },
   { href: '/image', label: 'Image' },
   { href: '/code', label: 'Code' },
   { href: '/research', label: 'Research' },
 ];

const models = [
  { id: 'gpt-4o-mini', label: 'OpenAI GPT-4o Mini' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash ✦' },
  { id: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
];
 
 export function ModelSelector() {
   const pathname = usePathname();
   const { selectedModel, setSelectedModel } = useChatStore((state) => ({
    selectedModel: state.selectedModel,
    setSelectedModel: state.setSelectedModel,
   }));

   return (
     <div className="flex flex-col gap-3 p-2">
       <div className="flex items-center gap-2 flex-wrap">
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

       <div className="flex items-center gap-2 flex-wrap">
         {models.map((model) => (
           <button
             key={model.id}
             type="button"
             onClick={() => setSelectedModel(model.id)}
             className={cn(
               'text-xs px-3 py-1 rounded-full border transition-all',
               selectedModel === model.id
                 ? 'bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.45)] text-white shadow-[0_0_18px_rgba(16,185,129,0.22)]'
                 : 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.12)] text-gray-200 hover:bg-[rgba(255,255,255,0.1)]'
             )}
           >
             {model.label}
           </button>
         ))}
       </div>
     </div>
   );
 }
 
