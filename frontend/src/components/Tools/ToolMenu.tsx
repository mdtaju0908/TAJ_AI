"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TOOLS } from './tools';

interface ToolMenuProps {
  onSelect: (toolId: string) => void;
  filter?: string;
}

export function ToolMenu({ onSelect, filter = "" }: ToolMenuProps) {
  const filteredTools = TOOLS.filter(t => t.id.startsWith(filter));

  if (filteredTools.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-0 mb-2 w-64 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="p-1">
        {filteredTools.map((tool, i) => (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/10 transition-colors",
              i === 0 && filter && "bg-white/5"
            )}
          >
            <tool.icon className="w-4 h-4 text-blue-400" />
            <span>/{tool.id}</span>
            <span className="ml-auto text-xs text-gray-500">{tool.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
