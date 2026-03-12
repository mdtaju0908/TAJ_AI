"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
export type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500 ring-offset-transparent",
  secondary: "bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white ring-offset-transparent",
  ghost: "bg-transparent text-gray-200 hover:bg-white/10 focus-visible:ring-white ring-offset-transparent",
  outline: "border border-white/10 bg-transparent hover:bg-white/5 text-white",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
