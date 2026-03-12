"use client";

import React, { useRef } from "react";
import { Paperclip } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file: File;
}

export function FileUploader({ onFiles }: { onFiles: (files: UploadedFile[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const pick = () => ref.current?.click();
  const toUploaded = (file: File): UploadedFile => ({
    id: Math.random().toString(36).slice(2),
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    file,
  });

  return (
    <div>
      <button
        type="button"
        onClick={pick}
        className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
        title="Upload"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      <input
        ref={ref}
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []).map(toUploaded);
          onFiles(files);
          e.currentTarget.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
