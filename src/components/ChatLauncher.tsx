'use client';

import { useState, useEffect } from 'react';
import ChatModal from './ChatModal';
import { ApiService, Session as AkoolSessionType } from '../services/apiService'; // Adjusted path

// Define the expected structure of the token API response (can be moved to a types file)
interface TokenResponse {
  token?: string;
  error?: string;
}

const AKOOL_OPENAPI_HOST = 'https://openapi.akool.com'; // Consider moving to .env or a config file
const DEFAULT_SESSION_DURATION = 300; // 5 minutes in seconds
const DEFAULT_AVATAR_ID = 'dvp_Tristan_cloth2_1080P'; // Changed to the working avatar ID

const ChatLauncher = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [apiService, setApiService] = useState<ApiService | null>(null);
  const [currentSession, setCurrentSession] = useState<AkoolSessionType | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const toggle = () => {
    setOpen((v) => {
      const newOpenState = !v;
      if (newOpenState) {
        setUnreadCount(0);
        // If opening and no session, try to create one
        if (!currentSession && apiService && !isCreatingSession) {
          handleCreateAkoolSession();
        }
      } else {
        // If closing and a session exists, close it
        if (currentSession && apiService) {
          console.log("ChatLauncher: Closing AKOOL session:", currentSession._id);
          apiService.closeSession(currentSession._id)
            .then(() => {
              console.log("ChatLauncher: AKOOL session closed successfully.");
            })
            .catch(err => {
              console.error("ChatLauncher: Error closing AKOOL session:", err);
              // Optionally set a sessionError here too, though the user is closing the modal
            });
          setCurrentSession(null); // Clear local session state immediately
          // Note: Agora client cleanup is handled within ChatModal when akoolSession becomes null
        }
      }
      return newOpenState;
    });
  };

  // Initialize ApiService
  useEffect(() => {
    const initializeService = async () => {
      try {
        const res = await fetch('/api/akool-token');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to fetch AKOOL token: ${res.statusText}`);
        }
        const tokenData: TokenResponse = await res.json();

        if (tokenData.error || !tokenData.token) {
          throw new Error(tokenData.error || 'AKOOL token not found in response');
        }
        console.log("AKOOL Token fetched successfully for ChatLauncher");
        const service = new ApiService(AKOOL_OPENAPI_HOST, tokenData.token);
        setApiService(service);
      } catch (err) {
        console.error('Error initializing ApiService in ChatLauncher:', err);
        setSessionError(err instanceof Error ? err.message : String(err));
      }
    };

    initializeService();
  }, []);

  const handleCreateAkoolSession = async () => {
    if (!apiService) {
      setSessionError('ApiService not initialized yet for session creation.');
      return;
    }
    setIsCreatingSession(true);
    setSessionError(null);
    console.log(`Attempting to create AKOOL session for avatar: ${DEFAULT_AVATAR_ID}`);
    try {
      const sessionData = await apiService.createSession({ avatar_id: DEFAULT_AVATAR_ID, duration: DEFAULT_SESSION_DURATION });
      setCurrentSession(sessionData);
      console.log("AKOOL Session created successfully:", sessionData);
    } catch (err) {
      console.error('Error creating AKOOL session:', err);
      setSessionError(err instanceof Error ? err.message : String(err));
      setCurrentSession(null); // Clear session on error
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Auto-create session if ApiService is ready and chat is set to auto-open
  useEffect(() => {
    if (open && apiService && !currentSession && !isCreatingSession) {
      handleCreateAkoolSession();
    }
  }, [open, apiService, currentSession, isCreatingSession]); 

  // Handle visibility change to clear unread count when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && open) {
        setUnreadCount(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [open]);

  // Initial auto-open with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ overflow: 'visible' }}>
      {sessionError && (
        <div style={{ position: 'fixed', bottom: '100px', right: '20px', backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 100}}>
          AKOOL Error: {sessionError}
        </div>
      )}
      {isCreatingSession && (
         <div style={{ position: 'fixed', bottom: '150px', right: '20px', backgroundColor: 'orange', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 100}}>
          Starting AKOOL Session...
        </div>
      )}
      {/* ────────── ChatModal card ────────── */}
      {open && (
        <div className="mb-3" style={{ overflow: 'visible' }}>
          <ChatModal 
            onClose={toggle} 
            unreadCount={unreadCount}
            onClearUnread={() => setUnreadCount(0)}
            akoolSession={currentSession}
          />
        </div>
      )}

      {/* ────────── Banner / Bubble ───────── */}
      <div
        onClick={toggle}
        className={`flex items-center transition-all cursor-pointer hover:shadow-xl
          bg-white/90 backdrop-blur-md shadow-lg border border-gray-300
          ${open
            ? 'w-14 h-14 p-0 justify-center rounded-full gap-0'   // avatar-only
            : 'px-5 py-2 pr-3 rounded-full gap-3'}                // pill banner
        `}
        style={{ overflow: 'visible' }}
      >
        {!open && ( /* banner text only when closed */
          <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
            Contact
            <span className="font-semibold"> Live Leasing Agent Now</span>!
          </span>
        )}

        <div className="relative">
          <img
            src="/realtor.png"
            alt="Leasing Agent"
            className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
          />
          {!open && unreadCount > 0 && (
            <div 
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce"
            >
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLauncher;

// 'use client';
//
// import { useState } from 'react';
// import ChatModal from './ChatModal';
//
// const ChatLauncher = () => {
//   const [open, setOpen] = useState(false);
//   const toggle = () => setOpen((v) => !v);
//
//   return (
//     <div className="fixed bottom-6 right-6 z-50" style={{ overflow: 'visible' }}>
//       {open && (
//         <div className="mb-3" style={{ overflow: 'visible' }}>
//           <ChatModal onClose={toggle} /> {/* This handles restoring saved conversation */}
//         </div>
//       )}
//
//       <div
//         onClick={toggle}
//         className={`flex items-center transition-all cursor-pointer hover:shadow-xl
//           bg-white/90 backdrop-blur-md shadow-lg border border-gray-300
//           ${open
//             ? 'w-14 h-14 p-0 justify-center rounded-full gap-0'
//             : 'px-5 py-2 pr-3 rounded-full gap-3'}
//         `}
//         style={{ overflow: 'visible' }}
//       >
//         {!open && (
//           <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
//             Talk with our&nbsp;
//             <span className="font-semibold">Real-time Leasing Agent</span>!
//           </span>
//         )}
//
//         <img
//           src="/realtor.png"
//           alt="Leasing Agent"
//           className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
//         />
//       </div>
//     </div>
//   );
// };
//
// export default ChatLauncher;
