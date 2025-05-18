"use client";

import React, { FC } from "react";

const ConfettiRain: FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 5 + Math.random() * 5;
        const size = 4 + Math.random() * 4;

        return (
          <div
            key={i}
            className="absolute bg-yellow-400 rounded-full opacity-90 animate-fall-confetti"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              backgroundColor: ["#ff55b0", "#16ffc9", "#ffcc00", "#3b82f6"][i % 4],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default ConfettiRain;
