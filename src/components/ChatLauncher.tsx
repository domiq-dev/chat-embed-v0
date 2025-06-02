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

const AKOOL_OPENAPI_HOST = 'https://openapi.akool.com';
const DEFAULT_SESSION_DURATION = 600; // 10 minutes
const DEFAULT_AVATAR_ID = 'Alinna_background_st01_Domiq';

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
      const sessionData = await apiService.createSession({ 
        avatar_id: DEFAULT_AVATAR_ID, 
        duration: DEFAULT_SESSION_DURATION,
      });
      
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
                const retrySessionData = await apiService.createSession({ 
                  avatar_id: DEFAULT_AVATAR_ID, 
                  duration: DEFAULT_SESSION_DURATION,
                });
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

      {/* ChatModal card - Render if open, session exists, AND not in initial API creation phase. */}
      {open && (
        <div className="mb-3" style={{ overflow: 'visible' }}>
          <ChatModal
            onClose={toggle}
            unreadCount={unreadCount}
            onClearUnread={() => setUnreadCount(0)}
            akoolSession={currentSession}
            isSessionLoading={isCreatingSession}
            sessionError={sessionError}
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
            <span className="font-semibold"> Ava</span>
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
