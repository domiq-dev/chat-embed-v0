'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ChatModal from './ChatModal';
import { ApiService, Session as AkoolSessionType } from '../services/apiService'; // Adjusted path

// Define the expected structure of the token API response (can be moved to a types file)
interface TokenResponse {
  token?: string;
  error?: string;
}

const AKOOL_OPENAPI_HOST = 'https://openapi.akool.com'; // Consider moving to .env or a config file
const DEFAULT_SESSION_DURATION = 600; // 10 minutes in seconds
const DEFAULT_AVATAR_ID = 'Alinna_background_st01_Domiq'; // Changed to the working avatar ID

const ChatLauncher = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Track recent mailto clicks to ignore beforeunload events
  const lastMailtoClickTime = useRef<number>(0);

  const [apiService, setApiService] = useState<ApiService | null>(null);
  const [currentSession, setCurrentSession] = useState<AkoolSessionType | null>(() => {
    // Try to restore session from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedSession = localStorage.getItem('akool-session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          // Check if session is still valid (not older than 9 minutes for 10-minute sessions)
          const sessionAge = Date.now() - (session.createdAt || 0);
          if (sessionAge < 540000) { // 9 minutes in milliseconds
            console.log('Restored AKOOL session from localStorage:', session);
            return session;
          } else {
            localStorage.removeItem('akool-session'); // Clean up old session
          }
        }
      } catch (error) {
        console.error('Failed to restore session from localStorage:', error);
        localStorage.removeItem('akool-session');
      }
    }
    return null;
  });
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const toggle = () => {
    setOpen((prevOpen) => {
      const newOpenState = !prevOpen;
      if (newOpenState) {
        setUnreadCount(0);
        // Don't automatically create session here - let the useEffect handle it
      } else {
        // Close session properly
        closeCurrentSession();
      }
      return newOpenState;
    });
  };

  const closeCurrentSession = useCallback(async () => {
    if (currentSession && apiService) {
      console.log("ChatLauncher: Closing AKOOL session:", currentSession._id);
      try {
        await apiService.closeSession(currentSession._id);
        console.log("ChatLauncher: AKOOL session closed successfully.");
      } catch (err) {
        console.error("ChatLauncher: Error closing AKOOL session:", err);
        
        // Check if it's a server unavailable error
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('unavailable') || errorMessage.includes('server')) {
          console.log("ChatLauncher: AKOOL server unavailable - session will auto-expire");
        } else {
          console.warn("ChatLauncher: Unexpected session close error, but continuing cleanup");
        }
      } finally {
        // Always clean up locally regardless of API success/failure
        localStorage.removeItem('akool-session');
        setCurrentSession(null);
        console.log("ChatLauncher: Local session cleanup completed");
      }
    }
  }, [currentSession, apiService]);

  // Handle page unload/refresh - close session
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check if this is a mailto link navigation - don't close session for these
      const timeSinceMailtoClick = Date.now() - lastMailtoClickTime.current;
      if (timeSinceMailtoClick < 2000) { // Within 2 seconds of mailto click
        console.log('ChatLauncher: Ignoring beforeunload for recent mailto click');
        return;
      }
      
      if (currentSession && apiService) {
        // Use sendBeacon for reliable cleanup on page unload
        const sessionData = JSON.stringify({ id: currentSession._id });
        navigator.sendBeacon('/api/avatar/session/close', sessionData);
        localStorage.removeItem('akool-session');
      }
    };

    const handleUnload = () => {
      if (currentSession && apiService) {
        localStorage.removeItem('akool-session');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [currentSession, apiService]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (currentSession && apiService) {
        console.log("ChatLauncher: Component unmounting, closing session");
        apiService.closeSession(currentSession._id)
          .catch(err => console.error("Error closing session on unmount:", err));
        localStorage.removeItem('akool-session');
      }
    };
  }, [currentSession, apiService]);

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

  const handleCreateAkoolSession = useCallback(async () => {
    if (!apiService) {
      setSessionError('ApiService not initialized yet for session creation.');
      return;
    }
    setIsCreatingSession(true);
    setSessionError(null);
    console.log(`Attempting to create AKOOL session for avatar: ${DEFAULT_AVATAR_ID}`);
    try {
      const sessionData = await apiService.createSession({ avatar_id: DEFAULT_AVATAR_ID, duration: DEFAULT_SESSION_DURATION });
      
      // Save session to localStorage with timestamp
      const sessionWithTimestamp = {
        ...sessionData,
        createdAt: Date.now()
      };
      localStorage.setItem('akool-session', JSON.stringify(sessionWithTimestamp));
      
      setCurrentSession(sessionData);
      console.log("AKOOL Session created successfully:", sessionData);
    } catch (err) {
      console.error('Error creating AKOOL session:', err);
      setSessionError(err instanceof Error ? err.message : String(err));
      setCurrentSession(null); // Clear session on error
    } finally {
      setIsCreatingSession(false);
    }
  }, [apiService]);

  // Auto-create session ONLY when manually opened, not automatically
  useEffect(() => {
    if (open && apiService && !currentSession && !isCreatingSession) {
      handleCreateAkoolSession();
    }
  }, [open, handleCreateAkoolSession]); // Removed apiService and currentSession from deps to prevent loops

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

  // Session timeout handling - close sessions that are about to expire
  useEffect(() => {
    if (!currentSession) return;

    const sessionTimeout = setTimeout(() => {
      console.log("ChatLauncher: Session approaching timeout, closing proactively");
      closeCurrentSession();
    }, (DEFAULT_SESSION_DURATION - 30) * 1000); // Close 30 seconds before expiry

    return () => clearTimeout(sessionTimeout);
  }, [currentSession, closeCurrentSession]);

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ overflow: 'visible' }}>
      {sessionError && (
        <div style={{ position: 'fixed', bottom: '100px', right: '20px', backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 1000}}>
          AKOOL Error: {sessionError}
        </div>
      )}
      {/* {isCreatingSession && (
         <div style={{ position: 'fixed', bottom: '150px', right: '20px', backgroundColor: 'orange', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 100}}>
          Starting AKOOL Session...
        </div>
      )} */}

      {/* Unified Global Pre-Loading screen for ChatLauncher - shows during session creation or if no session */}
      {open && (isCreatingSession || !currentSession) && (
        <div className="mb-3 shadow-xl rounded-lg bg-white w-[360px] h-[675px] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 text-sm">Loading Chat...</p>
        </div>
      )}

      {/* ChatModal card - Render if open, session exists, AND not in initial API creation phase.
          ChatModal will now handle its own full loading state until video is ready. */}
      {open && currentSession && !isCreatingSession && (
        <div className="mb-3" style={{ overflow: 'visible' }}>
          <ChatModal
            onClose={toggle}
            unreadCount={unreadCount}
            onClearUnread={() => setUnreadCount(0)}
            akoolSession={currentSession}
            lastMailtoClickTime={lastMailtoClickTime}
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
