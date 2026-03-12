"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export function SuggestionChips({ suggestions, onSelect }: { suggestions: string[]; onSelect: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <Button key={s} variant="secondary" size="sm" onClick={() => onSelect(s)}>
          {s}
        </Button>
      ))}
    </div>
  );
}
