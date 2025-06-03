"use client";
import React, {FC, useState, useCallback} from "react";
import { Pen } from "lucide-react";
import confetti from "canvas-confetti";

interface FloatingBannerProps {
  onClickCTA: () => void;
  isPrequalified?: boolean;
  userName?: string;
}

const FloatingBanner: React.FC<FloatingBannerProps> = ({
  onClickCTA,
  isPrequalified = false,
  userName = "",
}) => {
  const [showCongrats, setShowCongrats] = useState(false);

  const launchConfetti = useCallback(() => {
    const duration = 1.5 * 1000;
    const element = document.querySelector('.qualification-banner-container');
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const elementWidth = rect.width;
    const windowWidth = window.innerWidth;
    
    const leftEdge = rect.left / windowWidth;
    const rightEdge = (rect.left + elementWidth) / windowWidth;
    const centerX = (leftEdge + rightEdge) / 2;
    
    // Initial burst
    confetti({
      particleCount: 25,
      angle: 90,
      spread: 50,
      origin: { x: centerX, y: 0.6 },
      colors: ['#5A67D8', '#4C51BF', '#7F9CF5', '#10B981'],
      disableForReducedMotion: true,
      ticks: 175,
      decay: 0.94,
      gravity: 1,
    });
    
    // Additional bursts with delays
    setTimeout(() => {
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 40,
        origin: { x: leftEdge + 0.1, y: 0.65 },
        colors: ['#4C51BF', '#7F9CF5', '#10B981'],
        disableForReducedMotion: true,
        ticks: 150,
        decay: 0.94,
        gravity: 1,
      });
    }, 150);
    
    setTimeout(() => {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 40,
        origin: { x: rightEdge - 0.1, y: 0.65 },
        colors: ['#5A67D8', '#7F9CF5', '#10B981'],
        disableForReducedMotion: true,
        ticks: 150,
        decay: 0.94,
        gravity: 1,
      });
    }, 300);
    
    setTimeout(() => {
      confetti({
        particleCount: 20,
        angle: 90,
        spread: 45,
        origin: { x: centerX, y: 0.62 },
        colors: ['#5A67D8', '#10B981'],
        disableForReducedMotion: true,
        ticks: 130,
        decay: 0.94,
        gravity: 1,
      });
    }, 450);
  }, []);

  const handleClick = () => {
    onClickCTA();
    if (isPrequalified) {
      launchConfetti();
      setShowCongrats(true);
      setTimeout(() => {
        setShowCongrats(false);
      }, 5000);
    }
  };

  if (!isPrequalified) {
    return null;
  }

  return (
    <div className="qualification-banner-container w-full">
      {showCongrats ? (
        <div className="bg-white border border-green-300 text-green-800 px-4 py-2 rounded-lg shadow-sm">
          <span className="font-semibold text-sm">🎉 Congratulations {userName}! You are prequalified and your form has been downloaded.</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-sm flex items-center justify-between">
          <span className="font-semibold text-sm">🎯 You are prequalified!</span>
          
          <button onClick={handleClick} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition transform hover:scale-105 active:scale-95 shadow-sm">
              <Pen size={14} className="text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
              Sign Now
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingBanner;
