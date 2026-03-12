"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500 ring-offset-transparent",
  secondary: "bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white ring-offset-transparent",
  ghost: "bg-transparent text-gray-200 hover:bg-white/10 focus-visible:ring-white ring-offset-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
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
