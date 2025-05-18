"use client";
import {ChevronDown, ClipboardList, Facebook, Search, Star, Trophy} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaHome, FaMapMarkerAlt, FaBath } from "react-icons/fa";
import MessengerXButton from '@/components/ui/MessengerXButton';
import FloatingBanner from "@/components/ui/FloatingBanner";
import ReactMarkdown from 'react-markdown';


import React, {FC, useEffect, useRef, useState} from 'react';
import {
  X,
  MessageSquare,
  Mic,
  Pen,
  Home,
  Lock,
  Mail,
} from 'lucide-react';
import VoicePanel from './VoicePanel';
import ConfettiRain from "@/components/ui/ConfettiRain";
import PreLeaseSummary from "@/components/ui/PreLeaseSummary";
import WelcomeHomeModal from "@/components/ui/WelcomeHomeModal";
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import MessageStatus from "@/components/ui/MessageStatus";
import QuickReplyButtons from "@/components/ui/QuicklyReplyButtons";

type Message = {
  from: 'agent' | 'user';
  text: string;
  sentAt?: Date;
};

const ParticleBurst: FC<{ x: number; y: number }> = ({ x, y }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), 500); // duration of the burst
    return () => clearTimeout(timeout);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed z-50" style={{ top: y, left: x }}>
      <div className="relative w-10 h-10">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (360 / 8) * i;
          const rad = (angle * Math.PI) / 180;
          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(${Math.cos(rad) * 10}px, ${Math.sin(rad) * 10}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};


const LEASING_FAQ_CATEGORIES = [
  {
    key: "apartments",
    label: "Apartments & Pricing",
    questions: [
      "View floor plans and prices",
      "What's included in the rent?",
      "See available move-in specials",
      "Application process and requirements",
      "Pet info",
      "Other questions (start typing)"
    ]
  },
  {
    key: "location",
    label: "Location & Neighborhood",
    questions: [
      "Cool places nearby",
      "Public transportation options",
      "Commute times to major areas",
      "School information",
      "Neighborhood safety",
      "Other questions (start typing)"
    ]
  },
  {
    key: "amenities",
    label: "Amenities",
    questions: [
      "Pool and gym info",
      "Security systems",
      "Outdoor spaces (grills, dog parks, playgrounds)",
      "Business center / coworking spaces",
      "Package lockers & secure deliveries",
      "Other questions (start typing)"
    ]
  }
];

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

interface ProgressProps {
  radius: number;
  stroke: number;
  progress: number;
  color?: string;
  animateUnlock?: boolean;
  children: React.ReactNode;
}
const ProgressRing: FC<ProgressProps> = ({
  radius,
  stroke,
  progress,
  color = '#3b82f6',
  animateUnlock,
  children,
}) => {
  const norm = radius - stroke;
  const circ = norm * 2 * Math.PI;
  const dash = circ - (progress / 100) * circ;
  const gid = `grad-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      className={animateUnlock ? 'animate-pulse' : ''}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <circle cx={radius} cy={radius} r={norm} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle
        cx={radius}
        cy={radius}
        r={norm}
        stroke={progress >= 100 ? `url(#${gid})` : color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset .4s ease, stroke .4s ease' }}
      />
      <foreignObject x={stroke} y={stroke} width={norm * 2} height={norm * 2}>
        <div className="flex items-center justify-center w-full h-full">{children}</div>
      </foreignObject>
    </svg>
  );
};

interface ActionProps {
  icon?: React.ReactNode;
  label: string;
  progress?: number;
  locked?: boolean;
  animateUnlock?: boolean;
  showBurst?: boolean;
  onClick?: () => void;
  className?: string; // ← ADD THIS LINE
}
const ActionButton: FC<ActionProps> = ({
  icon,
  label,
  progress,
  locked,
  animateUnlock,
  showBurst,
  onClick,
}) => {
  const has = typeof progress === 'number';
  return (
    <button onClick={onClick} className="relative flex flex-col items-center group">
      {showBurst && <SparkleBurst />}
      <div className={has ? 'relative' : ''}>
        {has ? (
          <ProgressRing
            radius={32}
            stroke={3}
            progress={progress}
            color={progress > 0 ? '#3b82f6' : '#d1d5db'}
            animateUnlock={animateUnlock}
          >
            {locked ? <Lock size={20} /> : <Pen size={20} />}
          </ProgressRing>
        ) : (
<div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-blue-100 transition transform hover:scale-105 active:scale-95 shadow-sm">
  <span className="text-gray-700 group-hover:text-blue-600">{icon}</span>
</div>
        )}
      </div>
      {has && !locked && (
        <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
          Ready&nbsp;to&nbsp;Sign!
        </span>
      )}
      <span className={`mt-1 text-xs font-medium leading-tight ${locked ? 'text-gray-500' : 'text-gray-700 group-hover:text-blue-600'}`}>{label}</span>
    </button>
  );
};

