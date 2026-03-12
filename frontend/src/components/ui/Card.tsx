"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-white/10 bg-white/5", className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-4 py-3 border-b border-white/10", className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}
