"use client";

import { X, File, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-white" />;
  if (type === 'application/pdf') return <FileText className="w-8 h-8 text-red-400" />;
  return <File className="w-8 h-8 text-gray-400" />;
};

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="w-full mb-3 rounded-2xl border border-[rgba(59,130,246,0.2)] bg-[#0f172a]/80 backdrop-blur-xl shadow-lg p-3">
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
        <AnimatePresence>
          {attachments.map(attachment => (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative w-32 h-32 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] p-2 flex flex-col items-center justify-center text-center"
            >
              {attachment.type.startsWith('image/') ? (
                <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover rounded-md" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {getFileIcon(attachment.type)}
                  <span className="text-xs text-white truncate w-full mt-2">{attachment.name}</span>
                </div>
              )}
              <button
                onClick={() => onRemove(attachment.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