interface ChatModalProps {
  onClose: () => void;
}

const ChatModal: FC<ChatModalProps> = ({ onClose }) => {
  const [particlePos, setParticlePos] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(true);
  const [showFAQ, setShowFAQ] = useState(false);
  const [leasingCategory, setLeasingCategory] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

const [userId, setUserId] = useState<string | null>(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
});

const [isPreLeaseSigned, setIsPreLeaseSigned] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.isPreLeaseSigned ?? false;
    }
  }
  return false;
});

const [isTourScheduled, setIsTourScheduled] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.isTourScheduled ?? false;
    }
  }
  return false;
});

const debugState = (label: string, state: any) => {
  console.log(`[DEBUG] ${label}:`, state);
};




  const [showPreLeaseSummary, setShowPreLeaseSummary] = useState(false);

  const [showBalloons, setShowBalloons] = useState(false);

  const [showEmailForm, setShowEmailForm] = useState(false);
const [hasClickedStart, setHasClickedStart] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) return JSON.parse(saved).hasClickedStart ?? false;
  }
  return false;
});  // Savings Bar
  // const [savings, setSavings] = useState(0);
  const [savings, setSavings] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) return JSON.parse(saved).savings ?? 0;
  }
  return 0;
});

const [countdown, setCountdown] = useState<number | null>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) return JSON.parse(saved).countdown ?? null;
  }
  return null;
});


const TOTAL_REQUIRED_ANSWERS = 7
const [answeredSteps, setAnsweredSteps] = useState<Set<string>>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return new Set(parsed.answeredSteps ?? []);
    }
  }
  return new Set();
});
  const [qualified, setQualified] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.qualified ?? false;
    }
  }
  return false;
});


const [showFloatingBanner, setShowFloatingBanner] = useState(false);

useEffect(() => {
  if (qualified && !isPreLeaseSigned && !showFloatingBanner) {
    setShowFloatingBanner(true);
  }
}, [qualified, isPreLeaseSigned]);

  const [moveInDate, setMoveInDate] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.currentQuestion ?? null;
    }
  }
  return null;
});

  const [uiHint, setUiHint] = useState<{ type: string; options?: string[] } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');

  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'Voice' | 'Text'>('Text');
  const rotatingLabels = ["Hey there", "Ask Me", "Top Location", "Quiet Living", "Pet Friendly","Quiet Living", "24/7 Access", "Checking in..."];
  const [exploreLabel, setExploreLabel] = useState("Explore");

  useEffect(() => {
  if (mode === 'Text' && inputRef.current) {
    inputRef.current.focus();
  }
}, [currentQuestion, mode]);

  // Add this to your state declarations
const [agentState, setAgentState] = useState<string | null>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.agentState ?? null;
    }
  }
  return null;
});



  const [messages, setMessages] = useState<Message[]>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatbotState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.messages ?? [
        { from: 'agent', text: "🎉 Welcome to Grand Oaks Apartments! My name is Jerome. We have some beautiful apartment homes and some great deals right now! Ready to begin?\n" },
      ];
    }
  }
  return [
    { from: 'agent', text: "🎉 Welcome to Grand Oaks Apartments! My name is Jerome. We have some beautiful apartment homes and some great deals right now! Ready to begin?\n" },
  ];
});


  const [input, setInput] = useState('');
  const [signedClicked, setSignedClicked] = useState(false);
  const progress = Math.min((answeredSteps.size / TOTAL_REQUIRED_ANSWERS) * 100, 100);
  const signLocked = progress < 100 || !qualified;
  const animateUnlock = progress === 100 && !signedClicked && qualified;
  const [rehydrated, setRehydrated] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(new Set());

  const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.from === 'user');
const adjustedLastUserMessageIndex = lastUserMessageIndex !== -1 ? messages.length - 1 - lastUserMessageIndex : -1;

// Add this function inside your component
const showFAQPanel = () => {
  console.log("[DEBUG] showFAQPanel called");
  setShowFAQ(true);
  toast.success("📋 Check out our leasing checklist!", {
    duration: 3000,
    position: "top-center"
  });
};

const shouldShowQuickReplies = (question: string | null) => {
  return [
    "bedroom_size",
    "move_in_date",
    "over_20",
    "income_requirement",
    "eviction",
    "employment_age",
    "next_steps",
    "household_size",
    "full_name"
  ].includes(question || "");
};

useEffect(() => {
  if (mode === 'Text') {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }
}, [messages, mode]);

