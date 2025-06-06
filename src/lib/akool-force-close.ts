// Simple utility to force close AKOOL sessions
export async function forceCloseAllSessions() {
  // Clear local storage
  localStorage.removeItem('akoolSessionId');
  localStorage.removeItem('akoolWidgetState');

  try {
    // Check if we have a specific session ID to close
    const lastSessionId = localStorage.getItem('lastAkoolSessionId');
    if (lastSessionId) {
      // Try to close the specific session
      try {
        const specificCloseResponse = await fetch(
          `/api/avatar/session/close?sessionId=${lastSessionId}`,
          {
            method: 'POST',
          },
        );

        if (specificCloseResponse.status === 200) {
          localStorage.removeItem('lastAkoolSessionId');
        }
      } catch (specificError) {
        console.error('Error closing specific session:', specificError);
      }
    }

    // General force close endpoint
    try {
      const forceCloseResponse = await fetch('/api/avatar/session/cleanup', {
        method: 'POST',
      });

      if (forceCloseResponse.status === 200) {
        localStorage.removeItem('akoolSessionId');
        localStorage.removeItem('akoolWidgetState');
      }
    } catch (error) {
      console.error('Error force closing sessions:', error);
    }

    return true;
  } catch (error) {
    console.error('Error in force close sequence:', error);
    return false;
  }
}

// Simple cleanup that just focuses on localStorage
export function simpleCleanup() {
  try {
    // Clear session IDs to prevent reconnection attempts
    const lastSessionId = localStorage.getItem('lastAkoolSessionId');
    if (lastSessionId) {
      localStorage.removeItem('lastAkoolSessionId');
    }

    localStorage.removeItem('akoolSessionId');
    localStorage.removeItem('akoolWidgetState');

    return true;
  } catch (error) {
    console.error('Error in simple cleanup:', error);
    return false;
  }
}

export async function checkForStaleSession() {
  try {
    const lastSessionId = localStorage.getItem('lastAkoolSessionId');
    const lastSessionTimestamp = localStorage.getItem('lastAkoolSessionTimestamp');

    if (lastSessionId && lastSessionTimestamp) {
      const now = Date.now();
      const sessionTimestamp = parseInt(lastSessionTimestamp, 10);
      const sessionAge = now - sessionTimestamp;

      // If session is older than 5 minutes, clear it
      if (sessionAge > 5 * 60 * 1000) {
        await forceCloseAllSessions();
      }
    }

    const hasCorruptedSession =
      localStorage.getItem('akoolSessionId') && !localStorage.getItem('lastAkoolSessionTimestamp');

    if (hasCorruptedSession) {
      await forceCloseAllSessions();
    }

    return true;
  } catch (error) {
    console.error('Error checking for stale session:', error);
    return false;
  }
}

let isCleanupInProgress = false;

export async function autoCleanupBeforeOpen(onComplete?: () => void) {
  if (isCleanupInProgress) {
    return false;
  }

  isCleanupInProgress = true;

  try {
    await checkForStaleSession();
    await forceCloseAllSessions();
    isCleanupInProgress = false;

    if (onComplete) {
      onComplete();
    }

    return true;
  } catch (error) {
    console.error('Error in auto-cleanup:', error);
    isCleanupInProgress = false;
    return false;
  }
}

export function getSafeDelay(): number {
  const lastTimestamp = localStorage.getItem('lastAkoolSessionTimestamp');

  if (lastTimestamp) {
    const now = Date.now();
    const timestamp = parseInt(lastTimestamp, 10);
    const timeSinceLast = now - timestamp;

    // If less than 10 seconds have passed, wait a bit
    if (timeSinceLast < 10000) {
      const remainingDelay = Math.ceil((10000 - timeSinceLast) / 1000);
      return remainingDelay;
    }
  }

  return 0;
}

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).forceCloseAllSessions = forceCloseAllSessions;
  (window as any).simpleCleanup = simpleCleanup;

  // Set a flag to indicate cleanup is in progress
  let cleanupInProgress = false;

  // Simple auto-cleanup on page load/refresh
  const autoCleanup = async () => {
    if (cleanupInProgress) {
      return;
    }

    cleanupInProgress = true;

    try {
      const cleanupOccurred = simpleCleanup(); // Use simple cleanup instead
      if (cleanupOccurred) {
        // No onComplete call here - this function doesn't have access to it
      }
    } catch (error) {
      console.error('Auto-cleanup error:', error);
    } finally {
      cleanupInProgress = false;
    }
  };

  // Check if we should delay session creation after cleanup
  (window as any).shouldDelaySessionCreation = () => {
    const cleanupTime = localStorage.getItem('lastAkoolSessionTimestamp');
    if (cleanupTime) {
      const timeSinceCleanup = Date.now() - parseInt(cleanupTime);
      const shouldDelay = timeSinceCleanup < 3000; // Reduced to 3 seconds

      if (shouldDelay) {
        const remainingDelay = Math.ceil((3000 - timeSinceCleanup) / 1000);
        return remainingDelay;
      } else {
        // Clear the timestamp if delay period is over
        localStorage.removeItem('lastAkoolSessionTimestamp');
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
