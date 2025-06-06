'use client';
import React, { FC, useState } from 'react';
import { X, Mail, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { DEFAULT_APARTMENT_CONFIG } from '@/types/apartment';
import { ChatMessageForDisplay } from './types';
import { QuickReplyHint } from '@/components/ui/QuicklyReplyButtons';
import QuickReplyButtons from '@/components/ui/QuicklyReplyButtons';
import CountdownOffer from '@/components/ui/CountdownOffer';
import { Session as AkoolSessionType } from '../../services/apiService';

// Small utility components
const SparkleBurst: FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(6)].map((_, i) => {
      const angle = (360 / 6) * i;
      const radius = 30;
      return (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{ scale: 0, x: '50%', y: '50%' }}
          animate={{
            scale: [0, 1, 0],
            x: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * radius}px)`,
            y: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
            times: [0, 0.5, 1],
            delay: i * 0.1,
          }}
        />
      );
    })}
  </div>
);

const TypingIndicator: FC = () => (
  <div className="flex items-center gap-1 px-2 py-1">
    <div className="flex gap-x-1">
      <motion.div
        className="w-1.5 h-1.5 bg-blue-300 rounded-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-blue-300 rounded-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-blue-300 rounded-full"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
    <span className="text-sm text-gray-500">Ava is typing...</span>
  </div>
);

const LiveAgentBadge: FC = () => (
  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">Live Agent</span>
);

interface StarRatingProps {
  rating: number;
}

const StarRating: FC<StarRatingProps> = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    let fillPercentage = 0;

    if (starValue <= rating) {
      fillPercentage = 100;
    } else if (starValue > rating && starValue - 1 < rating) {
      fillPercentage = (rating - (starValue - 1)) * 100;
    } else {
      fillPercentage = 0;
    }
    return { index: i, fillPercentage };
  });

  return (
    <div className="flex items-center gap-1">
      {stars.map(({ index, fillPercentage }) => (
        <div key={index} className="relative" style={{ width: '14px', height: '14px' }}>
          <Star
            size={14}
            className="absolute top-0 left-0 text-gray-200 fill-gray-200"
            strokeWidth={1}
          />
          {fillPercentage > 0 && (
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                size={14}
                className="text-yellow-400 fill-yellow-400"
                strokeWidth={1}
                style={{ width: '14px', height: '14px' }}
              />
            </div>
          )}
        </div>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

// Chat Header Component
interface ChatHeaderProps {
  config: typeof DEFAULT_APARTMENT_CONFIG;
  onClose: () => void;
  headerRef: React.RefObject<HTMLDivElement>;
  lastMailtoClickTime?: React.MutableRefObject<number>;
  analytics: {
    trackEmailOfficeClick: (location: string) => void;
    trackPhoneCallClick: (location: string) => void;
  };
}

export const ChatHeader: FC<ChatHeaderProps> = ({
  config,
  onClose,
  headerRef,
  lastMailtoClickTime,
  analytics,
}) => {
  return (
    <motion.div
      ref={headerRef}
      className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <img
          src={config.agent.avatar}
          alt="Leasing Agent"
          className="w-10 h-10 rounded-full object-cover border border-gray-100"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{config.agent.name}</span>
            <LiveAgentBadge />
          </div>
          <p className="text-xs text-gray-500">{config.agent.title}</p>
          <StarRating rating={config.reviews.googleRating} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {config.socialLinks.facebook && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(config.socialLinks.facebook, '_blank')}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            title="Visit our Facebook page"
          >
            <img src="/social/facebook.svg" alt="Facebook" className="w-[18px] h-[18px]" />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            analytics.trackEmailOfficeClick('header');
            if (lastMailtoClickTime) {
              lastMailtoClickTime.current = Date.now();
            }
            window.location.href = 'mailto:leasing@grandoaks.com';
          }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Email us"
        >
          <Mail size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Close chat"
        >
          <X size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Chat Body Component
interface ChatBodyProps {
  messages: ChatMessageForDisplay[];
  config: typeof DEFAULT_APARTMENT_CONFIG;
  isTyping: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  currentHint: QuickReplyHint | null;
  currentQuestion: string | null;
  sendMessage: (text: string) => Promise<void>;
  trackAnswerButtonClick?: (optionId: string, optionText: string) => void;
  setCurrentHint: (hint: QuickReplyHint | null) => void;
  setCurrentQuestion: (question: string | null) => void;
}

export const ChatBody: FC<ChatBodyProps> = ({
  messages,
  config,
  isTyping,
  containerRef,
  currentHint,
  currentQuestion,
  sendMessage,
  trackAnswerButtonClick,
  setCurrentHint,
  setCurrentQuestion,
}) => {
  const lastAgentMessageIndex = messages.findLastIndex((msg) => msg.from === 'agent');
  const shouldShowQuickReply =
    !isTyping && (currentHint || currentQuestion) && lastAgentMessageIndex !== -1;

  const renderQuickReplyButtons = () => {
    if (!shouldShowQuickReply) return null;

    return (
      <motion.div
        key="quick-reply-buttons"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="ml-10 mt-2"
      >
        <QuickReplyButtons
          currentQuestion={currentQuestion}
          hint={currentHint || undefined}
          onSelect={(value: string) => {
            setCurrentHint(null);
            setCurrentQuestion(null);
            sendMessage(value);
          }}
          trackAnswerButtonClick={trackAnswerButtonClick}
        />
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col relative z-[5] bg-transparent overflow-hidden">
      <div className="h-[180px] flex-shrink-0">
        {/* Intentionally empty to create clear space for the avatar's face */}
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 pt-10 pb-4 space-y-4"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 20px, black 40px)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 20px, black 40px)',
        }}
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.from === 'agent' ? 'justify-start' : 'justify-end'} items-end gap-2`}
              >
                {message.from === 'agent' && (
                  <img src={config.agent.avatar} alt="Agent" className="w-8 h-8 rounded-full" />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-md ${
                    message.from === 'agent'
                      ? 'bg-white/90 text-black rounded-bl-none'
                      : 'bg-gradient-to-br from-blue-500/[.90] to-purple-500/[.90] text-white rounded-br-none'
                  }`}
                >
                  <div
                    className={`prose prose-sm max-w-none break-words ${message.from === 'user' ? 'text-white' : ''}`}
                  >
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                  {message.sentAt && (
                    <div
                      className={`text-[10px] mt-1 ${message.from === 'agent' ? 'text-gray-500' : 'text-white/90'}`}
                    >
                      {new Date(message.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {shouldShowQuickReply &&
                index === lastAgentMessageIndex &&
                index === messages.length - 1 &&
                !isTyping &&
                renderQuickReplyButtons()}
            </React.Fragment>
          ))}
          {isTyping && (
            <motion.div
              key="typing-indicator-bubble"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start items-end gap-2"
            >
              <img src={config.agent.avatar} alt="Agent" className="w-8 h-8 rounded-full" />
              <div className="max-w-[75%] rounded-2xl px-4 py-2 shadow-md bg-white/90 text-black rounded-bl-none">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Timer Section Component
interface TimerSectionProps {
  showOffer: boolean;
  qualified: boolean;
  onOfferExpire: () => void;
  savings: number;
  analytics?: {
    trackIncentiveOffered: (incentiveType: string) => void;
    trackIncentiveExpired: (incentiveType: string) => void;
    trackIncentiveAccepted: (incentiveType: string) => void;
  };
  tourBooked: boolean;
  onPromptTour: () => void;
}

export const TimerSection: FC<TimerSectionProps> = ({
  showOffer,
  qualified,
  onOfferExpire,
  savings,
  analytics,
  tourBooked,
  onPromptTour,
}) => {
  return (
    <div className="relative z-10 bg-white/80 backdrop-blur-sm">
      <AnimatePresence>
        {showOffer && !qualified && (
          <CountdownOffer
            initialMinutes={5}
            onExpire={onOfferExpire}
            offerText="Lock in your special move-in rate"
            analytics={{
              trackIncentiveOffered: analytics?.trackIncentiveOffered,
              trackIncentiveExpired: analytics?.trackIncentiveExpired,
              trackIncentiveAccepted: analytics?.trackIncentiveAccepted,
            }}
            tourBooked={tourBooked}
            onPromptTour={onPromptTour}
            onClose={onOfferExpire}
          />
        )}
      </AnimatePresence>
      {savings > 0 && (
        <motion.div
          className="px-5 py-1 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-[11px] font-medium text-gray-600 mb-0.5">
            Savings Progress: ${savings}
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(savings / 90) * 100}%` }}
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Messaging Input Component
interface MessagingInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  sendMessage: (text: string) => Promise<void>;
  akoolSession?: AkoolSessionType | null;
  isAgoraConnected: boolean;
  isDialogueModeReady: boolean;
  agentState: string | null;
}

export const MessagingInput: FC<MessagingInputProps> = ({
  inputText,
  setInputText,
  sendMessage,
  akoolSession,
  isAgoraConnected,
  isDialogueModeReady,
  agentState,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      await sendMessage(inputText);
      setInputText('');
      setIsExpanded(false);
    }
  };

  const placeholderText = akoolSession
    ? isAgoraConnected && isDialogueModeReady
      ? 'Type your message here...'
      : 'Connecting to Ava...'
    : 'Type your message here...';

  return (
    <motion.div
      className="p-4 border-t bg-white backdrop-blur-sm relative z-10"
      animate={{
        paddingBottom: isExpanded ? '20px' : '16px',
      }}
      transition={{ duration: 0.2 }}
    >
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setIsExpanded(e.target.value.length > 30);
            }}
            placeholder={placeholderText}
            disabled={akoolSession ? !(isAgoraConnected && isDialogueModeReady) : false}
            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 pr-12 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            rows={isExpanded ? 3 : 1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <motion.button
          type="submit"
          disabled={
            !inputText.trim() || (akoolSession ? !(isAgoraConnected && isDialogueModeReady) : false)
          }
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare size={18} />
        </motion.button>
      </form>
    </motion.div>
  );
};

export { SparkleBurst };
