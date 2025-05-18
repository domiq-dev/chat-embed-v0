"use client";
import React, {FC, useEffect, useState} from "react";
import { Pen } from "lucide-react";


const SparkleBurst: FC = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (360 / 8) * i;
      const r = (a * Math.PI) / 30;
      const d = 50;
      return (
        <span
          key={i}
          className="absolute bg-yellow-400 rounded-full w-2 h-2 animate-ping"
          style={{ transform: `translate(${d * Math.cos(r)}px,${d * Math.sin(r)}px)` }}
        />
      );
    })}
  </>
);
interface FloatingBannerProps {
  duration?: number; // in seconds (default: 30)
  onClickCTA: () => void;
}

const FloatingBanner: React.FC<FloatingBannerProps> = ({
  duration = 30,
  onClickCTA,
}) => {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (countdown <= 0) return null;

  return (
    <div className="fixed bottom-28 right-6 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
      <span className="font-semibold">🎯 Pre-qualify Now!</span>
      <span className="text-sm font-medium">
        ({Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")} left)
      </span>

      <button onClick={onClickCTA} className="relative flex flex-col items-center group ml-4">
        <SparkleBurst />
        <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-blue-100 transition transform hover:scale-105 active:scale-95 shadow-sm">
          <Pen size={20} className="text-gray-700 group-hover:text-blue-600" />
        </div>
        <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
          Ready&nbsp;to&nbsp;Sign!
        </span>
        <span className="mt-1 text-xs font-medium leading-tight text-gray-700 group-hover:text-blue-600">
          Sign Now
        </span>
      </button>
    </div>
  );
};

export default FloatingBanner;
