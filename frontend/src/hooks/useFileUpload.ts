"use client";

import { useState } from "react";

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export function useFileUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    setItems((prev) => [...prev, ...arr]);
  };
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  return { items, addFiles, remove, clear };
}
