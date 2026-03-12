"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function Avatar({ src, alt, className, fallback }: AvatarProps) {
  return (
    <div className={cn("rounded-full bg-white/10 overflow-hidden", className)}>
      {src ? <img src={src} alt={alt || ""} className="w-full h-full object-cover" /> : fallback}
    </div>
  );
}
