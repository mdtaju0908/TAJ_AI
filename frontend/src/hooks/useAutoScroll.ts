"use client";

import { useEffect } from "react";

export function useAutoScroll(ref: React.RefObject<HTMLElement>, deps: any[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, deps);
}
