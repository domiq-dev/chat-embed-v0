// src/app/embed/agent/page.tsx
"use client";

import dynamic from 'next/dynamic';
const ChatLauncher = dynamic(() => import('@/components/ChatLauncher'), { ssr: false });

// Force dynamic rendering for this page
export const config = { dynamic: 'force-dynamic' };

export default function AgentEmbedPage() {
  return <ChatLauncher />;
}