// src/app/embed/agent/page.tsx
"use client";

import dynamic from 'next/dynamic';
const ChatLauncher = dynamic(() => import('@/components/ChatLauncher'), { ssr: false });

// Force dynamic rendering using new route segment config
export const revalidate = 0; // This achieves the same as 'force-dynamic'

export default function AgentEmbedPage() {
  return <ChatLauncher />;
}