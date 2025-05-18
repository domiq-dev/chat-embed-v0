// File: components/ChatBox.tsx
'use client';

import { useState, FormEvent } from 'react';

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export default function ChatBox({ onSendMessage, disabled }: ChatBoxProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col"
    >
      <div className="flex flex-col mb-4">
        <label htmlFor="message" className="text-sm font-medium mb-2">
          Message to Avatar
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Loading avatar..." : "Type a message for the avatar to speak..."}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          rows={3}
          disabled={disabled}
        />
      </div>

      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
          !message.trim() || disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {disabled ? 'Loading Avatar...' : 'Make Avatar Speak'}
      </button>
    </form>
  );
}