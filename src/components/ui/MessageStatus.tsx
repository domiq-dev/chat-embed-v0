// components/ui/MessageStatus.tsx
"use client";
import React from "react";
import { formatDistanceToNow } from "date-fns";

const MessageStatus = ({
  sentAt,
  isLastUserMessage,
}: {
  sentAt: Date;
  isLastUserMessage: boolean;
}) => (
  <div className="text-xs text-gray-400 mt-1 ml-2 flex gap-2 items-center">
    <span>{formatDistanceToNow(sentAt, { addSuffix: true })}</span>
    {isLastUserMessage && (
      <span className="text-blue-500 font-semibold">Seen</span>
    )}
  </div>
);

export default MessageStatus;
