"use client";

import React, { useEffect, useRef } from "react";
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
  const prevOverflow = useRef<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    if (open) {
      prevOverflow.current = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = prevOverflow.current || "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow.current || "";
    };
  }, [open, onOpenChange]);

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
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          className={cn(
            "transition-all duration-200 transform",
            open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
          )}
        >
          {children}
        </div>
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
        "w-full max-w-md rounded-2xl border border-white/10 bg-[#12151c]/90 shadow-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-white font-semibold", className)}>{children}</h3>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-gray-400", className)}>{children}</p>;
}
