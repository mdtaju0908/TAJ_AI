"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { withAuth } from "@/components/auth/withAuth";

function ChatPage({ params }: { params: { id: string } }) {
  return <ChatInterface id={params.id} />;
}

export default withAuth(ChatPage);
