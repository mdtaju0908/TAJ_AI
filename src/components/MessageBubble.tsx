import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Bot, Pencil, Download, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  onEdit?: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ id, role, content, images, onEdit }) => {
  const [copied, setCopied] = React.useState(false);
  const [reaction, setReaction] = React.useState<'like' | 'dislike' | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tajai-response.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendReaction = async (value: 'like' | 'dislike') => {
    setReaction(prev => (prev === value ? null : value));
    if (!id) return;
    try {
      await fetch(`http://localhost:5000/api/messages/${id}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: value }),
      });
    } catch {}
  };

  return (
    <div
      className={cn(
        "flex w-full mb-6",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
        <div
          className={cn(
            "rounded-2xl p-4 transition-all duration-300 animate-fade-in",
            role === "user"
              ? "bg-[rgba(59,130,246,0.12)] text-white border border-[rgba(255,255,255,0.1)] backdrop-blur-[20px] rounded-br-none shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.4)]"
              : "bg-[rgba(255,255,255,0.05)] text-gray-100 border border-[rgba(255,255,255,0.1)] backdrop-blur-[20px] rounded-bl-none shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.25)]"
          )}
        >
          <div className="mr-3 mt-1 shrink-0">
            {role === 'user' ? (
              <User className="w-5 h-5" />
            ) : (
              <div className="relative">
                <Bot className="w-5 h-5 text-blue-500" />
                <span className="absolute inset-0 rounded-full blur-[6px] opacity-40" />
              </div>
            )}
          </div>
          {images && images.length > 0 ? (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((src, idx) => (
                <div key={idx} className="group relative">
                  <a href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt={`Generated ${idx + 1}`} className="w-full h-auto rounded-xl border border-[rgba(255,255,255,0.1)]" />
                  </a>
                  <a
                    href={src}
                    download={`tajai-image-${idx + 1}.png`}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[rgba(0,0,0,0.55)] hover:bg-[rgba(59,130,246,0.6)]"
                    title="Download image"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-sm md:text-base overflow-hidden">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative group rounded-md overflow-hidden my-2">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                            className="p-1 bg-[rgba(0,0,0,0.6)] text-white rounded hover:bg-[rgba(59,130,246,0.35)]"
                            title="Copy code"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={cn("bg-[rgba(0,0,0,0.45)] text-blue-100 rounded px-1 py-0.5", className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => copyToClipboard(content)}
            className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(59,130,246,0.2)] transition-transform duration-200 hover:scale-105"
            title="Copy message"
          >
            <Copy className="w-4 h-4 text-white" />
          </button>
          {role === 'user' && onEdit && (
            <button
              onClick={() => onEdit(content)}
              className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(59,130,246,0.2)] transition-transform duration-200 hover:scale-105"
              title="Edit message"
            >
              <Pencil className="w-4 h-4 text-white" />
            </button>
          )}
          {role === 'assistant' && (
            <>
              <button
                onClick={() => sendReaction('like')}
                className={cn(
                  "p-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(59,130,246,0.2)] transition-transform duration-200 hover:scale-105",
                  reaction === 'like' ? "ring-2 ring-blue-400" : ""
                )}
                title="Like"
              >
                <ThumbsUp className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => sendReaction('dislike')}
                className={cn(
                  "p-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(59,130,246,0.2)] transition-transform duration-200 hover:scale-105",
                  reaction === 'dislike' ? "ring-2 ring-blue-400" : ""
                )}
                title="Dislike"
              >
                <ThumbsDown className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => downloadText(content)}
                className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(59,130,246,0.2)] transition-transform duration-200 hover:scale-105"
                title="Download message"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
