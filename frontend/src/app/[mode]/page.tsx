import { redirect } from 'next/navigation';
import { isValidMode, type RouteMode } from '@/lib/aiRouter';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ModelSelector } from '@/components/chat/ModelSelector';

export default function ModePage({ params }: { params: { mode: string } }) {
  const modeParam = params.mode;
  if (!isValidMode(modeParam)) {
    redirect('/chat');
  }
  const mode = modeParam as RouteMode;
  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-4 py-2">
        <ModelSelector />
      </div>
      <ChatInterface mode={mode} />
    </div>
  );
}

