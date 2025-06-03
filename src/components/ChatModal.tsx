"use client";
import React, { FC, useEffect, useRef, useState } from 'react';
import { X, MessageSquare, Phone, Mail, Star, Volume2, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import QuickReplyButtons, { QuickReplyHint, QuickReplyType } from "@/components/ui/QuicklyReplyButtons";
import FloatingBanner from "@/components/ui/FloatingBanner";
import CountdownOffer from "@/components/ui/CountdownOffer";
import AvatarLoadingScreen from "@/components/ui/AvatarLoadingScreen";
import ContactFormModal from "@/components/ui/ContactFormModal";
import TourBookingModal from "@/components/ui/TourBookingModal";
import CTAButtons from "@/components/ui/CTAButtons";
import { DEFAULT_APARTMENT_CONFIG } from "@/types/apartment";
import { Session as AkoolSessionType } from '../services/apiService';
import { useChatLifecycle } from '@/hooks/useChatLifecycle';
import { useLeadDataCollection } from '@/hooks/useLeadDataCollection';

// Dynamically import AgoraRTC types
import type { IAgoraRTCClient, IRemoteVideoTrack, IRemoteAudioTrack, UID, SDK_MODE, SDK_CODEC } from 'agora-rtc-sdk-ng';

// Chat message structure (remains the same)
interface ChatMessageForDisplay {
  id: string;
  from: 'agent' | 'user'; // 'agent' is our bot/AKOOL, 'user' is the human
  text: string;
  sentAt?: Date; // Changed from timestamp for consistency with existing Message type
}

interface ChatModalProps {
  onClose: () => void;
  unreadCount?: number;
  onClearUnread?: () => void;
  config?: typeof DEFAULT_APARTMENT_CONFIG;
  akoolSession?: AkoolSessionType | null;
  isSessionLoading?: boolean;
  sessionError?: string | null;
  lastMailtoClickTime?: React.MutableRefObject<number>;
}

// AKOOL video player ID
const AKOOL_PLAYER_ID = "akool-avatar-video-player";

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

// Live Agent Badge without pulse
const LiveAgentBadge: FC = () => (
  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
    Live Agent
  </span>
);

// Star Rating Component
const StarRating: FC<{ rating: number }> = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1; // Star value from 1 to 5
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
          <Star size={14} className="absolute top-0 left-0 text-gray-200 fill-gray-200" strokeWidth={1} />
          {fillPercentage > 0 && (
            <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fillPercentage}%` }}>
              <Star size={14} className="text-yellow-400 fill-yellow-400" strokeWidth={1} style={{ width: '14px', height: '14px' }} />
            </div>
          )}
        </div>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

// NEW: ChatHeader Component
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
const ChatHeader: FC<ChatHeaderProps> = ({ config, onClose, headerRef, lastMailtoClickTime, analytics }) => {
  return (
    <motion.div
      ref={headerRef}
      className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <img src={config.agent.avatar} alt="Leasing Agent" className="w-10 h-10 rounded-full object-cover border border-gray-100"/>
        <div>
          <div className="flex items-center gap-2"><span className="font-medium text-gray-900">{config.agent.name}</span><LiveAgentBadge /></div>
          <p className="text-xs text-gray-500">{config.agent.title}</p>
          <StarRating rating={config.reviews.googleRating} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {config.socialLinks.facebook && (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.open(config.socialLinks.facebook, '_blank')} className="p-2 hover:bg-gray-50 rounded-full transition-colors" title="Visit our Facebook page"><img src="/social/facebook.svg" alt="Facebook"className="w-[18px] h-[18px]"/></motion.button>)}
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => {
            console.log('ChatModal: Email button clicked - opening mailto');
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
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Close chat"><X size={18} /></motion.button>
      </div>
    </motion.div>
  );
};

// NEW: ChatBody Component
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
const ChatBody: FC<ChatBodyProps> = ({
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
  const lastAgentMessageIndex = messages.findLastIndex(msg => msg.from === 'agent');
  const shouldShowQuickReply = !isTyping && (currentHint || currentQuestion) && lastAgentMessageIndex !== -1;

  // Extract rendering of quick reply buttons to a separate element with more control
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
            // Clear the quick reply state immediately when user clicks
            setCurrentHint(null);
            setCurrentQuestion(null);
            
            // Send the message
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
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 20px, black 40px)', // Smoother fade to black
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 20px, black 40px)' // For Safari compatibility
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
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-md ${
                  message.from === 'agent'
                    ? 'bg-white/90 text-black rounded-bl-none'
                    : 'bg-gradient-to-br from-blue-500/[.90] to-purple-500/[.90] text-white rounded-br-none'
                }`}>
                  <div className={`prose prose-sm max-w-none break-words ${message.from === 'user' ? 'text-white' : ''}`}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                  {message.sentAt && (
                    <div className={`text-[10px] mt-1 ${message.from === 'agent' ? 'text-gray-500' : 'text-white/90'}`}>
                      {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Only show quick reply buttons once after the very last agent message */}
              {shouldShowQuickReply && index === lastAgentMessageIndex && index === messages.length - 1 && !isTyping && renderQuickReplyButtons()}
            </React.Fragment>
          ))}
          {/* Typing indicator as agent bubble */}
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

// NEW: TimerSection Component
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
const TimerSection: FC<TimerSectionProps> = ({
  showOffer,
  qualified,
  onOfferExpire,
  savings,
  analytics,
  tourBooked,
  onPromptTour
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
              trackIncentiveAccepted: analytics?.trackIncentiveAccepted
            }}
            tourBooked={tourBooked}
            onPromptTour={onPromptTour}
            onClose={onOfferExpire}
          />
        )}
      </AnimatePresence>
      {savings > 0 && (
        <motion.div className="px-5 py-1 border-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="text-[11px] font-medium text-gray-600 mb-0.5">Savings Progress: ${savings}</div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(savings / 90) * 100}%` }} className="h-full bg-gradient-to-r from-green-400 to-blue-500" transition={{ duration: 0.5, ease: "easeOut" }}/></div>
        </motion.div>
      )}
    </div>
  );
};

