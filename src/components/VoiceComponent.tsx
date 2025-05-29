"use client";

import React, { useEffect, useState, useRef } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff } from "lucide-react";

const FloatingVoiceChatWidget = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (msg) => console.log("Message:", msg),
    onError: (err) => {
      const msg = typeof err === "string" ? err : (err as Error).message;
      setErrorMessage(msg);
    },
  });

  const { status } = conversation;

  // Request microphone permission
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch {
        setErrorMessage("Microphone access denied");
      }
    };
    requestMicPermission();
  }, []);

  // Send widget height to parent
  useEffect(() => {
    const sendHeight = () => {
      const height = containerRef.current?.offsetHeight || 0;
      window.parent.postMessage({ type: "domiq-widget-height", height }, "*");
    };

    if (open) {
      setTimeout(sendHeight, 500);
    } else {
      sendHeight();
    }

    window.addEventListener("resize", sendHeight);
    return () => window.removeEventListener("resize", sendHeight);
  }, [open]);

  // 👇 Not allowed
// const createConversation = async () => {
//   const res = await fetch("/api/elevenlabs", { method: "POST" });
//
//   if (!res.ok) {
//     const error = await res.text();
//     throw new Error(`Failed to create conversation: ${error}`);
//   }
//
//   const data = await res.json();
//   return data.conversation_id;
// };

  const handleStart = async () => {
    console.log("Using agent ID:", process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID);
    try {
      // await createConversation(); // 🔥 Log it in ElevenLabs
      const id = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
      });
      console.log("Started:", id);
    } catch (err) {
      setErrorMessage("Failed to start");
      console.error(err);
    }
  };

  const handleEnd = async () => {
    try {
      await conversation.endSession();
    } catch {
      setErrorMessage("Failed to end");
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      style={{ overflow: "visible" }}
    >
      {/* Expanded UI */}
      {open && (
        <div id="conversation-ui" className="w-80 max-w-sm" style={{ overflow: "visible" }}>
          <Card className={`border shadow-2xl rounded-2xl overflow-visible transition-all duration-300 ${
              status === "connected" ? "ring-2 ring-green-300/70" : "border-gray-200"
            }`}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Speak With Alinna
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your real-time leasing agent
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 mt-2">
              <div className="relative" style={{ overflow: "visible" }}>
                <img
                  src="/realtor.png"
                  alt="Agent"
                  className={`w-24 h-24 rounded-full object-cover border-2 border-white shadow-md ${
                    status === "connected" ? "custom-glow" : ""
                  }`}
                />
                {status === "connected" && (
                  <div
                    className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-full"
                    style={{ overflow: "visible" }}
                  >
                    <AnimatedWave />
                  </div>
                )}
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleStart}
                  disabled={!hasPermission || status === "connected"}
                  className="p-2 rounded-full shadow-sm"
                  variant="outline"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleEnd}
                  disabled={status !== "connected"}
                  className="p-2 rounded-full shadow-sm"
                  variant="destructive"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-center text-sm text-gray-700">
                {status === "connected" && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <p className="text-green-600 font-medium">Connected</p>
                  </div>
                )}
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                {!hasPermission && (
                  <p className="text-yellow-600">Please allow microphone access</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Bubble */}
      <div
        id="floating-container"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-white/90 backdrop-blur-md shadow-lg px-5 py-2 pr-3 rounded-full border border-gray-300 cursor-pointer hover:shadow-xl transition-all"
        style={{ overflow: "visible" }}
      >
        {!open && (
          <span className="text-sm font-medium text-gray-800">
            Talk with our <span className="font-semibold">Real-time Leasing Agent</span>!
          </span>
        )}
        <img
          src="/realtor.png"
          alt="Leasing Agent"
          className={`w-12 h-12 rounded-full object-cover border-2 shadow-md transition-all duration-150 ${
            status === "connected"
              ? "ring-2 ring-green-400 custom-glow"
              : "hover:ring-2 hover:ring-primary"
          }`}
        />
      </div>
    </div>
  );
};

export default FloatingVoiceChatWidget;

const AnimatedWave = () => (
  <svg className="w-24 h-6" viewBox="0 0 120 30" preserveAspectRatio="none" fill="none">
    <path
      d="M0,15 C20,5 40,25 60,15 C80,5 100,25 120,15"
      stroke="#34D399"
      strokeWidth="2"
      fill="none"
    >
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
