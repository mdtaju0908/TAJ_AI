"use client";

import React from "react";

export function ImagePreview({ urls }: { urls: string[] }) {
  if (!urls.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {urls.map((u, i) => (
        <img key={i} src={u} alt="" className="rounded-lg w-full h-auto" />
      ))}
    </div>
  );
}