// NEW: MessagingInput Component
interface MessagingInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  sendMessage: (text: string) => Promise<void>;
  akoolSession?: AkoolSessionType | null;
  isAgoraConnected: boolean;
  isDialogueModeReady: boolean;
  agentState: string | null;
}
const MessagingInput: FC<MessagingInputProps> = ({
  inputText,
  setInputText,
  sendMessage,
  akoolSession,
  isAgoraConnected,
  isDialogueModeReady,
  agentState
}) => {
  return (
    <motion.div
      className="border-t bg-white/90 backdrop-blur-sm p-3 relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={akoolSession && isAgoraConnected ? 
            (isDialogueModeReady ? "Chat with Us..." : "Preparing Leasing Agent...") : 
            "Type your message..."}
          className="flex-1 px-3 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white/70 text-sm"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
          disabled={!(akoolSession && isAgoraConnected && isDialogueModeReady) && !agentState}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim() || (!(akoolSession && isAgoraConnected && isDialogueModeReady) && !agentState)}
          className={`p-1.5 rounded-full transition-colors ${
            (inputText.trim() && ((akoolSession && isAgoraConnected && isDialogueModeReady) || agentState))
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <MessageSquare size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const ChatModal: FC<ChatModalProps> = ({ 
  onClose, 
  unreadCount = 0, 
  onClearUnread,
  config = DEFAULT_APARTMENT_CONFIG,
  akoolSession,
  isSessionLoading,
  sessionError,
  lastMailtoClickTime
}) => {
  const [messages, setMessages] = useState<ChatMessageForDisplay[]>(() => {
    // Clear localStorage and start fresh session on every page load
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatbotState');
    }
    // Start with empty messages - avatar will deliver opening statement
    return [];
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
  const [showSessionEndedOverlay, setShowSessionEndedOverlay] = useState(false);
  const [tourBooked, setTourBooked] = useState(false);
  
  // Modal states for new components
  const [showContactForm, setShowContactForm] = useState(false);
  const [showTourBooking, setShowTourBooking] = useState(false);

  // NEW: Session tracking state for 18/18 analytics completion
  const [sessionStartTime] = useState(Date.now());
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [lastActivityType, setLastActivityType] = useState<string>('session_start');
  const [inactivityTimeout, setInactivityTimeout] = useState<NodeJS.Timeout | null>(null);
  const [conversationStage, setConversationStage] = useState<'initial' | 'engaged' | 'qualified' | 'converted'>('initial');

  // AKOOL/Agora specific state
  const [AgoraRTCModule, setAgoraRTCModule] = useState<any>(null);
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const [isAgoraConnected, setIsAgoraConnected] = useState(false);
  const [hasVideoStarted, setHasVideoStarted] = useState(false);
  const [akoolSessionError, setAkoolSessionError] = useState<string | null>(null);
  const isSendingRef = useRef(false);
  const [isAvatarBuffering, setIsAvatarBuffering] = useState(false);
  const [isDialogueModeReady, setIsDialogueModeReady] = useState(false); // NEW: Track dialogue mode status

  // Add these state variables near the top with other useState calls
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turnId, setTurnId] = useState(0);

  // Add this state near the other state variables in ChatModal
  const [afterTypingCallback, setAfterTypingCallback] = useState<(() => void) | null>(null);
  
  // Track if opening statement has been delivered to prevent duplicates
  const [hasDeliveredOpening, setHasDeliveredOpening] = useState(false);

  // Determine video player background - now always black when session is active
  const videoPlayerBgColor = akoolSession ? '#222' : 'white';
  // Initial message color if no session (white background)
  const initialMessageColor = akoolSession ? 'text-white' : 'text-gray-700'; 

  // Ref and state for header height
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Initialize analytics tracking for chat lifecycle
  const analytics = useChatLifecycle({
    // We'll add the chatSdk when we have proper SDK integration
    // For now, we'll use the manual tracking functions
  });

  // Initialize lead data collection with chatbot ID
  const {
    leadData,
    updateUser,
    updateConversation,
    addMessage,
    sendLeadData
  } = useLeadDataCollection('your-chatbot-uuid-here'); // We'll use real ID later

  // Helper function to set avatar parameters
  const setAvatarParams = async (client: any, params: {
    vid: string; // voice ID
    lang: string; // language 
    mode: number; // mode (1 or 2)
  }) => {
    if (!client || typeof client.sendStreamMessage !== 'function') {
      throw new Error('Client does not support sendStreamMessage');
    }
    
    const message = {
      v: 2,
      type: "command",
      mid: `set-params-${Date.now()}`,
      pld: {
        cmd: "set-params",
        data: {
          vid: params.vid,
          lang: params.lang,
          mode: params.mode
        }
      }
    };
    
    console.log("ChatModal: Setting avatar parameters:", message);
    await client.sendStreamMessage(JSON.stringify(message), false);
    console.log("ChatModal: Avatar parameters set successfully");
  };

  // Helper function to send message to avatar
  const sendMessageToAvatar = async (client: any, messageId: string, text: string) => {
    if (!client || typeof client.sendStreamMessage !== 'function') {
      throw new Error('Client does not support sendStreamMessage');
    }
    
    const message = {
      v: 2,
      type: "chat",
      mid: messageId,
      idx: 0,
      fin: true,
      pld: { text: text }
    };
    
    console.log("ChatModal: Sending message to avatar:", message);
    await client.sendStreamMessage(JSON.stringify(message), false);
    console.log("ChatModal: Message sent to avatar successfully");
  };

  // NEW: Activity tracking and session management for 18/18 analytics completion
  const updateActivity = (activityType: string) => {
    setLastActivityTime(Date.now());
    setLastActivityType(activityType);
    
    // Clear existing timeout
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    
    // Set new inactivity timeout (5 minutes)
    const timeout = setTimeout(() => {
      const sessionDuration = Date.now() - sessionStartTime;
      analytics.trackConversationAbandoned(sessionDuration, messages.length, activityType);
    }, 5 * 60 * 1000); // 5 minutes
    
    setInactivityTimeout(timeout);
  };

  // Enhanced close handler with session end tracking
  const handleClose = async () => {
    const sessionDuration = Date.now() - sessionStartTime;
    analytics.trackWidgetSessionEnded('user_closed', sessionDuration, messages.length);
    
    // Clear timeout
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    
    // NEW: Send lead data before closing
    try {
      // Always try to send lead data on close (in case real-time submission failed)
      if (leadData.messages.length > 0 || leadData.user.email || leadData.user.phone) {
        await sendLeadData();
        console.log("✅ Lead data saved on close");
      } else {
        console.log("ℹ️ No lead data to save");
      }
    } catch (error) {
      console.error('❌ Failed to save lead data on close:', error);
      // Continue with close even if save fails
    }
    
    onClose();
  };

  // Dynamically import AgoraRTC SDK
  useEffect(() => {
    import('agora-rtc-sdk-ng').then(module => {
      setAgoraRTCModule(module.default);
      console.log("Agora RTC SDK loaded for ChatModal");
    }).catch(err => {
      console.error("Failed to load Agora RTC SDK in ChatModal:", err);
      setAkoolSessionError("Agora SDK failed to load. Video features disabled.");
    });
  }, []);

  // Effect to measure header height
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [headerRef.current]); // Re-run if headerRef changes (though it shouldn't often)

  // Effect for Agora RTC client setup and teardown, dependent on akoolSession
  useEffect(() => {
    if (!AgoraRTCModule || !akoolSession?.credentials) {
      if (agoraClientRef.current && isAgoraConnected) {
        console.log("ChatModal: Leaving Agora channel due to missing module or session.");
        agoraClientRef.current.leave()
          .then(() => { 
            setIsAgoraConnected(false); 
            setHasVideoStarted(false);
            setIsAvatarBuffering(false);
            setIsDialogueModeReady(false); // Reset dialogue mode status
            setHasDeliveredOpening(false); // Reset opening statement flag
            agoraClientRef.current = null; 
          })
          .catch(e => console.error('Error leaving Agora channel during cleanup:', e));
      }
      setIsAvatarBuffering(false);
      setShowSessionEndedOverlay(false);
      setIsDialogueModeReady(false); // Reset dialogue mode status
      setHasDeliveredOpening(false); // Reset opening statement flag
      return;
    }

    console.log("ChatModal: AgoraRTCModule and akoolSession credentials present. Setting up Agora client.");
    setIsAvatarBuffering(true);
    setShowSessionEndedOverlay(false);
    setHasDeliveredOpening(false); // Reset opening statement flag for new session
    let clientInstance: IAgoraRTCClient | null = null;
    try {
      clientInstance = AgoraRTCModule.createClient({ mode: 'rtc' as SDK_MODE, codec: 'vp8' as SDK_CODEC });
    } catch (error) {
      console.error("ChatModal: Failed to create Agora client:", error);
      setAkoolSessionError("Failed to initialize Agora client. Please refresh.");
      return;
    }
    
    if (!clientInstance) {
        console.error("ChatModal: Agora client creation returned null unexpectedly.");
        setAkoolSessionError("Failed to initialize Agora client (instance is null).");
        return;
    }
    agoraClientRef.current = clientInstance;
    const currentActiveClient = clientInstance;
    let hasJoined = false;

    const handleUserPublished = async (user: any, mediaType: 'video' | 'audio') => {
      if (!currentActiveClient) return;
      console.log(`ChatModal: Agora user ${user.uid} published ${mediaType}`);
      try {
        await currentActiveClient.subscribe(user, mediaType); // Subscribe first

        if (mediaType === 'video') {
          const videoTrack = user.videoTrack as IRemoteVideoTrack;
          const videoPlayerDiv = document.getElementById(AKOOL_PLAYER_ID);

          if (videoTrack && videoPlayerDiv) {
            const firstFrameDecodedHandler = () => {
              console.log(`ChatModal: Video track first-frame-decoded for user ${user.uid}.`);
              setHasVideoStarted(true);
              setIsAvatarBuffering(false);
              setShowSessionEndedOverlay(false);
            };
            videoTrack.once('first-frame-decoded', firstFrameDecodedHandler);
            console.log(`ChatModal: Playing remote video track in ${AKOOL_PLAYER_ID} for user ${user.uid}`);
            videoTrack.play(videoPlayerDiv);
          } else {
            const warningMsg = `ChatModal: Video track or player div ('${AKOOL_PLAYER_ID}') not found for user ${user.uid}.`;
            console.warn(warningMsg);
            setAkoolSessionError(prev => prev || "Video player element not found.");
            setIsAvatarBuffering(false);
          }
        }
        if (mediaType === 'audio') {
          console.log(`ChatModal: Remote user ${user.uid} published audio. Attempting to play.`);
          if (user.audioTrack) {
            (user.audioTrack as IRemoteAudioTrack).play();
          } else {
            console.warn(`ChatModal: Audio track not available for user ${user.uid}.`);
          }
        }
      } catch (e: any) {
        const errorMsg = `ChatModal: Error in handleUserPublished for ${mediaType} track (user ${user.uid}): ${e.message}`;
        console.error(errorMsg, e);
        setAkoolSessionError(prev => prev || `Failed to handle media: ${e.message}`);
        setIsAvatarBuffering(false);
      }
    };

    const handleUserUnpublished = (user: any, mediaType: 'video' | 'audio') => {
      console.log(`ChatModal: Agora user ${user.uid} unpublished ${mediaType}`);
      console.log('ChatModal: Current connection state:', agoraClientRef.current?.connectionState);
      console.log('ChatModal: Current video started state:', hasVideoStarted);
      if (mediaType === 'video') {
        console.log('ChatModal: Video unpublished - ending session');
        setHasVideoStarted(false);
        setShowSessionEndedOverlay(true);
        setIsAvatarBuffering(false);
      }
    };

    const handleStreamMessage = (uid: UID, data: Uint8Array | string) => {
      try {
        const messageStr = typeof data === 'string' ? data : new TextDecoder().decode(data as Uint8Array);
        console.log('ChatModal: Received stream message from UID:', uid, 'Data:', messageStr);
        const parsedMessage = JSON.parse(messageStr);

        // Only process agent/bot messages, ignore user echoes
        if (
          parsedMessage.type === 'chat' &&
          (parsedMessage.pld?.from === 'bot' || parsedMessage.pld?.from === undefined || parsedMessage.pld?.from === null) &&
          parsedMessage.pld?.text
        ) {
          const displayBotMessageId = `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
          setMessages(prev => [
            ...prev,
            {
              id: displayBotMessageId,
              from: 'agent',
              text: parsedMessage.pld.text,
              sentAt: new Date(),
            },
          ]);
          analytics.trackBotMessage();
          addMessage('user', parsedMessage.pld.text);
        } else {
          // Ignore user messages or unknown types
          console.log('ChatModal: Ignored stream message:', parsedMessage);
        }
      } catch (e) {
        console.error('ChatModal: Error processing stream message:', e, 'Raw data:', data);
      }
    };

    // NEW: Token expiration handlers for better session management
    const handleTokenWillExpire = () => {
      console.log('ChatModal: Agora token will expire soon - preparing for renewal');
      // When token expires and renews, dialogue mode often gets reset
      // We'll re-establish it after the renewal
    };

    const handleTokenDidExpire = () => {
      console.error('ChatModal: Agora token expired - connection will be lost');
      setAkoolSessionError('Session expired. Please close and reopen chat.');
      setIsAgoraConnected(false);
      setHasVideoStarted(false);
      setShowSessionEndedOverlay(true);
      setIsDialogueModeReady(false); // Reset dialogue mode on token expiry
    };

    // NEW: Connection state change handler
    const handleConnectionStateChange = (curState: string, revState: string) => {
      console.log(`ChatModal: Agora connection state changed from ${revState} to ${curState}`);
      
      if (curState === 'DISCONNECTED' || curState === 'DISCONNECTING') {
        setIsAgoraConnected(false);
        setHasVideoStarted(false);
        setIsAvatarBuffering(false);
        setIsDialogueModeReady(false); // Reset dialogue mode status when disconnected
        
        // Only show session ended if we were previously connected
        if (revState === 'CONNECTED') {
          setShowSessionEndedOverlay(true);
          setAkoolSessionError('Connection lost. Please close and reopen chat.');
        }
      } else if (curState === 'CONNECTED') {
        setIsAgoraConnected(true);
        setAkoolSessionError(null); // Clear any previous errors
        setShowSessionEndedOverlay(false);
        
        // Only re-establish dialogue mode for RECONNECTIONS, not initial connections
        if (revState === 'RECONNECTING') {
          console.log('ChatModal: Reconnected - re-establishing dialogue mode');
          setTimeout(() => {
            setupAvatarDialogueMode();
          }, 1000); // Give connection a moment to stabilize
        }
        
      } else if (curState === 'CONNECTING' || curState === 'RECONNECTING') {
        setIsAvatarBuffering(true);
        setAkoolSessionError(null);
        setIsDialogueModeReady(false); // Reset while reconnecting
      }
    };

    // Set up avatar for dialogue mode with opening statement once connected
    const setupAvatarDialogueMode = async (isRetry = false) => {
      if (currentActiveClient && typeof (currentActiveClient as any).sendStreamMessage === 'function') {
        try {
          // Define voice and language settings
          const voiceId = "Xb7hH8MSUJpSbSDYk0k2"; // Alice voice
          const language = "en"; // English
          
          console.log("ChatModal: Setting up avatar with voice ID and opening statement");
          
          // Initial setup with dialogue mode
          await setAvatarParams(currentActiveClient, {
            vid: voiceId,
            lang: language,
            mode: 1, // Start with dialogue mode
          });
          
          setIsDialogueModeReady(true);
          console.log("ChatModal: Avatar dialogue mode configured successfully");
          
          // Only deliver opening statement once
          if (!hasDeliveredOpening) {
            setHasDeliveredOpening(true);
            
            // Opening statement with voice configuration sequence
            setTimeout(async () => {
              try {
                // Temporarily switch to mode 1 for welcome message
                await setAvatarParams(currentActiveClient, {
                  vid: voiceId,
                  lang: language,
                  mode: 1,
                });

                // Send welcome message (will appear in chat once)
                await sendMessageToAvatar(
                  currentActiveClient,
                  `welcome-${Date.now()}`,
                  'Hi! Welcome to Grand Oaks Apartments! I\'m Ava, your leasing specialist. How can I help you today?'
                );

                // Switch back to dialogue mode
                await setAvatarParams(currentActiveClient, {
                  vid: voiceId,
                  lang: language,
                  mode: 1,
                });
                
                console.log("ChatModal: Opening statement delivered and switched back to dialogue mode");
                
              } catch (error) {
                console.warn("ChatModal: Failed to deliver opening statement:", error);
              }
            }, 2000);
          }
          
        } catch (error) {
          console.error("ChatModal: Failed to setup avatar dialogue mode:", error);
          // More aggressive retry for dialogue mode
          if (!isRetry) {
            setTimeout(() => {
              console.log("ChatModal: Retrying dialogue mode setup...");
              setupAvatarDialogueMode(true);
            }, 3000); // Longer delay before retry
          } else {
            console.error("ChatModal: Dialogue mode setup failed after retry - may experience echoing");
            setAkoolSessionError('Dialogue mode setup failed - avatar may echo messages');
            setIsDialogueModeReady(true); // Allow chat to continue even if setup failed
          }
        }
      }
    };

    const { agora_app_id, agora_channel, agora_token, agora_uid } = akoolSession.credentials;
    
    // Set up all event handlers
    currentActiveClient.on('user-published', handleUserPublished);
    currentActiveClient.on('user-unpublished', handleUserUnpublished);
    currentActiveClient.on('stream-message', handleStreamMessage);
    
    // NEW: Add token expiration handlers
    currentActiveClient.on('token-privilege-will-expire', handleTokenWillExpire);
    currentActiveClient.on('token-privilege-did-expire', handleTokenDidExpire);
    
    // NEW: Add connection state handler
    currentActiveClient.on('connection-state-change', handleConnectionStateChange);
    
    console.log("ChatModal: Joining Agora channel...", {agora_app_id, agora_channel, agora_uid});
    currentActiveClient.join(agora_app_id, agora_channel, agora_token, agora_uid)
      .then(() => {
        setIsAgoraConnected(true);
        hasJoined = true;
        console.log("ChatModal: Successfully joined Agora channel.");
        // Set up dialogue mode immediately after joining
        setupAvatarDialogueMode();
      })
      .catch(err => {
        setAkoolSessionError(`Agora join error: ${err.message}`);
        setIsAgoraConnected(false);
        setHasVideoStarted(false);
        setIsAvatarBuffering(false);
        console.error("ChatModal: Agora join error:", err);
      });

    return () => {
      console.log("ChatModal: Cleaning up Agora client for session:", akoolSession?._id);
      setIsAvatarBuffering(false);
      if (currentActiveClient) {
        // Remove all event handlers
        currentActiveClient.off('user-published', handleUserPublished);
        currentActiveClient.off('user-unpublished', handleUserUnpublished);
        currentActiveClient.off('stream-message', handleStreamMessage);
        currentActiveClient.off('token-privilege-will-expire', handleTokenWillExpire);
        currentActiveClient.off('token-privilege-did-expire', handleTokenDidExpire);
        currentActiveClient.off('connection-state-change', handleConnectionStateChange);
        
        if (hasJoined || currentActiveClient.connectionState === 'CONNECTING' || currentActiveClient.connectionState === 'CONNECTED') {
          currentActiveClient.leave()
            .catch(e => console.error('ChatModal: Error leaving Agora channel on cleanup:', e))
            .finally(() => {
              if (agoraClientRef.current === currentActiveClient) {
                setIsAgoraConnected(false);
                setHasVideoStarted(false);
                setIsDialogueModeReady(false); // Reset dialogue mode status
                agoraClientRef.current = null;
                 console.log("ChatModal: Agora client left and cleaned up.");
              }
            });
        } else {
           if (agoraClientRef.current === currentActiveClient) {
             setIsAgoraConnected(false);
             setHasVideoStarted(false);
             setIsDialogueModeReady(false);
             agoraClientRef.current = null; 
             console.log("ChatModal: Agora client (not fully joined) cleaned up.");
           }
        }
      }
    };
  }, [akoolSession, AgoraRTCModule]);

  // NEW: Handle page visibility changes to maintain session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Add a small delay before checking connection to avoid false positives
        // from UI interactions that briefly change focus
        setTimeout(() => {
          console.log('ChatModal: Tab became visible - checking connection state');
          if (agoraClientRef.current && akoolSession) {
            const connectionState = agoraClientRef.current.connectionState;
            console.log('ChatModal: Current Agora connection state:', connectionState);
            
            if (connectionState === 'DISCONNECTED' && !showSessionEndedOverlay) {
              console.log('ChatModal: Connection lost while tab was hidden - showing reconnection UI');
              setShowSessionEndedOverlay(true);
              setAkoolSessionError('Connection lost while tab was inactive. Please close and reopen chat.');
            }
          }
        }, 500); // Wait 500ms before checking
      } else {
        console.log('ChatModal: Tab became hidden - session will continue in background');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [akoolSession, showSessionEndedOverlay]);

  // NEW: Keep-alive mechanism for sessions
  useEffect(() => {
    if (!akoolSession || !isAgoraConnected) return;

    const keepAliveInterval = setInterval(() => {
      if (agoraClientRef.current && agoraClientRef.current.connectionState === 'CONNECTED') {
        console.log('ChatModal: Sending keep-alive ping');
        // Send a small keep-alive message to maintain connection
        try {
          const keepAliveMessage = {
            v: 2,
            type: "ping",
            mid: `ping-${Date.now()}`,
            pld: {}
          };
          // @ts-ignore
          agoraClientRef.current.sendStreamMessage(JSON.stringify(keepAliveMessage), false);
        } catch (error) {
          console.warn('ChatModal: Keep-alive ping failed:', error);
        }
      }
    }, 30000); // Send keep-alive every 30 seconds

    return () => clearInterval(keepAliveInterval);
  }, [akoolSession, isAgoraConnected]);

  // Existing useEffects for local chat functionality (unread count, scroll, localStorage)
  useEffect(() => { onClearUnread?.(); }, [onClearUnread]);
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.from === 'agent') {
      if (document.visibilityState === 'hidden') setLocalUnreadCount(prev => prev + 1);
    }
  }, [messages]);
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);
  useEffect(() => {
    if (savings > 0) { setShowSparkles(true); const timer = setTimeout(() => setShowSparkles(false), 2000); return () => clearTimeout(timer); }
  }, [savings]);
  useEffect(() => {
    const timer = setTimeout(() => { if (messages.length > 1 && !qualified && !offerExpired) setShowOffer(true); }, 30000);
    return () => clearTimeout(timer);
  }, [messages.length, qualified, offerExpired]);
  const handleOfferExpire = () => { setOfferExpired(true); setShowOffer(false); };

  // Expand the helper function to include all variable types
  const getQuickReplyHint = (variable: string): QuickReplyHint | null => {
    switch (variable) {
      case 'Full_name':
        return {
          type: QuickReplyType.TEXT_INPUT,
          placeholder: 'Enter your full name'
        };
        
      case 'Bedroom_size':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['1BR', '2BR', '3BR'],
          placeholder: 'How many bedrooms would you like?'
        };
        
      case 'Calendar':
        return {
          type: QuickReplyType.DATE,
          placeholder: 'When are you planning to move?',
          min: new Date().toISOString().split('T')[0],
          max: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
      case 'User_action':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['Ask Some Questions', 'Schedule A Tour', 'Get Pre-Qualified', 'Apply Now'],
          placeholder: 'How can I best help you, what would you like to do now?'
        };
        
      case 'Faq':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['What is Grand Oaks near?', 'What are the amenities?', 'What\'s available/pricing?'],
          placeholder: 'What would you like to know?'
        };
        
      case 'YES/NO':
        return {
          type: QuickReplyType.BOOLEAN,
          options: ['Yes', 'No'],
          placeholder: 'Please choose:'
        };
        
      case 'Incentive':
        return {
          type: QuickReplyType.INCENTIVE,
          options: ['Sign Me Up!', 'Turn it Down'],
          placeholder: 'Would you like to save money?'
        };
        
      case 'Price_range':
        return {
          type: QuickReplyType.RANGE,
          placeholder: 'Do you have a price range in mind?',
          min: 1000,
          max: 5000
        };
        
      case 'Work_place':
        return {
          type: QuickReplyType.TEXT_INPUT,
          placeholder: 'Enter your company name'
        };
        
      case 'Occupancy':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['1', '2', '3', '4'],
          placeholder: 'How many people will be living at your apartment home?'
        };
        
      case 'Pet':
        return {
          type: QuickReplyType.PET_INPUT,
          options: ['Yes', 'No'],
          placeholder: 'Are you bringing any furry friends with you?'
        };
        
      case 'Features':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: [
            'Cable & Wifi incl.',
            'Spacious Units', 
            'W/D Connections',
            'W/D Included',
            'Quiet and Great Location',
            'Pool & Clubhouse',
            'Business Ctr'
          ],
          placeholder: 'Are you looking for any special features in your home?'
        };
        
      case 'Tour':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['In-Person Tour', 'Self-guided Tour', 'Virtual Tour'],
          placeholder: 'What type of tour would you prefer?'
        };
        
      default:
        return null;
    }
  };

  // Helper function to scroll chat to bottom
  const scrollToBottom = () => {
    if (containerRef.current) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
      }, 0);
    }
  };

  // sendMessage function: decides whether to send to backend agent or AKOOL
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Clear any existing hints immediately to prevent flashing
    setCurrentHint(null);
    setCurrentQuestion(null);
    setAfterTypingCallback(null);
    
    // NEW: Update activity tracking
    updateActivity('user_message');
    
    // NEW: Update conversation stage based on message content and context
    if (conversationStage === 'initial' && messages.length > 2) {
      setConversationStage('engaged');
    } else if (qualified && conversationStage === 'engaged') {
      setConversationStage('qualified');
    }
    
    const userMessageId = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userMessage: ChatMessageForDisplay = { 
        id: userMessageId, 
        from: 'user', 
        text: text.trim(), 
        sentAt: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Track user message sent
    analytics.trackUserMessage(text.trim());

    // NEW: Track user message
    addMessage('user', text);

    // If AKOOL session is active, send text to AKOOL for TTS
    if (akoolSession && agoraClientRef.current && isAgoraConnected && AgoraRTCModule) {
      // Check if dialogue mode is ready before sending messages
      if (!isDialogueModeReady) {
        console.log('ChatModal: Dialogue mode not ready yet, falling back to backend agent.');
        postTextToBackendAgent(text.trim(), userMessageId);
        return;
      }
      
      if (isSendingRef.current) {
        console.log('ChatModal: Send to AKOOL already in progress, skipping.');
        return;
      }
      isSendingRef.current = true;
      
      // Add a slight delay before showing typing indicator to make it feel more natural
      setTimeout(() => {
        setIsTyping(true); // Show typing indicator for LLM/AKOOL
        scrollToBottom(); // Scroll to see typing indicator
      }, 1200); // 1.2 second delay for a more natural feel

      const localAgoraClient = agoraClientRef.current;
      if (typeof (localAgoraClient as any).sendStreamMessage !== 'function') {
        console.error('ChatModal: sendStreamMessage method does not exist on Agora client.');
        setAkoolSessionError('Cannot send message to avatar: method not found.');
        isSendingRef.current = false;
        setIsTyping(false);
        return;
      }

      // Call LLM API to get response
      let llmResponse = text.trim(); // fallback
      
      // Generate conversation ID once, then reuse it
      const currentConversationId = conversationId || `conv-${Date.now()}`;
      const currentTurnId = turnId + 1;

      try {
        const response = await fetch('/api/llm/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_message: text.trim(),
            conversation_id: currentConversationId,  // ✅ Always has a value
            turn_id: currentTurnId,                  // ✅ Incrementing turn number
            end_signal: false
          }),
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.completed_reply) {
                  llmResponse = data.completed_reply;
                }
                
                // ✅ NEW: Capture initial summary data
                if (data.data?.final_summary) {
                  console.log('📊 Capturing initial LLM summary data:', {
                    ai_intent_summary: data.data.final_summary.ai_intent_summary,
                    qualified: data.data.final_summary.qualified
                  });
                  
                  // Update lead data with summary (no book_tour)
                  updateConversation({
                    ai_intent_summary: data.data.final_summary.ai_intent_summary
                  });
                }
                
                // ✨ EXISTING: Variables update logic
                if (data.final_variables_update) {
                  console.log("🎯 Variables update:", data.final_variables_update);
                  
                  // Find which variable is currently true (being asked for)
                  const activeVariable = Object.keys(data.final_variables_update).find(
                    key => data.final_variables_update[key] === true
                  );
                  
                  if (activeVariable && !isTyping) { // Only set when not typing
                    setCurrentQuestion(activeVariable);
                    console.log("📝 Active question:", activeVariable);
                    
                    // Set appropriate quick reply hint based on the variable
                    const hint = getQuickReplyHint(activeVariable);
                    if (hint) {
                      setCurrentHint(hint);
                      console.log("💡 Quick reply hint:", hint);
                    }
                  } else {
                    // Store the activeVariable for later use when typing finishes
                    if (activeVariable) {
                      const pendingVariable = activeVariable;
                      const pendingHint = getQuickReplyHint(activeVariable);
                      
                      // Set a callback to be executed after typing finishes
                      const setHintsAfterTyping = () => {
                        if (pendingVariable) {
                          setCurrentQuestion(pendingVariable);
                          if (pendingHint) {
                            setCurrentHint(pendingHint);
                          }
                        }
                      };
                      
                      // Store this callback to be used when typing finishes
                      setAfterTypingCallback(() => setHintsAfterTyping);
                    } else {
                      // No active variables - clear quick replies
                      setCurrentQuestion(null);
                      setCurrentHint(null);
                    }
                  }
                }

                // ✅ NEW: Capture final qualification data
                if (data.completed_reply && data.is_qualified !== undefined) {
                  console.log('📊 Capturing final LLM qualification data:', {
                    is_qualified: data.is_qualified,
                    kb_pending: data.kb_pending
                  });
                  
                  // Update lead data with qualification results
                  updateConversation({
                    is_qualified: data.is_qualified,
                    kb_pending: data.kb_pending
                  });
                  
                  console.log('✅ Qualification data captured successfully');
                }
              } catch (parseError) {
                // ignore parsing errors
              }
            }
          }
          // ✅ Update conversation state after successful LLM call
          if (!conversationId) {
            setConversationId(currentConversationId);
          }
          setTurnId(currentTurnId);
        }
      } catch (error) {
        console.error("LLM API error:", error);
      }

      const agoraMessage = {
        v: 2, type: "chat", mid: userMessageId, idx: 0, fin: true,
        pld: { text: llmResponse }, // Send LLM response instead of user input
      };

      try {
        console.log("ChatModal: Sending message to AKOOL avatar:", agoraMessage);
        // @ts-ignore - Assuming sendStreamMessage exists despite type issues seen previously
        await (localAgoraClient as IAgoraRTCClient).sendStreamMessage(JSON.stringify(agoraMessage), false);
        // Bot response will be handled by 'stream-message' listener
      } catch (error) {
        console.error('ChatModal: Failed to send stream message to AKOOL:', error);
        setAkoolSessionError('Failed to send message to avatar. Check console.');
        // Optionally add an error message to chat for the user
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, from: 'agent', text: "Sorry, I couldn't say that.", sentAt: new Date()}]);
      } finally {
          setTimeout(() => { isSendingRef.current = false; }, 100); 
          setIsTyping(false); // Hide typing indicator after response
      }
    } else {
      // Fallback to existing backend agent if AKOOL is not active
      console.log("ChatModal: AKOOL not active, sending to backend text agent.");
      postTextToBackendAgent(text.trim(), userMessageId); // Use separate function for clarity
    }
  };
  
  // Extracted backend posting logic
  const postTextToBackendAgent = async (text: string, originalUserMessageId: string) => {
    // Add a slight delay before showing typing indicator to make it feel more natural
    setTimeout(() => {
      setIsTyping(true); // Show backend agent typing indicator
      scrollToBottom(); // Scroll to see typing indicator
    }, 1200); // 1.2 second delay for a more natural feel
    
    // NEW: Track activity for backend agent interaction
    updateActivity('backend_agent_query');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate typing
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })), agentState })
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
            // Ensure we are updating/adding the backend agent's response, not the user's echo from AKOOL
            const lastMessage = updated[updated.length - 1];
            if (lastMessage?.from === 'user' && lastMessage.id === originalUserMessageId) {
              updated.push({ id: `backend-agent-${Date.now()}`, from: 'agent', text: reply, sentAt: new Date() });
            } else if (lastMessage?.from === 'agent'){
              updated[updated.length - 1] = { ...lastMessage, text: reply };
            }
            return updated;
          });
        }
      }
      
      // NEW: Detect escalation patterns in the response
      const lowerReply = reply.toLowerCase();
      if (lowerReply.includes('contact our leasing office') || 
          lowerReply.includes('speak with an agent') || 
          lowerReply.includes('call us directly')) {
        analytics.trackAdminHandoffTriggered('automated_escalation', conversationStage);
      }
      
      // NEW: Detect complex queries that might need escalation
      const complexKeywords = ['legal', 'lawsuit', 'emergency', 'urgent', 'complaint', 'issue', 'problem'];
      if (complexKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        analytics.trackCustomerServiceEscalated('complex_query', text);
      }
      
      // Track bot message received for backend response
      if (reply) {
        analytics.trackBotMessage();
      }
      
      const stateRes = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ messages: [...messages, {from: 'user', text, sentAt: new Date()}, {from: 'agent', text: reply, sentAt: new Date()}], stateFetch: true, agentState })
      });
      if (stateRes.ok) {
        const data = await stateRes.json();
        setQualified(data.qualified ?? false);
        setAgentState(data.agentState);
        
        // Only set up hints if we have a question or hint
        if (data.current_question || data.hint) {
          const pendingQuestion = data.current_question;
          const pendingHint = data.hint || (data.current_question ? getQuickReplyHint(data.current_question) : null);
          
          console.log('Setting up pending hint for after typing:', pendingQuestion, pendingHint);
          
          // Set a callback to be executed after typing finishes
          const setHintsAfterTyping = () => {
            console.log('Applying pending hint after typing:', pendingQuestion, pendingHint);
            if (pendingQuestion) {
              setCurrentQuestion(pendingQuestion);
            }
            if (pendingHint) {
              setCurrentHint(pendingHint);
            }
          };
          
          // Store this callback to be used when typing finishes
          setAfterTypingCallback(() => setHintsAfterTyping);
        } else {
          // No hints needed - make sure they're cleared
          setAfterTypingCallback(() => {
            setCurrentQuestion(null);
            setCurrentHint(null);
          });
        }
        
        if (data.savings && data.savings > savings) {
            const startValue = savings; const endValue = data.savings; const duration = 1000; const startTime = Date.now();
            const animateSavings = () => { const now = Date.now(); const progress = Math.min((now - startTime) / duration, 1); const currentValue = Math.floor(startValue + (endValue - startValue) * progress); setSavings(currentValue); if (progress < 1) requestAnimationFrame(animateSavings); };
          requestAnimationFrame(animateSavings);
        }
        if (data.qualified && !showFloatingBanner) { 
          setShowFloatingBanner(true); 
          setShowSparkles(true); 
          setTimeout(() => setShowSparkles(false), 2000);
          
          // Track incentive acceptance when someone qualifies
          analytics.trackIncentiveAccepted('qualification_bonus');
        }
      }

      // Check for fallback patterns in response
      const responseText = reply.toLowerCase();
      if (responseText.includes("sorry, i don't understand") || 
          responseText.includes("i'm not sure") ||
          responseText.includes("could you please") ||
          responseText.includes("can you rephrase") ||
          reply.trim().length < 10) {
        analytics.trackFallback('no_match');
      }
    } catch (err) {
      console.error(err);
      
      // Track fallback event when errors occur
      analytics.trackFallback('error');
      
      setMessages(prev => [...prev, { id: `err-backend-${Date.now()}`, from: 'agent', text: 'Sorry, something went wrong 😞', sentAt: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Modal handlers for new components
  const handleContactFormSubmit = (contactData: { 
    name: string; 
    email?: string; 
    phone?: string; 
    method: 'email' | 'phone' 
  }) => {
    console.log('Contact form submitted:', contactData);
    
    // NEW: Update conversation stage and activity
    if (conversationStage !== 'converted') {
      setConversationStage('qualified');
    }
    updateActivity('contact_capture');
    
    // Add a success message to the chat
    const successMessage = `Thank you ${contactData.name}! We'll reach out to you via ${contactData.method === 'email' ? 'email' : 'phone'} soon.`;
    setMessages(prev => [...prev, { 
      id: `contact-success-${Date.now()}`, 
      from: 'agent', 
      text: successMessage, 
      sentAt: new Date() 
    }]);
    
    // NEW: Update user data only
    const [firstName, ...lastNameParts] = contactData.name.split(' ');
    updateUser({
      first_name: firstName,
      last_name: lastNameParts.join(' '),
      email: contactData.email,
      phone: contactData.phone
    });
  };

  const handleTourBookingSubmit = (tourData: { 
    name: string; 
    email: string; 
    tourType: 'in_person' | 'self_guided' | 'virtual';
    preferredDate?: string;
    preferredTime?: string;
  }) => {
    console.log('Tour booking submitted:', tourData);
    
    // NEW: Update conversation stage to converted
    setConversationStage('converted');
    updateActivity('tour_booking');
    
    // Add a success message to the chat
    const tourTypeDisplay = tourData.tourType === 'in_person' ? 'in-person' : 
                           tourData.tourType === 'self_guided' ? 'self-guided' : 'virtual';
    const successMessage = `Great! Your ${tourTypeDisplay} tour has been scheduled. Check your email for confirmation details.`;
    
    setMessages(prev => [...prev, { 
      id: `tour-success-${Date.now()}`, 
      from: 'agent', 
      text: successMessage, 
      sentAt: new Date() 
    }]);
    
    // NEW: Update user and conversation data
    const [firstName, ...lastNameParts] = tourData.name.split(' ');
    updateUser({
      first_name: firstName,
      last_name: lastNameParts.join(' '),
      email: tourData.email
    });
    updateConversation({
      is_book_tour: true,
      tour_type: tourData.tourType,
      tour_datetime: tourData.preferredDate && tourData.preferredTime ? 
        new Date(tourData.preferredDate + ' ' + tourData.preferredTime) : 
        undefined
    });
  };

  // NEW: Periodic dialogue mode reinforcement to prevent echoing
  useEffect(() => {
    if (!akoolSession || !isAgoraConnected || !isDialogueModeReady) return;

    const reinforcementInterval = setInterval(() => {
      if (agoraClientRef.current && agoraClientRef.current.connectionState === 'CONNECTED') {
        console.log('ChatModal: Reinforcing dialogue mode to prevent echoing');
        // Re-send dialogue mode setup to ensure it hasn't been reset
        const reinforceMessage = {
          v: 2,
          type: "command",
          mid: `reinforce-${Date.now()}`,
          pld: {
            mode: 1, // Dialogue mode
          }
        };
        
        try {
          // @ts-ignore
          agoraClientRef.current.sendStreamMessage(JSON.stringify(reinforceMessage), false);
          console.log('ChatModal: Dialogue mode reinforced successfully');
        } catch (error) {
          console.warn('ChatModal: Failed to reinforce dialogue mode:', error);
        }
      }
    }, 120000); // Reinforce every 2 minutes

    return () => clearInterval(reinforcementInterval);
  }, [akoolSession, isAgoraConnected, isDialogueModeReady]);

  // Initialize activity tracking on mount
  useEffect(() => {
    updateActivity('session_start');
  }, []);

  // NEW: Cleanup effect for session end tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStartTime;
      analytics.trackWidgetSessionEnded('navigation', sessionDuration, messages.length);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateActivity('page_hidden');
      } else {
        updateActivity('page_visible');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clear timeout on unmount
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    };
  }, [analytics, sessionStartTime, messages.length, inactivityTimeout]);

  // Add this effect to handle the callback when typing is finished with debounce
  useEffect(() => {
    if (!isTyping && afterTypingCallback) {
      // Add a small delay before executing the callback to ensure typing has fully completed
      // This helps prevent the quick reply hints from flashing or appearing prematurely
      const timer = setTimeout(() => {
        // Execute the callback
        afterTypingCallback();
        // Clear the callback
        setAfterTypingCallback(null);
      }, 200); // 200ms delay before showing the hints
      
      return () => clearTimeout(timer);
    }
  }, [isTyping, afterTypingCallback]);

  // Modify the existing scroll effect to be more comprehensive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]); // Scroll when messages change or typing state changes

  // Add this after your existing useEffects, before the return statement:
  const handleSendLeadData = async () => {
    console.log("🚀 About to send lead data:", leadData);
    try {
      await sendLeadData();
      console.log("✅ Lead data sent successfully");
    } catch (error) {
      console.error("❌ Failed to send lead data:", error);
    }
  };

  // Call this when user provides email/phone (real-time submission)
  useEffect(() => {
    if (leadData.user.email || leadData.user.phone) {
      console.log("🎯 Contact info detected, sending lead data...");
      handleSendLeadData();
    }
  }, [leadData.user.email, leadData.user.phone]);

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {akoolSessionError && (
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', backgroundColor: 'rgba(255,0,0,0.7)', color: 'white', padding: '5px', borderRadius: '3px', textAlign: 'center', fontSize: '0.8em', zIndex: 20}}>
          Avatar Error: {akoolSessionError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl w-[360px] h-[625px] flex flex-col relative overflow-hidden">
        {showSparkles && <SparkleBurst />}
        
        <div
            id={AKOOL_PLAYER_ID}
            className="absolute left-0 w-full z-0 flex items-center justify-center"
            style={{
              backgroundColor: videoPlayerBgColor,
              top: `${headerHeight}px`,
              height: headerHeight > 0 ? `calc(100% - ${headerHeight}px)` : '100%',
              overflow: 'hidden',
            }}
        >
        </div>

        <ChatHeader
          config={config}
          onClose={handleClose}
          headerRef={headerRef}
          lastMailtoClickTime={lastMailtoClickTime}
          analytics={analytics}
        />

        <ChatBody
          messages={messages}
          config={config}
          isTyping={isTyping}
          containerRef={containerRef}
          currentHint={currentHint}
          currentQuestion={currentQuestion}
          sendMessage={sendMessage}
          trackAnswerButtonClick={analytics.trackAnswerButtonClick}
          setCurrentHint={setCurrentHint}
          setCurrentQuestion={setCurrentQuestion}
        />

        <TimerSection
          showOffer={showOffer}
          qualified={qualified}
          onOfferExpire={handleOfferExpire}
          savings={savings}
          analytics={analytics}
          tourBooked={tourBooked}
          onPromptTour={() => setShowTourBooking(true)}
        />
        
        <MessagingInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          akoolSession={akoolSession}
          isAgoraConnected={isAgoraConnected}
          isDialogueModeReady={isDialogueModeReady}
          agentState={agentState}
        />

        {isAvatarBuffering && !showSessionEndedOverlay && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
            <AvatarLoadingScreen message="Connecting to Ava..." />
          </div>
        )}

        {showSessionEndedOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-80 z-30 flex flex-col items-center justify-center text-white p-6 text-center rounded-lg">
            <X size={48} className="text-red-400 mb-4" />
            <p className="text-xl font-semibold mb-2">Session Ended</p>
            <p className="mb-4">Your live video session has ended. This might be due to inactivity.</p>
            <p className="text-sm">
              Please close and reopen the chat window to start a new session with Ava.
            </p>
            <button 
              onClick={handleClose} 
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Close Chat
            </button>
          </div>
        )}
      </div>

      {/* CTA Buttons Section */}
      <div className="mt-2 w-[360px]">
        <CTAButtons
          location="chat_footer"
          analytics={analytics}
          onContactFormOpen={() => setShowContactForm(true)}
          onTourBookingOpen={() => setShowTourBooking(true)}
          lastMailtoClickTime={lastMailtoClickTime}
          config={{
            email: 'leasing@grandoaks.com',
            phone: '+1-555-123-4567',
            showContactForm: true,
            showTourBooking: true,
          }}
        />
      </div>

      <AnimatePresence>
        {showFloatingBanner && qualified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-2"
          >
            <FloatingBanner
              onClickCTA={() => setShowFloatingBanner(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        onSubmit={handleContactFormSubmit}
        analytics={analytics}
      />

      {/* Tour Booking Modal */}
      <TourBookingModal
        isOpen={showTourBooking}
        onClose={() => setShowTourBooking(false)}
        onSubmit={handleTourBookingSubmit}
        analytics={analytics}
      />
    </div>
  );
};

export default ChatModal;