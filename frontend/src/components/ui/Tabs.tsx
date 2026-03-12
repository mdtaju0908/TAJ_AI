"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 px-4 pt-4">{children}</div>;
}

export function TabsTrigger({
  value,
  active,
  onClick,
  children,
}: {
  value: string;
  active: boolean;
  onClick: (v: string) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      className={cn(
        "px-3 py-2 rounded-lg text-sm transition",
        active ? "bg-white/15 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
      )}
      onClick={() => onClick(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  active,
  children,
}: {
  value: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return active ? <div className="px-5 pb-5">{children}</div> : null;
}
