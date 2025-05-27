import React, { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownOfferProps {
  initialMinutes?: number;
  onExpire?: () => void;
  offerText?: string;
}

const CountdownOffer: FC<CountdownOfferProps> = ({
  initialMinutes = 15,
  onExpire,
  offerText = "Lock in your special rate"
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsVisible(false);
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  if (!isVisible) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="px-5 py-3 border-t"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-700">{offerText}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-gray-100 px-2 py-1 rounded text-sm font-medium text-blue-600">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-gray-500">remaining</span>
        </div>
      </div>
      <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / (initialMinutes * 60)) * 100}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  );
};

export default CountdownOffer; 