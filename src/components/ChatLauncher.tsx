'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ChatModal from './ChatModal';
import { ApiService, Session as AkoolSessionType } from '../services/apiService'; // Adjusted path
import '@/lib/akool-force-close'; // Load the force close utility

// Define the expected structure of the token API response (can be moved to a types file)
interface TokenResponse {
  token?: string;
  error?: string;
}

const AKOOL_OPENAPI_HOST = 'https://openapi.akool.com'; // Consider moving to .env or a config file
const DEFAULT_SESSION_DURATION = 600; // 10 minutes in seconds
const DEFAULT_AVATAR_ID = 'Alinna_background_st01_Domiq'; // Changed to the working avatar ID

const ChatLauncher = () => {
  const [open, setOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Track recent mailto/phone clicks to ignore beforeunload events
  const lastMailtoClickTime = useRef<number>(0);

  const [apiService, setApiService] = useState<ApiService | null>(null);
  const [currentSession, setCurrentSession] = useState<AkoolSessionType | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const toggle = () => {
    setOpen((prevOpen) => {
      const newOpenState = !prevOpen;
      if (newOpenState) {
        setUnreadCount(0);
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
      } finally {
        // Always clean up locally
        setCurrentSession(null);
        console.log("ChatLauncher: Local session cleanup completed");
      }
    }
  }, [currentSession, apiService]);

  // Handle page unload/refresh - close session
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check if this is a mailto or phone link navigation - don't close session for these
      const timeSinceClickAction = Date.now() - lastMailtoClickTime.current;
      if (timeSinceClickAction < 2000) { // Within 2 seconds of mailto/phone click
        console.log('ChatLauncher: Ignoring beforeunload for recent mailto/phone click');
        return;
      }
      
      if (currentSession && apiService) {
        // Use sendBeacon for reliable cleanup on page unload
        const sessionData = JSON.stringify({ id: currentSession._id });
        navigator.sendBeacon('/api/avatar/session/close', sessionData);
      }
    };

    const handleUnload = () => {
      if (currentSession && apiService) {
        // Final cleanup attempt
        const sessionData = JSON.stringify({ id: currentSession._id });
        navigator.sendBeacon('/api/avatar/session/close', sessionData);
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
    console.log(`Creating AKOOL session for avatar: ${DEFAULT_AVATAR_ID}`);
    
    try {
      const sessionData = await apiService.createSession({ avatar_id: DEFAULT_AVATAR_ID, duration: DEFAULT_SESSION_DURATION });
      
      setCurrentSession(sessionData);
      console.log("AKOOL Session created successfully:", sessionData);
      
    } catch (err) {
      console.error('Error creating AKOOL session:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // If avatar is busy, try force-close once and retry
      if (errorMessage.includes('currently busy') || errorMessage.includes('busy')) {
        console.log('🚨 Avatar busy - attempting force close and retry...');
        setSessionError('Avatar busy. Clearing all sessions and retrying...');
        
        try {
          // Call the force-close API
          const response = await fetch('/api/avatar/session/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: 'force-close-all', 
              avatar_id: DEFAULT_AVATAR_ID,
              force: true
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Force close result:', result);
            
            // Wait 5 seconds for AKOOL to process the closures
            setTimeout(async () => {
              try {
                console.log('🔄 Attempting retry after force close...');
                const retrySessionData = await apiService.createSession({ avatar_id: DEFAULT_AVATAR_ID, duration: DEFAULT_SESSION_DURATION });
                setCurrentSession(retrySessionData);
                setSessionError(null);
                console.log("AKOOL Session created successfully on retry:", retrySessionData);
              } catch (retryErr) {
                console.error('Retry failed:', retryErr);
                setSessionError('Avatar still busy after cleanup. Please refresh the page.');
              } finally {
                setIsCreatingSession(false);
              }
            }, 5000); // Increased from 2s to 5s
            return; // Don't set isCreatingSession to false yet
          } else {
            const errorData = await response.json();
            throw new Error(`Force close failed: ${errorData.error || response.statusText}`);
          }
        } catch (forceCloseErr) {
          console.error('Force close failed:', forceCloseErr);
          setSessionError('Avatar busy and cleanup failed. Please refresh the page.');
        }
      } else {
        setSessionError(errorMessage);
      }
      
      setCurrentSession(null);
    } finally {
      // Only set to false if we're not waiting for a retry
      if (!sessionError?.includes('retrying')) {
        setIsCreatingSession(false);
      }
    }
  }, [apiService]);

  // Auto-create session when opened
  useEffect(() => {
    if (open && apiService && !currentSession && !isCreatingSession) {
      handleCreateAkoolSession();
    }
  }, [open, handleCreateAkoolSession]);

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
          {sessionError.includes('refresh the page') && (
            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={() => {
                  console.log('🔄 Manual page refresh triggered');
                  window.location.reload();
                }}
                style={{ 
                  backgroundColor: 'white', 
                  color: 'red', 
                  padding: '8px 12px', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh Page
              </button>
            </div>
          )}
        </div>
      )}

      {/* Professional Loading Screen for ChatLauncher */}
      {open && (isCreatingSession || !currentSession) && (
        <div className="mb-3 shadow-xl rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 w-[360px] h-[625px] flex flex-col relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full -ml-20 -mb-20"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            {/* Logo/Brand Area */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <span className="text-white text-2xl font-bold">GO</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to Grand Oaks
              </h2>
              <h3 className="text-lg text-gray-600 font-medium">
                Luxury Apartments
              </h3>
            </div>

            {/* Loading Animation */}
            <div className="mb-6">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>

            {/* Loading Messages */}
            <div className="space-y-3">
              <p className="text-lg font-semibold text-gray-800">
                Connecting you with Alinna
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your personal leasing assistant is being prepared.<br />
                This will just take a moment...
              </p>
            </div>

            {/* Features Preview */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Video Chat</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>Instant Answers</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>Tour Scheduling</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ChatModal card - Render if open, session exists, AND not in initial API creation phase. */}
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
            Chat with
            <span className="font-semibold"> Alinna</span>
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
