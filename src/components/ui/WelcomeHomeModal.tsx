"use client";

import React, { useState, useRef, useEffect } from "react";

interface WelcomeHomeModalProps {
  onDoneText: () => void;
  onDoneVoice: () => void;
}

const prizes = [
  "Special Gift at Tour",
  "$50 off Rent",
  "First Month Rent Free",
];

const colors = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#facc15", // yellow
];

// You can randomize icons if you want, for now just 🎁
const mysteryIcon = "🎁";

const WelcomeHomeModal: React.FC<WelcomeHomeModalProps> = ({ onDoneText, onDoneVoice }) => {
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);

  const spinDuration = 4000;
  const spins = 6;
  const sliceAngle = 360 / prizes.length; // Even slices visually

  const spinWheel = () => {
    if (hasSpun || spinning) return;
    setSpinning(true);

    const random = Math.random();
    let prizeIndex: number;

    if (random < 0.80) {
      prizeIndex = 0; // Special Gift at Tour
    } else if (random < 0.95) {
      prizeIndex = 1; // $50 off Rent
    } else {
      prizeIndex = 2; // First Month Rent Free
    }

    const baseAngle = prizeIndex * sliceAngle;
    const offsetInSlice = (Math.random() - 0.5) * (sliceAngle * 0.6);
    const targetAngle = 360 - (baseAngle + sliceAngle / 2 + offsetInSlice);

    const finalRotation = spins * 360 + targetAngle;

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.33, 1, 0.68, 1)`;
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
    }

    setTimeout(() => {
      setHasSpun(true);
      setSpinning(false);
      setResult(prizes[prizeIndex]);
    }, spinDuration + 100);
  };

  useEffect(() => {
    if (!hasSpun && wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = "rotate(0deg)";
    }
  }, [hasSpun]);

  return (
    <div className="bg-white w-full max-w-md h-[95vh] rounded-2xl shadow-2xl flex flex-col p-6 overflow-auto">
      <div className="flex flex-col items-center justify-between h-full">

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-green-600 animate-bounce">
            🎉 Welcome Home!
          </h2>
          <p className="text-gray-700 text-lg">
            You've secured your spot at{" "}
            <span className="text-blue-600 font-semibold">
              Grand Oaks Apartments
            </span>!
          </p>
          <p className="text-gray-500">Special Reward: Spin the wheel now to reveal!</p>
        </div>

        {/* Wheel Section */}
        <div className="relative mx-auto w-56 h-56 mt-6">
          {/* Wheel SVG */}
          <svg
            ref={wheelRef}
            className="w-56 h-56 rounded-full shadow-xl border-[6px] border-green-400 bg-gradient-to-b from-green-100 to-green-300"
            viewBox="0 0 100 100"
            style={{ transformOrigin: "50% 50%", willChange: "transform" }}
          >
            {prizes.map((_, i) => {
              const startAngle = i * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const pathData = `
                M 50 50
                L ${x1} ${y1}
                A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
                Z
              `;

              const textAngle = startAngle + sliceAngle / 2;
              const textRad = (textAngle * Math.PI) / 180;
              const textX = 50 + 30 * Math.cos(textRad);
              const textY = 50 + 30 * Math.sin(textRad);

              return (
                <g key={i}>
                  <path
                    fill={colors[i % colors.length]}
                    d={pathData}
                    stroke="white"
                    strokeWidth="0.8"
                  />
                  {/* Replace text with 🎁 Mystery Icon */}
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="6"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    style={{
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {mysteryIcon}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Pointer */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0
              border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent
              border-b-[24px] border-b-red-500 drop-shadow-md"
          />

          {/* Center Spin Button */}
          <button
            onClick={spinWheel}
            disabled={hasSpun || spinning}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-20 h-20 rounded-full flex items-center justify-center font-bold 
              shadow-lg text-white text-lg ${
                hasSpun || spinning
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 animate-pulse"
              } transition-colors duration-300`}
          >
            {spinning ? "..." : hasSpun ? "✓" : "Spin"}
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <div className="text-center mt-6">
            <p className="text-green-700 font-semibold text-lg">
              🎉 You earned:
            </p>
            <p className="underline text-xl font-bold text-green-500 mt-1">
              {result}
            </p>
          </div>
        )}

        {/* Chat / Call Buttons */}
        <div className="w-full mt-8 space-y-3">
          <p className="text-center text-gray-700 font-medium">
            🤔 Have any questions before your tour?
          </p>

          <button
            onClick={onDoneText}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold rounded-full shadow-lg"
          >
            💬 Chat with Alinna
          </button>

          <button
            onClick={onDoneVoice}
            className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full shadow-lg"
          >
            🎤 Call Alinna
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-4">
          We’re here to make your move-in journey easy. 🎈
        </p>

      </div>
    </div>
  );
};

export default WelcomeHomeModal;
