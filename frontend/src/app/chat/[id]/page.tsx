"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { withAuth } from "@/components/withAuth";

function ChatPage({ params }: { params: { id: string } }) {
  return <ChatInterface id={params.id} />;
}

export default withAuth(ChatPage);
