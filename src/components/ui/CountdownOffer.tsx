import React, { FC, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CountdownOfferProps {
  initialMinutes?: number;
  onExpire?: () => void;
  offerText?: string;
  analytics?: {
    trackIncentiveOffered?: (incentiveType: string) => void;
    trackIncentiveExpired?: (incentiveType: string) => void;
    trackIncentiveAccepted?: (incentiveType: string) => void;
  };
  tourBooked?: boolean;
  onPromptTour?: () => void;
  onClose?: () => void;
}

const CountdownOffer: FC<CountdownOfferProps> = ({
  initialMinutes = 15,
  onExpire,
  offerText = 'Lock in your special rate',
  analytics,
  tourBooked = false,
  onPromptTour,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isVisible, setIsVisible] = useState(true);
  const [hasTrackedOffer, setHasTrackedOffer] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Add a confetti function using canvas-confetti
  const launchConfetti = useCallback(() => {
    // Create a canvas-confetti celebration - moderate duration
    const duration = 1.5 * 1000; // 1.5 seconds
    const end = Date.now() + duration;

    // Get the current element's position to constrain confetti
    const element = document.querySelector('.px-4.pr-8.py-2.border-t');
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const elementWidth = rect.width;
    const windowWidth = window.innerWidth;

    // Calculate relative position (0-1) for the confetti origin
    const leftEdge = rect.left / windowWidth;
    const rightEdge = (rect.left + elementWidth) / windowWidth;
    const centerX = (leftEdge + rightEdge) / 2;

    // Initial burst
    confetti({
      particleCount: 25,
      angle: 90,
      spread: 50,
      origin: { x: centerX, y: 0.6 },
      colors: ['#5A67D8', '#4C51BF', '#7F9CF5', '#ECC94B'],
      disableForReducedMotion: true,
      ticks: 175,
      decay: 0.94,
      gravity: 1,
    });

    // Add a few more bursts with slight delays
    setTimeout(() => {
      // Left side burst
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 40,
        origin: { x: leftEdge + 0.1, y: 0.65 },
        colors: ['#4C51BF', '#7F9CF5', '#ECC94B'],
        disableForReducedMotion: true,
        ticks: 150,
        decay: 0.94,
        gravity: 1,
      });
    }, 150);

    setTimeout(() => {
      // Right side burst
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 40,
        origin: { x: rightEdge - 0.1, y: 0.65 },
        colors: ['#5A67D8', '#7F9CF5', '#F6E05E'],
        disableForReducedMotion: true,
        ticks: 150,
        decay: 0.94,
        gravity: 1,
      });
    }, 300);

    // One final burst at the end
    setTimeout(() => {
      confetti({
        particleCount: 20,
        angle: 90,
        spread: 45,
        origin: { x: centerX, y: 0.62 },
        colors: ['#5A67D8', '#ECC94B', '#F6E05E'],
        disableForReducedMotion: true,
        ticks: 130,
        decay: 0.94,
        gravity: 1,
      });
    }, 450);
  }, []);

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
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire, analytics, hasAccepted]);

  const handleClaimOffer = () => {
    // Launch the confetti celebration
    launchConfetti();

    // Track incentive accepted
    if (analytics?.trackIncentiveAccepted) {
      analytics.trackIncentiveAccepted('waive_app_fee');
    }

    setHasAccepted(true);

    // Delay hiding the offer
    setTimeout(() => {
      setIsVisible(false);
    }, 1800); // Hide after 1.8 seconds (after confetti finishes)
  };

  const handleClose = () => {
    // Track incentive dismissed if analytics is available
    if (analytics?.trackIncentiveExpired) {
      analytics.trackIncentiveExpired('waive_app_fee_dismissed');
    }

    // Call the parent's onClose handler
    if (onClose) {
      onClose();
    } else if (onExpire) {
      onExpire(); // Fallback to onExpire if onClose is not provided
    }

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
      className="px-4 pr-8 py-2 border-t bg-gradient-to-r from-blue-50 to-purple-50 relative"
    >
      <button
        onClick={handleClose}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close offer"
      >
        <X size={14} />
      </button>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-blue-600" />
          <span className="text-[11px] font-medium text-gray-700">{offerText}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-blue-100 px-1.5 py-0.5 rounded text-sm font-medium text-blue-600">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] text-gray-500">remaining</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-medium text-gray-700 whitespace-nowrap">
          💰 <span>$25 Application Fee Waiver</span>
        </div>
        <motion.button
          onClick={tourBooked ? handleClaimOffer : onPromptTour}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-2.5 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-medium rounded-full transition-all shadow-sm whitespace-nowrap ${!tourBooked ? 'opacity-60 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-600'}`}
          disabled={!tourBooked}
        >
          {tourBooked ? 'Claim $25' : 'Schedule a Tour to Claim'}
        </motion.button>
      </div>

      <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / (initialMinutes * 60)) * 100}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  );
};

export default CountdownOffer;
