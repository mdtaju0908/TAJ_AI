"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function ThinkingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-gray-300", className)}>
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]" />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
    </div>
  );
}