useEffect(() => {
  const data = {
    messages,
    answeredSteps: Array.from(answeredSteps),
    qualified,
    savings,
    countdown,
    hasClickedStart,
    currentQuestion,
    isPreLeaseSigned,
    isTourScheduled,
    signedClicked,             // ✅ added
    showPreLeaseSummary,
    agentState// ✅ added
  };
  localStorage.setItem('chatbotState', JSON.stringify(data));
}, [
  agentState, messages, answeredSteps, qualified, savings, countdown, hasClickedStart,
  currentQuestion, isPreLeaseSigned, isTourScheduled, signedClicked, showPreLeaseSummary
]);

useEffect(() => {
  const saved = localStorage.getItem('chatbotState');

  if (saved) {
    const data = JSON.parse(saved);
    if (data.messages) {
  setMessages(data.messages.map((m: any) => ({
    ...m,
    sentAt: m.sentAt ? new Date(m.sentAt) : undefined
  })));
}

    if (data.answeredSteps) setAnsweredSteps(new Set(data.answeredSteps));
    if (typeof data.currentQuestion === 'string') setCurrentQuestion(data.currentQuestion);
    if (typeof data.qualified === 'boolean') setQualified(data.qualified);
    if (typeof data.savings === 'number') setSavings(data.savings);
    if (typeof data.countdown === 'number') setCountdown(data.countdown);
    if (typeof data.hasClickedStart === 'boolean') setHasClickedStart(data.hasClickedStart);
    if (typeof data.isPreLeaseSigned === 'boolean') setIsPreLeaseSigned(data.isPreLeaseSigned);
    if (typeof data.isTourScheduled === 'boolean') setIsTourScheduled(data.isTourScheduled);
    if (typeof data.signedClicked === 'boolean') setSignedClicked(data.signedClicked);

    setTimeout(() => {
      setRehydrated(true);
    }, 0);  // allow React to update first
  } else {
    setRehydrated(true); // No saved data, rehydrate immediately
  }
}, []);


