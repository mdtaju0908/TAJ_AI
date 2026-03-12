"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Send, Square, RefreshCw } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-hot-toast";
import type { RouteMode } from "@/lib/aiRouter";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";
import { chatService } from "@/services/chat";
import { Button } from "@/components/ui/Button";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { SuggestionChips } from "./SuggestionChips";
import { AttachmentPreview } from "./AttachmentPreview";
import { FileUploader, type UploadedFile } from "./FileUploader";

export function ChatInterface({ id, mode = "chat" }: { id?: string; mode?: RouteMode }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState("");
  const [attachments, setAttachments] = React.useState<UploadedFile[]>([]);
  const [localChatId, setLocalChatId] = React.useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const { chats, activeChatId, createChat, setActiveChat, setMessages, renameChat } = useChatStore(
    useShallow((state) => ({
      chats: state.chats,
      activeChatId: state.activeChatId,
      createChat: state.createChat,
      setActiveChat: state.setActiveChat,
      setMessages: state.setMessages,
      renameChat: state.renameChat,
    }))
  );

  const effectiveChatId = id ?? localChatId ?? activeChatId;
  const chatIdForHook = effectiveChatId ?? "__missing__";
  const { messages, isLoading, sendMessage, cancel, retry, editUserMessage } = useChat(chatIdForHook);

  const chatExists = React.useMemo(() => chats.some((c) => c.id === effectiveChatId), [chats, effectiveChatId]);

  React.useEffect(() => {
    if (id) {
      setLocalChatId(id);
      setActiveChat(id);
      setBootstrapped(true);
    }
  }, [id, setActiveChat]);

  React.useEffect(() => {
    if (bootstrapped) return;
    if (id) return;
    if (localChatId || activeChatId) {
      setBootstrapped(true);
      return;
    }
    (async () => {
      const newId = await createChat();
      setLocalChatId(newId);
      if (newId) setActiveChat(newId);
      setBootstrapped(true);
      if (newId) router.replace(`/chat/${newId}`);
    })();
  }, [activeChatId, bootstrapped, createChat, id, localChatId, router, setActiveChat]);

  React.useEffect(() => {
    if (!effectiveChatId) return;
    if (chatExists) return;
    (async () => {
      const newId = await createChat();
      setLocalChatId(newId);
      if (newId) setActiveChat(newId);
      if (newId) router.replace(`/chat/${newId}`);
    })();
  }, [chatExists, createChat, effectiveChatId, router, setActiveChat]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  const suggestions = React.useMemo(() => {
    switch (mode) {
      case "image":
        return ["Generate image of a cyberpunk city at sunset", "Generate image of a minimalist logo for TAJ AI", "Generate image of a watercolor landscape"];
      case "code":
        return ["Explain this error", "Refactor this function", "Write unit tests for this"];
      case "research":
        return ["Search recent developments", "Summarize key points", "Compare two approaches"];
      default:
        return ["Summarize this", "Help me write an email", "Generate image of a futuristic workspace", "Brainstorm ideas"];
    }
  }, [mode]);

  const normalizeInputForMode = React.useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return "";
      if (t.startsWith("/")) return t;
      if (mode === "image") return `/image ${t}`;
      if (mode === "research") return `/search ${t}`;
      return t;
    },
    [mode]
  );

  const canSend = Boolean(effectiveChatId && chatExists) && !isLoading;

  const onSend = async () => {
    const content = normalizeInputForMode(draft);
    if (!content) return;
    if (!effectiveChatId || !chatExists) return;

    try {
      const uploadedAttachments = attachments.length > 0
        ? await chatService.uploadAttachments(
            attachments.map((item) => ({
              file: item.file,
              type: item.type,
            }))
          )
        : [];

      await sendMessage(content, { attachments: uploadedAttachments });
      setDraft("");
      setAttachments([]);
    } catch (error) {
      toast.error('Failed to upload one or more attachments.');
      return;
    }

    const chat = chats.find((c) => c.id === effectiveChatId);
    if (chat && /^New Chat \d+$/i.test(chat.title)) {
      const title = draft.trim().slice(0, 40) || chat.title;
      renameChat(chat.id, title);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar px-4">
          <div className="max-w-[850px] mx-auto py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-lg font-semibold text-white">Start a conversation</div>
                <div className="mt-2 text-sm text-gray-300">Try one of these prompts:</div>
                <div className="mt-4">
                  <SuggestionChips
                    suggestions={suggestions}
                    onSelect={(s) => {
                      setDraft(s);
                    }}
                  />
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onEdit={(messageId) => {
                    const msg = messages.find((x) => x.id === messageId);
                    if (!msg || msg.role !== "user") return;
                    const next = prompt("Edit your message", msg.content);
                    if (next === null) return;
                    editUserMessage(messageId, next);
                  }}
                  onDelete={(messageId) => {
                    if (!effectiveChatId) return;
                    setMessages(
                      effectiveChatId,
                      messages.filter((x) => x.id !== messageId)
                    );
                  }}
                  onRegenerate={() => {
                    retry();
                  }}
                />
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[850px] w-full">
                  <ThinkingIndicator className="mt-2" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0b1220]/60 backdrop-blur-xl px-4 py-3">
        <div className="max-w-[850px] mx-auto">
          <AttachmentPreview
            attachments={attachments}
            onRemove={(idToRemove) => setAttachments((prev) => prev.filter((a) => a.id !== idToRemove))}
          />
          <div className={cn("flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2")}>
            <FileUploader
              onFiles={(files: UploadedFile[]) => {
                setAttachments((prev) => [...prev, ...files]);
              }}
            />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message TAJ AI..."
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-gray-400",
                "min-h-[44px] max-h-[160px]"
              )}
            />
            {isLoading ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={cancel}
                className="rounded-xl"
                title="Stop"
              >
                <Square className="w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={retry}
                  className="rounded-xl"
                  title="Regenerate"
                  disabled={messages.length === 0}
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="icon"
                  onClick={onSend}
                  className="rounded-xl"
                  title="Send"
                  disabled={!canSend || !draft.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
