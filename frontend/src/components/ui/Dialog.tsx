"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "w-full max-w-md rounded-2xl border border-white/10 bg-[#12151c]/90 shadow-2xl transition-transform",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4 border-b border-white/10", className)}>{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-white font-semibold">{children}</h3>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400">{children}</p>;
}