useEffect(() => {
  const handler = (e: MessageEvent) => {
    if (e.data?.type === "showFAQ") {
      setShowFAQ(true);
      setShow(false);
    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}, []);


useEffect(() => {
  if (isPreLeaseSigned && !isTourScheduled) {
    setShowPreLeaseSummary(true);
  } else {
    setShowPreLeaseSummary(false);
  }
}, [isPreLeaseSigned, isTourScheduled]);


useEffect(() => {
    console.log("✅ Answered steps:", answeredSteps);
  if (answeredSteps.size === 0 && countdown === null) {
    setCountdown(60); // 60 seconds
  }
}, [answeredSteps, countdown]);

useEffect(() => {
  const computedSavings =
    (isTourScheduled ? 30 : 0) +
    (answeredSteps.size >= 7 && qualified
      ? 45
      : answeredSteps.size >= 3
      ? 15
      : 0);

  setSavings(computedSavings);
}, [answeredSteps.size, qualified, isTourScheduled]);


useEffect(() => {
  if (firstName && lastName) {
    setFullName(`${firstName} ${lastName}`);
  }
}, [firstName, lastName]);



  useEffect(() => {
    if (countdown === null) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
  if (mode === 'Text') {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
    return () => clearTimeout(timeout);
  }
}, [messages, mode]);

  useEffect(() => {
  const interval = setInterval(() => {
    setExploreLabel((prev) => {
      const next = rotatingLabels[(rotatingLabels.indexOf(prev) + 1) % rotatingLabels.length];
      return next;
    });
  }, 3000); // every 3 seconds

  return () => clearInterval(interval);
}, []);

  // Visbility Hack
  useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden && !qualified) {
      document.title = `🚨 Apartment offer still open – Only 1 SPOT Left`;
    } else {
      document.title = "Grand Oaks Apartments";
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [savings, qualified, answeredSteps.size]);

useEffect(() => {
  if (qualified) {
    setCurrentQuestion('next_steps');
    setShowBalloons(true);
    setTimeout(() => setShowBalloons(false), 8000);
  }
}, [qualified]);

// just below your other useEffects in ChatModal:
useEffect(() => {
  if (!isTyping && mode === 'Text') {
    // give React a tick to mount the quick‑replies
    setTimeout(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 50);
  }
}, [isTyping, mode]);



  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

// const postText = async (text: string) => {
//   setIsTyping(true);
//
//   setMessages((prev) => [
//     ...prev,
//     { from: 'user', text, sentAt: new Date() },
//     { from: 'agent', text: '', sentAt: new Date() }, // Placeholder for streaming
//   ]);
//
//
//   try {
//     const res = await fetch('/api/chatbase', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         messages: [
//           ...messages.map((m: Message) => ({
//             role: m.from === 'user' ? 'user' : 'assistant',
//             content: m.text,
//           })),
//           { role: 'user', content: text },
//         ],
//       }),
//     });
//
//     if (res.body) {
//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();
//       let done = false;
//       let reply = '';
//
//       while (!done) {
//         const { value, done: doneReading } = await reader.read();
//         done = doneReading;
//         if (value) {
//           const chunk = decoder.decode(value);
//           reply += chunk;
//
//           // Update the last agent message as the stream arrives
//           setMessages((prev) => {
//             const updated = [...prev];
//             updated[updated.length - 1] = {
//               ...updated[updated.length - 1],
//               text: reply,
//               sentAt: new Date(),
//             };
//             return updated;
//           });
//         }
//       }
//
//       // Optionally, parse reply as JSON if your backend sends JSON as a string
//       let parsed: { reply: string; qualified: boolean; action?: { type: 'redirect'; url: string } } | null = null;
//       try {
//         parsed = JSON.parse(reply);
//       } catch {
//         parsed = { reply, qualified: true };
//       }
//
//       const { reply: finalReply, qualified: isQualified, action } = parsed;
//
//       if (isQualified) {
//         setQualified(true);
//         setCurrentQuestion('next_steps');
//         setShowBalloons(true);
//         setTimeout(() => setShowBalloons(false), 8000);
//       }
//       if (action?.type === 'redirect' && action.url) {
//         setMessages((prev) => [
//           ...prev.slice(0, -1),
//           { from: 'agent', text: finalReply, sentAt: new Date() },
//         ]);
//         window.location.href = action.url;
//         return;
//       }
//
//       // Finalize the message (in case parsing changed it)
//       setMessages((prev) => [
//         ...prev.slice(0, -1),
//         { from: 'agent', text: finalReply, sentAt: new Date() },
//       ]);
//
//     // if (!res.ok) throw new Error(await res.text());
//     //
//     // // const { reply, qualified: isQualified } = (await res.json()) as { reply: string; qualified: boolean };
//     // const { reply, qualified: isQualified, action } = await res.json() as {
//     //   reply: string;
//     //   qualified: boolean;
//     //   action?: { type: 'redirect'; url: string };
//     // };
//     //
//     // if (isQualified) {
//     //   setQualified(true);
//     //   setCurrentQuestion("next_steps")
//     //   console.log("🎈 Showing balloons (qualified detected)!");
//     //   setShowBalloons(true);
//     //   setTimeout(() => {
//     //     setShowBalloons(false);
//     //   }, 8000);
//     // }
//     // if (action?.type === 'redirect' && action.url) {
//     //   setMessages((prev) => [...prev, { from: 'agent', text: reply }]);
//     //   window.location.href = action.url;
//     //   return;
//     // }
//     //
//     // setMessages((prev) => [...prev, { from: 'agent', text: reply, sentAt: new Date() }]);
//
//     const lowerReply = reply.toLowerCase();
//
//     if (lowerReply.includes("first name")) {
//       setCurrentQuestion("first_name");
//     }
//     else if (lowerReply.includes("full name")) {
//       setCurrentQuestion("full_name");
//     }
//     else if (lowerReply.includes("what name do you go by")) {
//       setCurrentQuestion("nickname");
//     } else if (lowerReply.includes("last name")) {
//       setCurrentQuestion("last_name");
//     } else if (lowerReply.includes("what size apartment") || lowerReply.includes("1 bedroom")) {
//       setCurrentQuestion("bedroom_size");
//     } else if (lowerReply.includes("when are you planning on moving")) {
//       setCurrentQuestion("move_in_date");
//     } else if (lowerReply.includes("are you over 20")) {
//       setCurrentQuestion("over_20");
//     } else if (lowerReply.includes("do you have a job and make")) {
//       setCurrentQuestion("income_requirement");
//     } else if (lowerReply.includes("have you been evicted")) {
//       setCurrentQuestion("eviction");
//     }
//     if (currentQuestion === "first_name") {
//           setFirstName(text.trim());
//         } else if (currentQuestion === "last_name") {
//           setLastName(text.trim());
//         }
//
//     if (currentQuestion && text.trim()) {
//       setAnsweredSteps((prev) => new Set(prev).add(currentQuestion));
//     }
//   } catch (err) {
//     console.error(err);
//     setMessages((prev) => [...prev, { from: 'agent', text: 'Sorry, something went wrong 😞' }]);
//   } finally {
//     setIsTyping(false);
//   }
// };

const postText = async (text: string) => {
  console.log("[DEBUG] About to fetch state data");
  setIsTyping(true);

  // Add user message and placeholder agent message
  setMessages((prev) => [
    ...prev,
    { from: 'user', text, sentAt: new Date() },
    { from: 'agent', text: '', sentAt: new Date() },
  ]);

  try {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...messages.map((m: Message) => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          { role: 'user', content: text },
        ],
        agentState
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let reply = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          reply += chunk;

          // Update the last agent message as the stream arrives
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: reply,
              sentAt: new Date(),
            };
            return updated;
          });
        }
      }

      // After streaming is complete, process all markers
      const finalReply = reply;
      let cleanedReply = finalReply;

      // Check for question type marker

      console.log("Checking for question type marker in:", finalReply);


      // Update the message with all markers removed if any changes were made
      if (cleanedReply !== finalReply) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: cleanedReply,
            sentAt: new Date(),
          };
          return updated;
        });
      }

      console.log("[DEBUG] About to fetch state data");

      const resState = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m: Message) => ({
              role: m.from === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
            { role: 'user', content: text },
            { role: 'assistant', content: reply },
          ],
          stateFetch: true,
          agentState
        }),
      });

      console.log("[DEBUG] State fetch response status:", resState.status, resState.statusText);
      let action = undefined;

      if (resState.ok) {
        const data = await resState.json();

        // Save the userId if provided
        if (data.userId && !userId) {
          setUserId(data.userId);
          localStorage.setItem('userId', data.userId);
          console.log("[DEBUG] Saved new userId:", data.userId);
        }

        console.log("Qualified:", data.qualified);
        setQualified(data.qualified ?? false);
        console.log("THIS IS CURRENT QUESTION", data.current_question);
        setCurrentQuestion(data.current_question);
        console.log("Agent state is", data.agentState);

        if (data.ui_hint) {
          console.log("Setting UI hint:", data.ui_hint);
          setUiHint(data.ui_hint);

          if (data.ui_hint.type === "show_checklist") {
            console.log("[DEBUG] Received show_checklist UI hint - opening panel");
            showFAQPanel();
          }

          if (data.ui_hint.type === "open_window" && data.ui_hint.url) {
            console.log("[DEBUG] Opening booking window with URL:", data.ui_hint.url);
            // Add a small delay to ensure the UI updates first
            setTimeout(() => {
              window.open(data.ui_hint.url, "_blank");
              setIsTourScheduled(true);
              setSavings((prev: number) => Math.max(prev, 30));
              toast.success("🏡 Tour booking page opened! You've unlocked $30 savings!", {
                duration: 3000,
                position: "top-center"
              });
            }, 100);
          }
        }

        setAgentState(data.agentState);
        action = data.action;
      }

      if (action?.type === 'redirect' && action.url) {
        window.location.href = action.url;
        return;
      }

      if (currentQuestion && text.trim()) {
        setAnsweredSteps((prev) => new Set(prev).add(currentQuestion));
      }
    }
  } catch (err) {
    console.error(err);
    setMessages((prev) => [
      ...prev,
      { from: 'agent', text: 'Sorry, something went wrong 😞' },
    ]);
  } finally {
    setIsTyping(false);
  }
};

