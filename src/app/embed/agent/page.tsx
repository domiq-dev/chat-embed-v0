// src/app/embed/agent/page.tsx
"use client";

import FloatingVoiceChatWidget from "../../../components/VoiceComponent";

export const dynamic = "force-dynamic";

export default function EmbedAgent() {
  return (
      <FloatingVoiceChatWidget />
  );
}