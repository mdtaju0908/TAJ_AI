"use client";

import { Bot, User, Copy, ThumbsUp, ThumbsDown, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export function MessageBubble({ id, role, content, images, timestamp, onEdit, onDelete, onRegenerate }: MessageBubbleProps) {
  const isUser = role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-start gap-4 w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div className={cn(
        "group relative max-w-[85%] md:max-w-[75%] p-4 rounded-2xl",
        isUser
          ? "bg-blue-600 text-white rounded-br-none"
          : "bg-[#262626] text-gray-200 rounded-bl-none"
      )}>
        <ReactMarkdown
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <div className="relative my-2 bg-[#1e1e1e] rounded-md overflow-hidden">
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                  <button 
                    onClick={() => navigator.clipboard.writeText(String(children))}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <code className={cn("px-1 py-0.5 bg-white/10 rounded-sm", className)} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
        {images && images.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {images.map((img, i) => (
              <img key={i} src={img} alt="" className="rounded-lg w-full h-auto" />
            ))}
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isUser ? (
            <>
              <button onClick={() => onEdit(id)} className="p-1.5 rounded-md hover:bg-white/20"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => onDelete(id)} className="p-1.5 rounded-md hover:bg-white/20"><Trash2 className="w-4 h-4" /></button>
            </>
          ) : (
            <>
              <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-white/20"><Copy className="w-4 h-4" /></button>
              <button onClick={() => onRegenerate(id)} className="p-1.5 rounded-md hover:bg-white/20"><RefreshCw className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-md hover:bg-white/20"><ThumbsUp className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-md hover:bg-white/20"><ThumbsDown className="w-4 h-4" /></button>
            </>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2 text-right">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white flex-shrink-0">
          <User className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
}
