"use client";
import React from "react";

const MessengerXButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Close"
    className="text-[#c56ef5] hover:text-[#a142e0] transition-all duration-200 p-1 rounded-full"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.3 5.71a1 1 0 0 0-1.42 0L12 10.59 7.12 5.7a1 1 0 0 0-1.41 1.42L10.59 12l-4.88 4.88a1 1 0 0 0 1.41 1.41L12 13.41l4.88 4.88a1 1 0 0 0 1.42-1.41L13.41 12l4.88-4.88a1 1 0 0 0 .01-1.41z" />
    </svg>
  </button>
);

export default MessengerXButton;
