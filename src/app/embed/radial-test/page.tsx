'use client';

import dynamic from 'next/dynamic';
const ChatLauncher = dynamic(() => import('@/components/ChatLauncher'), { ssr: false });

export default function HomePage() {
  return (
    <>
      {/* Fixed bottom-right chat launcher */}
      <ChatLauncher />
    </>
  );
}
