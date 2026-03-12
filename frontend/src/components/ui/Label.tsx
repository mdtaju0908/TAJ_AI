"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Label({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm text-gray-300", className)}>
      {children}
    </label>
  );
}
