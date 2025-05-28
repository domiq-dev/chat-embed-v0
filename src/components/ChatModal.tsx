"use client";
import React, { FC, useEffect, useRef, useState } from 'react';
import { X, MessageSquare, Phone, Mail, Star, Volume2, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import MessageStatus from "@/components/ui/MessageStatus";
import QuickReplyButtons, { QuickReplyHint, QuickReplyType } from "@/components/ui/QuicklyReplyButtons";
import FloatingBanner from "@/components/ui/FloatingBanner";
import CountdownOffer from "@/components/ui/CountdownOffer";
import AvatarLoadingScreen from "@/components/ui/AvatarLoadingScreen";
import { DEFAULT_APARTMENT_CONFIG } from "@/types/apartment";
import { Session as AkoolSessionType } from '../services/apiService';

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
  akoolSession: AkoolSessionType | null;
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
}
const ChatHeader: FC<ChatHeaderProps> = ({ config, onClose, headerRef }) => {
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
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.location.href = 'mailto:leasing@grandoaks.com'} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Email us"><Mail size={18} /></motion.button>
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
}
const ChatBody: FC<ChatBodyProps> = ({
  messages,
  config,
  isTyping,
  containerRef,
}) => {
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
          {messages.map((message) => (
            <motion.div
              key={message.id}
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
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
};

// NEW: TimerSection Component
interface TimerSectionProps {
  isTyping: boolean;
  currentHint: QuickReplyHint | null;
  currentQuestion: string | null;
  sendMessage: (text: string) => Promise<void>;
  showOffer: boolean;
  qualified: boolean;
  onOfferExpire: () => void;
  savings: number;
}
const TimerSection: FC<TimerSectionProps> = ({
  isTyping,
  currentHint,
  currentQuestion,
  sendMessage,
  showOffer,
  qualified,
  onOfferExpire,
  savings
}) => {
  return (
    <div className="relative z-10 bg-white/80 backdrop-blur-sm">
      {!isTyping && (currentHint || currentQuestion) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
          <QuickReplyButtons currentQuestion={currentQuestion} hint={currentHint || undefined} onSelect={(value) => sendMessage(value)} />
        </motion.div>
      )}
      <AnimatePresence>
        {showOffer && !qualified && (
          <CountdownOffer initialMinutes={5} onExpire={onOfferExpire} offerText="Lock in your special move-in rate"/>
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
  akoolSession: AkoolSessionType | null;
  isAgoraConnected: boolean;
  agentState: string | null;
}
const MessagingInput: FC<MessagingInputProps> = ({
  inputText,
  setInputText,
  sendMessage,
  akoolSession,
  isAgoraConnected,
  agentState
}) => {
  return (
    <motion.div
      className="border-t bg-white/90 backdrop-blur-sm p-4 relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={akoolSession && isAgoraConnected ? "Chat with Avatar..." : "Type your message..."}
          className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white/70"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
          disabled={!(akoolSession && isAgoraConnected) && !agentState}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim() || (!(akoolSession && isAgoraConnected) && !agentState)}
          className={`p-2 rounded-full transition-colors ${
            (inputText.trim() && ((akoolSession && isAgoraConnected) || agentState))
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <MessageSquare size={20} />
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
  akoolSession
}) => {
  const [messages, setMessages] = useState<ChatMessageForDisplay[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatbotState');
      if (saved) {
        const parsed = JSON.parse(saved);
        return (parsed.messages ?? []).map((msg: any) => ({ 
            id: msg.id || `msg-${Math.random().toString(36).substr(2, 9)}`,
            from: msg.from,
            text: msg.text,
            sentAt: msg.sentAt ? new Date(msg.sentAt) : new Date()
        }));
      }
    }
    return [
      { 
        id: `agent-initial-${Date.now()}`,
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
  const [showSessionEndedOverlay, setShowSessionEndedOverlay] = useState(false);

  // AKOOL/Agora specific state
  const [AgoraRTCModule, setAgoraRTCModule] = useState<any>(null);
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const [isAgoraConnected, setIsAgoraConnected] = useState(false);
  const [hasVideoStarted, setHasVideoStarted] = useState(false);
  const [akoolSessionError, setAkoolSessionError] = useState<string | null>(null);
  const isSendingRef = useRef(false);
  const [isAvatarBuffering, setIsAvatarBuffering] = useState(false);

  // Determine video player background - now always black when session is active
  const videoPlayerBgColor = akoolSession ? '#222' : 'white';
  // Initial message color if no session (white background)
  const initialMessageColor = akoolSession ? 'text-white' : 'text-gray-700'; 

  // Ref and state for header height
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

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
            agoraClientRef.current = null; 
          })
          .catch(e => console.error('Error leaving Agora channel during cleanup:', e));
      }
      setIsAvatarBuffering(false);
      setShowSessionEndedOverlay(false);
      return;
    }

    console.log("ChatModal: AgoraRTCModule and akoolSession credentials present. Setting up Agora client.");
    setIsAvatarBuffering(true);
    setShowSessionEndedOverlay(false);
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
      if (mediaType === 'video') {
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

        if (parsedMessage.type === 'chat' && parsedMessage.pld?.from === 'bot' && parsedMessage.pld?.text) {
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
        }
      } catch (e) {
        console.error('ChatModal: Error processing stream message:', e, 'Raw data:', data);
      }
    };

    const { agora_app_id, agora_channel, agora_token, agora_uid } = akoolSession.credentials;
    currentActiveClient.on('user-published', handleUserPublished);
    currentActiveClient.on('user-unpublished', handleUserUnpublished);
    currentActiveClient.on('stream-message', handleStreamMessage);
    
    console.log("ChatModal: Joining Agora channel...", {agora_app_id, agora_channel, agora_uid});
    currentActiveClient.join(agora_app_id, agora_channel, agora_token, agora_uid)
      .then(() => {
        setIsAgoraConnected(true);
        hasJoined = true;
        console.log("ChatModal: Successfully joined Agora channel.");
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
        currentActiveClient.off('user-published', handleUserPublished);
        currentActiveClient.off('user-unpublished', handleUserUnpublished);
        currentActiveClient.off('stream-message', handleStreamMessage);
        if (hasJoined || currentActiveClient.connectionState === 'CONNECTING' || currentActiveClient.connectionState === 'CONNECTED') {
          currentActiveClient.leave()
            .catch(e => console.error('ChatModal: Error leaving Agora channel on cleanup:', e))
            .finally(() => {
              if (agoraClientRef.current === currentActiveClient) {
                setIsAgoraConnected(false);
                setHasVideoStarted(false);
                agoraClientRef.current = null;
                 console.log("ChatModal: Agora client left and cleaned up.");
              }
            });
        } else {
           if (agoraClientRef.current === currentActiveClient) {
             setIsAgoraConnected(false);
             setHasVideoStarted(false);
             agoraClientRef.current = null; 
             console.log("ChatModal: Agora client (not fully joined) cleaned up.");
           }
        }
      }
    };
  }, [akoolSession, AgoraRTCModule]);

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
    // Save full chat messages to localStorage, including new IDs
    const dataToSave = {
      messages: messages.map(m => ({...m, sentAt: m.sentAt?.toISOString() })),
      currentQuestion, agentState, savings, qualified
    };
    if (typeof window !== 'undefined') {
        localStorage.setItem('chatbotState', JSON.stringify(dataToSave));
    }
  }, [messages, currentQuestion, agentState, savings, qualified]);
  useEffect(() => {
    if (savings > 0) { setShowSparkles(true); const timer = setTimeout(() => setShowSparkles(false), 2000); return () => clearTimeout(timer); }
  }, [savings]);
  useEffect(() => {
    const timer = setTimeout(() => { if (messages.length > 1 && !qualified && !offerExpired) setShowOffer(true); }, 30000);
    return () => clearTimeout(timer);
  }, [messages.length, qualified, offerExpired]);
  const handleOfferExpire = () => { setOfferExpired(true); setShowOffer(false); };

  // sendMessage function: decides whether to send to backend agent or AKOOL
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessageId = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userMessage: ChatMessageForDisplay = { 
        id: userMessageId, 
        from: 'user', 
        text: text.trim(), 
        sentAt: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // If AKOOL session is active, send text to AKOOL for TTS
    if (akoolSession && agoraClientRef.current && isAgoraConnected && AgoraRTCModule) {
      if (isSendingRef.current) {
        console.log('ChatModal: Send to AKOOL already in progress, skipping.');
        return;
      }
      isSendingRef.current = true;
      
      const localAgoraClient = agoraClientRef.current;
      if (typeof (localAgoraClient as any).sendStreamMessage !== 'function') {
        console.error('ChatModal: sendStreamMessage method does not exist on Agora client.');
        setAkoolSessionError('Cannot send message to avatar: method not found.');
        isSendingRef.current = false;
        return;
      }

      const agoraMessage = {
        v: 2, type: "chat", mid: userMessageId, idx: 0, fin: true,
        pld: { text: text.trim() },
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
      }
    } else {
      // Fallback to existing backend agent if AKOOL is not active
      console.log("ChatModal: AKOOL not active, sending to backend text agent.");
      postTextToBackendAgent(text.trim(), userMessageId); // Use separate function for clarity
    }
  };
  
  // Extracted backend posting logic
  const postTextToBackendAgent = async (text: string, originalUserMessageId: string) => {
    setIsTyping(true); // Show backend agent typing indicator
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
      const stateRes = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ messages: [...messages, {from: 'user', text, sentAt: new Date()}, {from: 'agent', text: reply, sentAt: new Date()}], stateFetch: true, agentState })
      });
      if (stateRes.ok) {
        const data = await stateRes.json();
        setQualified(data.qualified ?? false);
        setCurrentQuestion(data.current_question);
        setAgentState(data.agentState);
        if (data.hint) { setCurrentHint(data.hint); } else { setCurrentHint(null); }
        if (data.savings && data.savings > savings) {
            const startValue = savings; const endValue = data.savings; const duration = 1000; const startTime = Date.now();
            const animateSavings = () => { const now = Date.now(); const progress = Math.min((now - startTime) / duration, 1); const currentValue = Math.floor(startValue + (endValue - startValue) * progress); setSavings(currentValue); if (progress < 1) requestAnimationFrame(animateSavings); };
          requestAnimationFrame(animateSavings);
        }
        if (data.qualified && !showFloatingBanner) { setShowFloatingBanner(true); setShowSparkles(true); setTimeout(() => setShowSparkles(false), 2000); }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: `err-backend-${Date.now()}`, from: 'agent', text: 'Sorry, something went wrong 😞', sentAt: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {akoolSessionError && (
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', backgroundColor: 'rgba(255,0,0,0.7)', color: 'white', padding: '5px', borderRadius: '3px', textAlign: 'center', fontSize: '0.8em', zIndex: 20}}>
          Avatar Error: {akoolSessionError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl w-[360px] h-[675px] flex flex-col relative overflow-hidden">
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
          onClose={onClose}
          headerRef={headerRef}
        />

        <ChatBody
          messages={messages}
          config={config}
          isTyping={isTyping}
          containerRef={containerRef}
        />

        <TimerSection
          isTyping={isTyping}
          currentHint={currentHint}
              currentQuestion={currentQuestion}
          sendMessage={sendMessage}
          showOffer={showOffer}
          qualified={qualified}
          onOfferExpire={handleOfferExpire}
          savings={savings}
        />
        
        <MessagingInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          akoolSession={akoolSession}
          isAgoraConnected={isAgoraConnected}
          agentState={agentState}
        />

        {isAvatarBuffering && !showSessionEndedOverlay && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center">
            <AvatarLoadingScreen message="Connecting to Jerome..." />
            </div>
        )}

        {showSessionEndedOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-80 z-30 flex flex-col items-center justify-center text-white p-6 text-center rounded-lg">
            <X size={48} className="text-red-400 mb-4" />
            <p className="text-xl font-semibold mb-2">Session Ended</p>
            <p className="mb-4">Your live video session has ended. This might be due to inactivity.</p>
            <p className="text-sm">
Please close and reopen the chat window to start a new session with Jerome.</p>
            <button 
              onClick={onClose} 
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Close Chat
            </button>
          </div>
        )}
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
    </div>
  );
};

export default ChatModal;