const pushAndSend = (text: string) => {
// setMessages((prev) => [...prev, { from: 'user', text, sentAt: new Date() }]);
  if (currentQuestion && text.trim()) {
    setAnsweredSteps((prev) => new Set(prev).add(currentQuestion));
  }

  void postText(text);
};



  const sendMessage = () => {
    if (!input.trim()) return;
    pushAndSend(input.trim());
    setInput('');
  };

const handleScheduleTour = () => {
  window.open('https://calendly.com/gtong-cs/30min', '_blank');
  setIsTourScheduled(true);
  setShowPreLeaseSummary(false);
  setSignedClicked(true);
  setSavings((prev: number) => {
    if (prev < 30) return 30;
    return prev;
  });
  toast.success("🏡 Tour Scheduled! You've unlocked $30 savings!");
};

const handleSignAndPay = async () => {
  try {
    const res = await fetch('/api/generate-prelease', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        moveInDate: moveInDate || 'N/A',
        apartmentSize: '2 Bedroom',
        incomeQualified: true,
        evictionStatus: false,
      }),
    });

    if (!res.ok) throw new Error('PDF generation failed');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pre-qualification.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setIsPreLeaseSigned(true);
    setShowPreLeaseSummary(true);
    toast.success("✅ Pre-Lease Signed! Now schedule your tour to save $50!");
  } catch (err) {
    console.error(err);
    toast.error("❌ Failed to generate pre-lease. Please try again.");
  }
};

