"use client";

import React, { FC } from "react";

const BalloonRain: FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 20 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 6 + Math.random() * 4;

        return (
          <div
            key={i}
            className="absolute w-8 h-10 bg-gradient-to-b from-pink-300 to-red-400 rounded-full opacity-80 animate-bounce-balloon"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default BalloonRain;
