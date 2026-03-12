"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leadingIcon, trailingIcon, ...props },
  ref
) {
  return (
    <div className="relative">
      {leadingIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leadingIcon}</div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full h-10 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 pl-3 pr-3",
          leadingIcon ? "pl-9" : "",
          trailingIcon ? "pr-9" : "",
          className
        )}
        {...props}
      />
      {trailingIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{trailingIcon}</div>
      )}
    </div>
  );
});
