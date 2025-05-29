"use client";
import { CalendarCheck } from "lucide-react";

import React, { useEffect, useRef, useState } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, PhoneOff } from 'lucide-react';

/* ─────────────────────────── Decorative Wave ─────────────────────────── */
const AnimatedWave: React.FC = () => (
  <svg className="w-24 h-6" viewBox="0 0 120 30" preserveAspectRatio="none" fill="none">
    <path d="M0,15 C20,5 40,25 60,15 C80,5 100,25 120,15" stroke="#34D399" strokeWidth="2" fill="none">
      <animate
        attributeName="d"
        dur="1s"
        repeatCount="indefinite"
        values="
          M0,15 C20,5 40,25 60,15 C80,5 100,25 120,15;
          M0,15 C20,25 40,5 60,15 C80,25 100,5 120,15;
          M0,15 C20,5 40,25 60,15 C80,5 100,25 120,15
        "
      />
    </path>
  </svg>
);

/**
 * Minimal, non‑floating panel that handles voice calls via ElevenLabs.
 * It is embedded inside ChatModal when the user selects the Voice tab.
 */

const VoicePanel: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  /* ───────────────── ElevenLabs hook ───────────────── */
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (msg) => console.log('Message:', msg),
    onError: (err) => {
      const msg = typeof err === 'string' ? err : (err as Error).message;
      setErrorMessage(msg);
    },
  });

  const {status} = conversation;

  /* ── Ask for mic permission once ── */
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({audio: true});
        setHasPermission(true);
      } catch {
        setErrorMessage('Microphone access denied');
      }
    };
    requestMicPermission();
  }, []);

  /* ── Height sync for iframe parents (optional) ── */
  useEffect(() => {
    const sendHeight = () => {
      const h = containerRef.current?.offsetHeight || 0;
      window.parent?.postMessage?.({type: 'domiq-widget-height', height: h}, '*');
    };
    sendHeight();
    window.addEventListener('resize', sendHeight);
    return () => window.removeEventListener('resize', sendHeight);
  }, []);

  /* ───────────────── Actions ───────────────── */
  const handleStart = async () => {
    try {
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
      });
    } catch (err) {
      setErrorMessage('Failed to start');
      console.error(err);
    }
  };

  const handleEnd = async () => {
    try {
      await conversation.endSession();
    } catch {
      setErrorMessage('Failed to end');
    }
  };
  const handleBookTour = () => {
    window.open("https://www.grandoaksburlington.com/amenities?show-appointment=true", "_blank");
    // or use window.location.href if you want it to replace the current tab
  };

  const [idleTimeoutReached, setIdleTimeoutReached] = useState(false);
useEffect(() => {
  if (status !== 'connected') return;

  const timeout = setTimeout(() => {
    setIdleTimeoutReached(true);
    console.warn('[Idle] No user activity for 10 seconds.');

    // Optional: Auto-end session
    // handleEnd();
    // setErrorMessage('Call ended due to inactivity.');
  }, 10000); // 10 seconds

  return () => clearTimeout(timeout);
}, [status]);

  return (

      <div
          ref={containerRef}
          // className="flex-1 flex flex-col justify-center items-center w-full h-full px-4 py-6 bg-[#f9f9f9]"
          className="flex-1 flex flex-col justify-start items-center w-full h-full px-4 pt-3 pb-4 bg-[#f9f9f9]"      >
        <div className="rounded-xl shadow-sm bg-white border px-6 py-8 max-w-sm w-full">

          {/*<div className="flex flex-col items-center justify-center space-y-4 max-w-sm w-full">*/}
          <div className="flex flex-col items-center justify-center space-y-3 max-w-sm w-full">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Speak With Alinna</h2>
              <p className="text-base font-semibold text-emerald-600">
                {status === 'connected'
                    ? "You're live with Alinna — feel free to ask anything!"
                    : "Your leasing expert is ready — just say hello!"}
              </p>
            </div>
            <p className="text-xs font-medium text-orange-500 animate-pulse mt-1">
              Only 2 spots left this week. Call now to secure yours.
            </p>
            {/* Avatar */}
            <div className="relative">
              <img
                  src="/realtor.png"
                  alt="Agent"
                  className={`w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg ${
                      status === 'connected' ? 'custom-glow' : ''
                  }`}
              />
              {status === 'connected' && (
                  <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-full">
                    <AnimatedWave/>
                  </div>
              )}
              {status === 'connected' && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Try asking: “What’s included in rent?” or “Do you allow pets?”
                  </p>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex space-x-4 pt-2">
              <Button
                  onClick={handleStart}
                  disabled={!hasPermission || status === 'connected'}
                  className={`p-3 rounded-full shadow-md transition-all ${status !== 'connected'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-emerald-300 text-white opacity-50 cursor-not-allowed'
                  }`}
              >
                <Phone className="h-5 w-5"/>
              </Button>

              <Button
                  onClick={handleEnd}
                  disabled={status !== 'connected'}
                  className="p-3 rounded-full shadow-md"
                  variant="destructive"
              >
                <PhoneOff className="h-5 w-5"/>
              </Button>
            </div>

            <div className="pt-2 text-sm text-gray-700 text-center">
              {status === 'connected' && (
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"/>
                    <p className="text-green-600 font-semibold text-sm mt-2">
                      {idleTimeoutReached
                          ? "👋 Are you still there? We'll end the session soon if inactive."
                          : "Connected — Feel free to start chatting!"}
                    </p>

                  </div>

              )}
              <hr className="my-4 border-t border-gray-200 w-full"/>
              <button
                  onClick={handleBookTour}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <CalendarCheck size={18}/>
                <span className="ml-2">Book a tour now</span>
                <span
                    className="ml-2 text-yellow-300 bg-yellow-800 px-2 py-0.5 text-[11px] rounded-full font-semibold animate-pulse">
        Limited Spots
      </span>
              </button>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {!hasPermission && <p className="text-yellow-600">Please allow microphone access</p>}
            </div>
          </div>
        </div>
      </div>
  );
};

export default VoicePanel;
