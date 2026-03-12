"use client";

import { Bot, User, Copy, RefreshCw, ThumbsUp, ThumbsDown, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/lib/markdown";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export function MessageBubble({ message, onEdit, onDelete, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-start gap-4 w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div
        className={cn(
          "group relative max-w-[85%] md:max-w-[75%] p-4 rounded-2xl",
          isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-[#262626] text-gray-200 rounded-bl-none"
        )}
      >
        <MarkdownRenderer content={message.content} />
        {message.images && message.images.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {message.images.map((img, i) => (
              <img key={i} src={img} alt="" className="rounded-lg w-full h-auto" />
            ))}
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isUser ? (
            <>
              <button onClick={() => onEdit(message.id)} className="p-1.5 rounded-md hover:bg-white/20">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(message.id)} className="p-1.5 rounded-md hover:bg-white/20">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-white/20">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={() => onRegenerate(message.id)} className="p-1.5 rounded-md hover:bg-white/20">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-white/20">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-white/20">
                <ThumbsDown className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
