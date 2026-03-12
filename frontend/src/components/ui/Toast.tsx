"use client";

import React from "react";

export function Toast({ message }: { message: string }) {
  return <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-white/10 border border-white/15 text-white px-3 py-2">{message}</div>;
}
