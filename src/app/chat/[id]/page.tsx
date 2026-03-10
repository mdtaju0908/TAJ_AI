import { ChatInterface } from "@/components/ChatInterface";
import { notFound } from "next/navigation";

interface ChatPageProps {
  params: {
    id: string;
  };
}

async function getChat(id: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/chat/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const chat = await res.json();
    const messages = (chat.messages || []).map((msg: any) => ({
      id: msg._id ? msg._id.toString() : Math.random().toString(36).substring(7),
      role: msg.role,
      content: msg.content,
      images: msg.images,
      createdAt: msg.createdAt,
    }));
    return { ...chat, messages };
  } catch {
    return null;
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const chat = await getChat(params.id);

  if (!chat) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ChatInterface id={params.id} initialMessages={chat.messages} />
    </div>
  );
}
