import React, { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CountdownOfferProps {
  initialMinutes?: number;
  onExpire?: () => void;
  offerText?: string;
  analytics?: {
    trackIncentiveOffered?: (incentiveType: string) => void;
    trackIncentiveExpired?: (incentiveType: string) => void;
    trackIncentiveAccepted?: (incentiveType: string) => void;
  };
}

const CountdownOffer: FC<CountdownOfferProps> = ({
  initialMinutes = 15,
  onExpire,
  offerText = "Lock in your special rate",
  analytics
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isVisible, setIsVisible] = useState(true);
  const [hasTrackedOffer, setHasTrackedOffer] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Track incentive offered when component first mounts
  useEffect(() => {
    if (!hasTrackedOffer && analytics?.trackIncentiveOffered) {
      analytics.trackIncentiveOffered('waive_app_fee');
      setHasTrackedOffer(true);
    }
  }, [hasTrackedOffer, analytics]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsVisible(false);
      
      // Track incentive expired only if not accepted
      if (!hasAccepted && analytics?.trackIncentiveExpired) {
        analytics.trackIncentiveExpired('waive_app_fee');
      }
      
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire, analytics, hasAccepted]);

  const handleClaimOffer = () => {
    // Track incentive accepted
    if (analytics?.trackIncentiveAccepted) {
      analytics.trackIncentiveAccepted('waive_app_fee');
    }
    
    setHasAccepted(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="px-4 py-2 border-t bg-gradient-to-r from-blue-50 to-purple-50"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-blue-600" />
          <span className="text-xs font-medium text-gray-700">{offerText}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-blue-100 px-1.5 py-0.5 rounded text-sm font-medium text-blue-600">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] text-gray-500">remaining</span>
        </div>
      </div>
      
      {/* CTA Button for incentive acceptance */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          💰 <strong>$25 Application Fee Waiver</strong>
        </div>
        <motion.button
          onClick={handleClaimOffer}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm"
        >
          Claim $25
        </motion.button>
      </div>
      
      <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / (initialMinutes * 60)) * 100}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  );
};

export default CountdownOffer; 