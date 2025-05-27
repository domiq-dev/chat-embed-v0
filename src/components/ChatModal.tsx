"use client";
import React, { FC, useEffect, useRef, useState } from 'react';
import { X, MessageSquare, Phone, Mail, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import MessageStatus from "@/components/ui/MessageStatus";
import QuickReplyButtons, { QuickReplyHint, QuickReplyType } from "@/components/ui/QuicklyReplyButtons";
import FloatingBanner from "@/components/ui/FloatingBanner";
import CountdownOffer from "@/components/ui/CountdownOffer";
import { DEFAULT_APARTMENT_CONFIG } from "@/types/apartment";

// Minimal particle effect for celebrations
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
            ease: "easeOut",
            times: [0, 0.5, 1],
            delay: i * 0.1,
          }}
        />
      );
    })}
  </div>
);

// Typing indicator component
const TypingIndicator: FC = () => (
  <div className="flex items-center gap-1 px-4 py-2">
    <div className="flex gap-1">
      <motion.div
        className="w-2 h-2 bg-blue-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
    <span className="text-sm text-gray-500">Jerome is typing</span>
  </div>
);

// Live Agent Badge without pulse
const LiveAgentBadge: FC = () => (
  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
    Live Agent
  </span>
);

// Star Rating Component
const StarRating: FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < fullStars ? 'fill-yellow-400 text-yellow-400' : 
                     (i === fullStars && hasHalfStar ? 'fill-yellow-400 text-yellow-400' : 
                     'fill-gray-200 text-gray-200')}
          strokeWidth={1}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

interface Message {
  from: 'agent' | 'user';
  text: string;
  sentAt?: Date;
}

interface ChatModalProps {
  onClose: () => void;
  unreadCount?: number;
  onClearUnread?: () => void;
  config?: typeof DEFAULT_APARTMENT_CONFIG;
}

const ChatModal: FC<ChatModalProps> = ({ 
  onClose, 
  unreadCount = 0, 
  onClearUnread,
  config = DEFAULT_APARTMENT_CONFIG
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatbotState');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.messages ?? [];
      }
    }
    return [
      { 
        from: 'agent', 
        text: "🎉 Welcome to Grand Oaks Apartments! I'm Jerome. We have some beautiful apartment homes and great deals right now! Ready to begin?\n",
        sentAt: new Date()
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<QuickReplyHint | null>(null);
  const [agentState, setAgentState] = useState<string | null>(null);
  const [savings, setSavings] = useState(0);
  const [qualified, setQualified] = useState(false);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);
  const [showOffer, setShowOffer] = useState(false);
  const [offerExpired, setOfferExpired] = useState(false);

  // Clear unread count when modal opens
  useEffect(() => {
    onClearUnread?.();
  }, [onClearUnread]);

  // Update parent component when new agent messages arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.from === 'agent') {
      // Only increment if the chat window isn't focused
      if (document.visibilityState === 'hidden') {
        setLocalUnreadCount(prev => prev + 1);
      }
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Save state to localStorage
  useEffect(() => {
    const data = {
      messages,
      currentQuestion,
      agentState,
      savings,
      qualified
    };
    localStorage.setItem('chatbotState', JSON.stringify(data));
  }, [messages, currentQuestion, agentState, savings, qualified]);

  // Show sparkles when savings increase
  useEffect(() => {
    if (savings > 0) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [savings]);

  // Show offer after 30 seconds of chat
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length > 1 && !qualified && !offerExpired) {
        setShowOffer(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [messages.length, qualified, offerExpired]);

  // Handle offer expiration
  const handleOfferExpire = () => {
    setOfferExpired(true);
    setShowOffer(false);
  };

  const postText = async (text: string) => {
    setIsTyping(true);
    setMessages(prev => [...prev, { from: 'user', text, sentAt: new Date() }]);

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          agentState
        })
      });

      if (!res.ok) throw new Error(await res.text());

      let reply = '';
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          reply += chunk;

          setMessages(prev => {
            const updated = [...prev];
            if (updated[updated.length - 1]?.from === 'user') {
              updated.push({ from: 'agent', text: reply, sentAt: new Date() });
            } else {
              updated[updated.length - 1] = { ...updated[updated.length - 1], text: reply };
            }
            return updated;
          });
        }
      }

      // Update state based on response
      const stateRes = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }, { role: 'assistant', content: reply }],
          stateFetch: true,
          agentState
        })
      });

      if (stateRes.ok) {
        const data = await stateRes.json();
        setQualified(data.qualified ?? false);
        setCurrentQuestion(data.current_question);
        setAgentState(data.agentState);
        
        // Set hint if provided by backend
        if (data.hint) {
          setCurrentHint(data.hint);
        } else {
          setCurrentHint(null);
        }

        // Animate savings increase
        if (data.savings && data.savings > savings) {
          const startValue = savings;
          const endValue = data.savings;
          const duration = 1000;
          const startTime = Date.now();

          const animateSavings = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
            
            setSavings(currentValue);
            
            if (progress < 1) {
              requestAnimationFrame(animateSavings);
            }
          };

          requestAnimationFrame(animateSavings);
        }

        if (data.qualified && !showFloatingBanner) {
          setShowFloatingBanner(true);
          setShowSparkles(true);
          setTimeout(() => setShowSparkles(false), 2000);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { from: 'agent', text: 'Sorry, something went wrong 😞', sentAt: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    void postText(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 scale-[0.9] origin-bottom-right">
      <div className="bg-white rounded-lg shadow-xl w-[400px] max-h-[600px] flex flex-col relative">
        {showSparkles && <SparkleBurst />}
        
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between p-4 border-b"
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
                <img 
                  src="/social/facebook.svg" 
                  alt="Facebook"
                  className="w-[18px] h-[18px]"
                />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = 'mailto:leasing@grandoaks.com'}
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

        {/* Chat Area */}
        <div ref={containerRef} className="flex-1 bg-[#f9f9f9] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.from === 'agent' ? 'justify-start' : 'justify-end'} items-end gap-2`}
                >
                  {message.from === 'agent' && (
                    <img src="/realtor.png" alt="Agent" className="w-8 h-8 rounded-full" />
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.from === 'agent' 
                      ? 'bg-white text-gray-800 shadow-sm rounded-bl-none' 
                      : 'bg-blue-600 text-white rounded-br-none'
                  }`}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                    {message.sentAt && (
                      <div className={`text-[10px] mt-1 ${message.from === 'agent' ? 'text-gray-400' : 'text-blue-200'}`}>
                        {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && <TypingIndicator />}
          </div>
        </div>

        {/* Quick Replies */}
        {!isTyping && (currentHint || currentQuestion) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <QuickReplyButtons
              currentQuestion={currentQuestion}
              hint={currentHint || undefined}
              onSelect={(value) => void postText(value)}
            />
          </motion.div>
        )}

        {/* Countdown Offer */}
        <AnimatePresence>
          {showOffer && !qualified && (
            <CountdownOffer
              initialMinutes={15}
              onExpire={handleOfferExpire}
              offerText="Lock in your special move-in rate"
            />
          )}
        </AnimatePresence>

        {/* Savings Progress */}
        {savings > 0 && (
          <motion.div 
            className="px-5 py-2 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-medium text-gray-700 mb-1">
              Savings Progress: ${savings}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(savings / 90) * 100}%` }}
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <motion.div 
          className="border-t bg-white p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className={`p-2 rounded-full transition-colors ${
                inputText.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <MessageSquare size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showFloatingBanner && qualified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <FloatingBanner
              onClickCTA={() => setShowFloatingBanner(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatModal;