if (!rehydrated) {
  return (
    <div className="fixed bottom-20 right-6 z-50 flex justify-center items-center w-20 h-20">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}


  if (showPreLeaseSummary) {
  return (
    <div className="fixed bottom-20 right-6 z-50 scale-[0.95] origin-bottom-right">
<PreLeaseSummary
  fullName={fullName || "Guansen Tong"}
  moveInDate={moveInDate || "N/A"}
  apartmentSize={"2 Bedroom"}
  incomeQualified={true}
  evictionStatus={false}
  onSignAndPay={handleSignAndPay}
  onScheduleTour={handleScheduleTour}   // ✅
  isPreLeaseSigned={isPreLeaseSigned}
  isTourScheduled={isTourScheduled}
/>


    </div>
  );
}
//   if (signedClicked && !showPreLeaseSummary) {
//   return (
// <WelcomeHomeModal
//   onDoneText={() => {
//     setSignedClicked(false);
//     setMode('Text');  // Switch to Text chat
//   }}
//   onDoneVoice={() => {
//     setSignedClicked(false);
//     setMode('Voice'); // Switch to Voice chat
//   }}
// />
//   );
// }
  // or show loading animation
if (showEmailForm) {
  return (
    <div className="fixed bottom-20 right-6 z-50 scale-[0.9] origin-bottom-right">
      <div className="bg-white w-full max-w-md h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Email Our Leasing Team</h3>
          <button onClick={() => setShowEmailForm(false)} className="text-gray-600 hover:text-red-500">
            <MessengerXButton onClick={() => setShow(false)} />
          </button>
        </div>

        <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Email submitted!"); // Replace with real logic
              setShowEmailForm(false);
            }}
            className="flex flex-col p-6 space-y-4 overflow-y-auto flex-1"
        >
          <div className="flex gap-3">
            <input
                name="firstName"
                required
                placeholder="First name"
                className="w-1/2 px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
                name="lastName"
                required
                placeholder="Last name"
                className="w-1/2 px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
              name="phone"
              placeholder="Phone"
              className="w-full px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <select
              name="source"
              className="w-full px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option disabled selected>How did you hear about us?</option>
            <option>Google</option>
            <option>Social Media</option>
            <option>Referral</option>
          </select>
          <textarea
              name="message"
              placeholder="Your message..."
              rows={4}
              className="w-full px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
              type="submit"
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

return (
    // <div className="fixed bottom-20 right-6 z-50 scale-[0.9] origin-bottom-right">
    <div className="font-sans fixed bottom-20 right-6 z-50 flex items-end gap-4 scale-[0.9] origin-bottom-right">
      {showFAQ && (
          <aside
              className="relative w-80 rounded-2xl bg-[#FAFAFA] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100">
            {/* Close Button */}
            <button
                onClick={() => setShowFAQ(false)}
                className="absolute top-3 right-3"
                aria-label="Close FAQ panel"
            >
              <MessengerXButton/>
            </button>
            <h2 className="flex items-center gap-2 text-[1.25rem] font-semibold text-gray-900 mb-4 tracking-tight leading-snug font-serif">
              <ClipboardList className="w-5 h-5 text-blue-500"/>
              Your Leasing Checklist
            </h2>

            <p className="text-sm text-gray-500 mb-3">
              Questions Asked by Our Tenants
            </p>
            <p className="text-xs text-gray-500 mb-3">
              You're on a roll — {clickedQuestions.size} answered. Keep going to unlock your savings!
            </p>

            <Accordion type="single" collapsible className="w-full space-y-2">
              {LEASING_FAQ_CATEGORIES.map((cat) => {
                const icon =
                    cat.key === "apartments" ? <FaHome className="text-blue-500"/>
                        : cat.key === "location" ? <FaMapMarkerAlt className="text-green-500"/>
                            : <FaBath className="text-purple-500"/>;

                const bgHover =
                    cat.key === "apartments"
                        ? "hover:bg-blue-50"
                        : cat.key === "location"
                            ? "hover:bg-green-50"
                            : "hover:bg-purple-50";

                return (
                    <AccordionItem key={cat.key} value={cat.key} className="border-none">
                      <AccordionTrigger
                          className={`flex items-center justify-between gap-3 text-left px-4 py-3 rounded-lg bg-white text-sm font-medium text-[#333] transition-all ${bgHover}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-opacity-10 rounded-full p-1.5">{icon}</div>
                          <span>{cat.label}</span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pl-6 pt-3 pb-4 space-y-2 border-t border-gray-100">

                        <AnimatePresence>
                          {cat.questions.map((q) => {
                            const isClicked = clickedQuestions.has(q);
                            return (
                                <motion.button
                                    key={q}
                                    initial={{opacity: 1, scale: 1}}
                                    exit={{
                                      opacity: 0,
                                      scale: 0.8,
                                      y: -10,
                                      transition: {duration: 0.3, ease: "easeOut"},
                                    }}
                                    whileTap={{scale: 0.97}}
                                    onClick={(e) => {
                                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      setParticlePos({x: rect.left + rect.width / 2, y: rect.top + rect.height / 2});

                                      setClickedQuestions((prev) => new Set(prev).add(q));
                                      postText(q);
                                      setLeasingCategory(null);

                                      setTimeout(() => setParticlePos(null), 500); // hide burst
                                    }}

                                    className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-sm font-medium transition text-left
          ${isClicked
                                        ? "text-green-600 line-through"
                                        : "text-gray-700 hover:bg-gray-100 hover:underline"}`}
                                >
                                  {q}
                                  {isClicked && (
                                      <span className="ml-2 text-green-500">
            ✅
          </span>
                                  )}
                                </motion.button>
                            );
                          })}
                        </AnimatePresence>

                      </AccordionContent>
                    </AccordionItem>
                );
              })}
            </Accordion>
            {particlePos && <ParticleBurst x={particlePos.x} y={particlePos.y}/>}
          </aside>
      )}


      {showBalloons && (
          <>
            <div className="fixed top-[20%] left-0 w-full h-full pointer-events-none z-50">
              <ConfettiRain/>
            </div>
            <div
                className="fixed top-[15%] left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold px-8 py-3 rounded-full shadow-xl animate-bounce z-50">
              🎉 You're Pre-Qualified! Welcome Home!
            </div>
          </>
      )}
      <div
          className="bg-white w-full max-w-md h-[calc(100vh-1rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">


        <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
          <div className="flex items-start gap-3">
            {/*<img src="/realtor.png" alt="Jerome" className="w-10 h-10 rounded-full border object-cover"/>*/}
            <div className="flex flex-col items-center">
              <img src="/realtor.png" alt="Jerome" className="w-10 h-10 rounded-full border object-cover"/>
              <a
                  href="https://www.google.com/search?q=burlington+grand+oaks&rlz=1C1JSBI_enUS1123US1123&oq=burlington+grand+oaks&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIICAEQABgWGB4yCggCEAAYgAQYogQyCggDEAAYgAQYogQyCggEEAAYogQYiQUyBggFEEUYPDIGCAYQRRg8MgYIBxBFGDzSAQgzMTIwajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#lrd=0x88532fcc14c320fb:0xb52a59ba9c3be573,1,,,,"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#fbbc04] text-sm font-semibold mt-1 tracking-tight cursor-pointer hover:text-[#f8a000] transition-colors"
                  title="Rate us on Google"
              >
                ★★★★★
              </a>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Jerome</h2>
                <a
                    href="https://www.facebook.com/grandoaksburlingtonnc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        d="M22.676 0H1.326C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24h11.495V14.708h-3.13v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.796.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.31h3.59l-.467 3.622h-3.123V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.676 0z"/>
                  </svg>
                </a>
                <button onClick={() => setShowEmailForm(true)} className="text-gray-600 hover:text-purple-500">
                  <Mail size={22} strokeWidth={1.5} className="text-gray-600 group-hover:text-purple-500"/>
                </button>
              </div>
              <p className="text-xs text-gray-500">Your live leasing agent</p>
              {agentState && (
                  <div className="text-xs text-gray-400 text-right">
                    Phase: {JSON.parse(agentState).phase || "INIT"}
                  </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-[#b88d00] text-xs font-semibold leading-tight">
                🏆 <span>Trusted by 1000+ tenants</span>
              </div>

            </div>
          </div>

          {/* Right-side buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <button
                onClick={() => setShowFAQ(!showFAQ)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition hover:bg-gray-100 hover:shadow-sm"
            >
              <Search size={16} className="text-gray-700 group-hover:text-purple-500"/>
              <span className="text-gray-800 transition-all">{exploreLabel}</span>
            </button>
            <MessengerXButton onClick={onClose}/>
          </div>
        </header>


        {/* Mode Toggle - Consistent across both modes */}
        {/*<div className="flex mx-5 my-4 border border-gray-200 rounded-full overflow-hidden">*/}
        <div className="flex mx-4 my-2 border border-gray-200 rounded-full overflow-hidden text-sm">
          {(['Voice', 'Text'] as const).map((m) => (
              <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-center text-sm font-medium transition ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                {m === 'Text' ? (
                    <><MessageSquare size={16} className="inline-block mr-1"/> Text</>
                ) : (
                    <><Mic size={16} className="inline-block mr-1"/> Voice</>
                )}
              </button>
          ))}
        </div>

        {/* Main Content Area - Different based on mode */}
        <div ref={containerRef} className="flex-1 bg-[#f9f9f9] overflow-y-auto">
          {mode === 'Text' ? (
  <div className="px-4 py-4 space-y-4">
    {messages.map((m, i) => {
      const isLastAgentMessage = m.from === 'agent' && i === messages.length - 1;
      const isLastUserMessage = m.from === 'user' && i === messages.length - 1;

      return m.from === 'agent' ? (
        <div key={i} className="flex flex-col items-start gap-2">
          <div className="flex items-end gap-2">
            <img
                src="/realtor.png"
                alt=""
                className="w-8 h-8 rounded-full border object-cover self-end"
            />
            <div className={`
            ${i === 0
              ? 'bg-blue-50 border border-blue-200 text-[#1F2937]'
              : 'bg-white'}
            prose prose-sm prose-blue
            px-6 py-4
            rounded-2xl shadow-lg max-w-[75%]
            animate‑fadeIn
          `}
            >
              {i === 0 ? (
                  <div className="space-y-2">
                    <div>
                      🎉 Welcome to <span className="font-semibold">Grand Oaks Apartments</span>! I’m <span className="font-semibold">Jerome</span>, your live leasing agent.
                    </div>
                    <div>
                      We have <span className="font-semibold">beautiful homes</span> and special <span className="font-semibold">offers</span> waiting for you!
                    </div></div>
              ) : (
                  <ReactMarkdown>{m.text}</ReactMarkdown>
              )}
            </div>
          </div>

          {i === 0 && !hasClickedStart && (
              <button
                  onClick={() => {
                    pushAndSend("Help Me Start Now!");
                    setHasClickedStart(true);
                  }}
                  className="ml-10 mt-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all duration-300 animate-bounce"
              >
                🚀 Let’s Go!
              </button>
          )}
          {isLastAgentMessage && !isTyping && (
              <QuickReplyButtons
                  currentQuestion={currentQuestion}
                  onSelect={(value) => pushAndSend(value)}
        />
      )}

        </div>
      ) : (
          <div key={i} className="flex flex-col items-end">
          <div className="bg-messenger-purple text-white px-4 py-2 rounded-2xl shadow-md max-w-[75%] text-sm">
            {m.text}
            </div>

            {m.sentAt && i === adjustedLastUserMessageIndex && (
              <MessageStatus
              sentAt={new Date(m.sentAt)}
              isLastUserMessage={true}
              />
            )}
          </div>
      );
    })}
  </div>
          ) : (
              <div className="flex flex-col justify-center items-center h-full py-4 px-4">
                <VoicePanel/>
              </div>
          )}

        </div>

        {mode === 'Text' && progress < 100 && (
  <div className="mt-3 text-sm text-center text-gray-700">
    {answeredSteps.size < 3 ? (
      <>
        <span className="inline-block animate-bounce">⏰</span>{" "}
        <span className="text-gray-800">Only</span>{" "}
        <span className="text-blue-600 font-bold">{formatTime(countdown ?? 0)}</span>{" "}
        <span className="text-gray-800">left — answer</span>{" "}
        <span className="font-bold text-blue-600">
          {3 - answeredSteps.size} more question{3 - answeredSteps.size !== 1 ? 's' : ''}
        </span>{" "}
        to unlock <span className="font-bold text-green-600">$15 off rent!</span>
      </>
    ) : (
      <span className="text-green-600 font-semibold">🎉 Almost there — you're seconds from qualifying!</span>
    )}
  </div>
)}

        {/* Savings Progress Bar - Show in both modes */}
        {mode === 'Text' && !(isPreLeaseSigned && isTourScheduled) && (
            <div className="px-5 mt-2">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Savings Progress: ${savings}
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{width: 0}}
                    animate={{width: `${(savings / 90) * 100}%`}}
                    transition={{duration: 0.6, ease: "easeInOut"}}
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                />
                <div className="absolute inset-0 flex justify-center items-center text-[10px] font-semibold text-white">
                  ${savings} Saved
                </div>
              </div>

            </div>
        ) }

        {mode === 'Text' ? (
            <div className="relative px-3 py-2 bg-white border-t shadow-sm">
              <div
                  className="relative bg-white border border-gray-300 rounded-3xl shadow-sm flex items-center px-4 py-2.5 w-full">
                <input
                    ref={inputRef}  // ← Add this line
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Explore your next home..."
                    className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                />
                <button
                    onClick={sendMessage}
                    className="ml-3 bg-blue-600 hover:bg-green-500 hover:scale-105 transition-all duration-300 text-white p-2 rounded-full shadow-lg"
                    aria-label="Send"
                    title="You're about to unlock savings!"
                >
                  ➤
                </button>
              </div>
              <div
                  className="absolute right-6 bottom-[-6px] w-3 h-3 bg-white rotate-45 border-b border-r border-gray-300 shadow-sm"/>
            </div>
        ) : (
            <div className="border-t bg-white px-4 py-3"></div>
        )}
      </div>
      {showFloatingBanner && (
  <FloatingBanner
    onClickCTA={() => {
      setSignedClicked(true);
      setShowPreLeaseSummary(true);
      setShowFloatingBanner(false);
    }}
  />
)}
    </div>
);

};
export default ChatModal;
