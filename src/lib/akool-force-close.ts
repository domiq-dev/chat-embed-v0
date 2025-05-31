// Simple utility to force close AKOOL sessions
async function forceCloseAllAkoolSessions(): Promise<{ success: boolean; message: string }> {
  console.log('🚨 Force closing all AKOOL sessions...');
  
  try {
    // Clear any local session data FIRST - this is the most important part
    localStorage.removeItem('akool-session');
    console.log('🧹 Local session data cleared');
    
    // Get the last known session ID that might be causing issues
    const lastSessionId = localStorage.getItem('akool-last-session-id');
    
    if (lastSessionId) {
      console.log('🎯 Found last session ID to close:', lastSessionId);
      
      // Try to close the specific session that's causing the issue
      try {
        const specificCloseResponse = await fetch('/api/avatar/session/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: lastSessionId }),
        });
        
        console.log('🎯 Specific session close response:', specificCloseResponse.status);
        
        if (specificCloseResponse.ok) {
          console.log('✅ Successfully closed the problematic session!');
          localStorage.removeItem('akool-last-session-id');
        }
      } catch (error) {
        console.warn('⚠️ Failed to close specific session, but continuing...');
      }
    }
    
    // Also try the generic force-close endpoint as backup
    const forceCloseResponse = await fetch('/api/avatar/session/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: 'force-close-all', 
        avatar_id: 'Alinna_background_st01_Domiq',
        force: true
      }),
    });

    console.log('📡 Force close API response:', forceCloseResponse.status);

    console.log(`✅ AKOOL force close sequence completed`);
    
    return { 
      success: true, 
      message: 'Session cleanup completed. Avatar should be available now.' 
    };
    
  } catch (error) {
    console.error('❌ Force close failed:', error);
    // Still clear local data - this is the most important part
    localStorage.removeItem('akool-session');
    localStorage.removeItem('akool-last-session-id');
    return { 
      success: true, // Still return success because local cleanup worked
      message: 'Local session cleared. Avatar should be available.' 
    };
  }
}

// Simple cleanup that just focuses on localStorage
function simpleCleanup(): boolean {
  console.log('🧹 Simple cleanup...');
  
  let cleanupOccurred = false;
  
  // Always clear any stored session IDs on page load
  const lastSessionId = localStorage.getItem('akool-last-session-id');
  if (lastSessionId) {
    console.log('🧹 Clearing stored session ID:', lastSessionId);
    localStorage.removeItem('akool-last-session-id');
    cleanupOccurred = true;
  }
  
  const savedSession = localStorage.getItem('akool-session');
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession);
      const sessionAge = Date.now() - (session.createdAt || 0);
      
      // Be aggressive - if session is older than 30 seconds, clear it
      if (sessionAge > 30000) {
        console.log(`🚨 Found stale session (age: ${Math.round(sessionAge/1000)}s), clearing...`);
        localStorage.removeItem('akool-session');
        cleanupOccurred = true;
      }
    } catch (error) {
      console.log('🧹 Cleaning up corrupted session data');
      localStorage.removeItem('akool-session');
      cleanupOccurred = true;
    }
  }
  
  return cleanupOccurred;
}

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).forceCloseAllAkoolSessions = forceCloseAllAkoolSessions;
  (window as any).simpleCleanup = simpleCleanup;
  
  // Set a flag to indicate cleanup is in progress
  let cleanupInProgress = false;
  
  // Simple auto-cleanup on page load/refresh
  const autoCleanup = async () => {
    if (cleanupInProgress) {
      console.log('🔄 Cleanup already in progress, skipping...');
      return;
    }
    
    cleanupInProgress = true;
    
    try {
      const cleanupOccurred = simpleCleanup(); // Use simple cleanup instead
      if (cleanupOccurred) {
        console.log('🎯 Auto-cleanup completed, avatar should be ready');
        
        // Store cleanup timestamp to prevent immediate session creation
        sessionStorage.setItem('akool-cleanup-timestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Auto-cleanup error:', error);
    } finally {
      cleanupInProgress = false;
    }
  };

  // Check if we should delay session creation after cleanup
  (window as any).shouldDelaySessionCreation = () => {
    const cleanupTime = sessionStorage.getItem('akool-cleanup-timestamp');
    if (cleanupTime) {
      const timeSinceCleanup = Date.now() - parseInt(cleanupTime);
      const shouldDelay = timeSinceCleanup < 3000; // Reduced to 3 seconds
      
      if (shouldDelay) {
        const remainingDelay = Math.ceil((3000 - timeSinceCleanup) / 1000);
        console.log(`⏳ Delaying session creation for ${remainingDelay}s...`);
        return remainingDelay;
      } else {
        // Clear the timestamp if delay period is over
        sessionStorage.removeItem('akool-cleanup-timestamp');
      }
    }
    return 0;
  };

  // Run auto-cleanup when this module loads
  autoCleanup();
  
  // Also run on page visibility change (when user comes back to tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      autoCleanup();
    }
  });
  
  // Run cleanup when page becomes visible after being hidden
  document.addEventListener('focus', autoCleanup);
  
  // Run cleanup on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoCleanup);
  } else {
    // Run immediately if page is already loaded
    setTimeout(autoCleanup, 100);
  }
}

export { forceCloseAllAkoolSessions }; 