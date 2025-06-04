import * as amplitude from '@amplitude/analytics-browser';

// Initialize with environment variable (only on client-side)
const amplitudeKey = process.env.NEXT_PUBLIC_AMPLITUDE_KEY;
const isClient = typeof window !== 'undefined';

if (amplitudeKey && isClient) {
  amplitude.init(amplitudeKey, {
    defaultTracking: true,
    serverZone: 'US',
    serverUrl: 'https://api2.amplitude.com/2/httpapi',
  });
} else if (!amplitudeKey && isClient) {
  console.warn('NEXT_PUBLIC_AMPLITUDE_KEY not found - analytics disabled');
}

// Helper function to track events with automatic session/device IDs
export const track = (event: string, props: Record<string, any> = {}) => {
  if (!amplitudeKey || !isClient) return; // Skip if no key or server-side

  try {
    const { deviceId, sessionId } = getIds();
    const eventProps = {
      ...props,
      device_id: deviceId,
      session_id: sessionId,
    };

    amplitude.track(event, eventProps);
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
};

// Helper function to set user ID when available
export const setUserId = (id: string) => {
  if (!amplitudeKey || !isClient) return;
  try {
    amplitude.setUserId(id);
  } catch (error) {
    console.warn('Analytics setUserId error:', error);
  }
};

// Helper function to get device and session IDs for backend stitching
export const getIds = () => {
  if (!isClient) return { deviceId: null, sessionId: null };

  try {
    return {
      deviceId: amplitude.getDeviceId(),
      sessionId: amplitude.getSessionId(),
    };
  } catch (error) {
    console.warn('Analytics getIds error:', error);
    return { deviceId: null, sessionId: null };
  }
};

// Export for debugging
export const getAmplitudeInstance = () => amplitude;
