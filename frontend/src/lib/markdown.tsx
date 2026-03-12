"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code(props) {
          const { className, children } = props as { className?: string; children?: React.ReactNode };
          const match = /language-(\w+)/.exec(className || "");
          const isInline = (props as any).inline;
          if (!isInline && match) {
            return (
              <SyntaxHighlighter style={vscDarkPlus as any} language={match[1]} PreTag="div">
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          }
          return (
            <code className="px-1 py-0.5 bg-white/10 rounded-sm" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
