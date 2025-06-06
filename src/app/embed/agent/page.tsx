// src/app/embed/agent/page.tsx
'use client';

import dynamic from 'next/dynamic';
const ChatLauncher = dynamic(() => import('@/components/ChatLauncher'), {
  ssr: false,
});

export default function AgentEmbedPage() {
  return <ChatLauncher />;
}
