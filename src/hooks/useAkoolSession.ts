'use client';
import { useEffect, useRef, useState } from 'react';
import { Session as AkoolSessionType } from '@/services/apiService';
import { AKOOL_PLAYER_ID } from '@/components/chat/types';

// Dynamically import AgoraRTC types
import type {
  IAgoraRTCClient,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID,
  SDK_MODE,
  SDK_CODEC,
} from 'agora-rtc-sdk-ng';

interface UseAkoolSessionProps {
  akoolSession?: AkoolSessionType | null;
  onMessage: (message: { id: string; from: 'agent' | 'user'; text: string; sentAt: Date }) => void;
  onAnalyticsEvent: (event: string) => void;
}

export const useAkoolSession = ({
  akoolSession,
  onMessage,
  onAnalyticsEvent,
}: UseAkoolSessionProps) => {
  const [AgoraRTCModule, setAgoraRTCModule] = useState<any>(null);
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const [isAgoraConnected, setIsAgoraConnected] = useState(false);
  const [hasVideoStarted, setHasVideoStarted] = useState(false);
  const [akoolSessionError, setAkoolSessionError] = useState<string | null>(null);
  const [isAvatarBuffering, setIsAvatarBuffering] = useState(false);
  const [isDialogueModeReady, setIsDialogueModeReady] = useState(false);
  const [showSessionEndedOverlay, setShowSessionEndedOverlay] = useState(false);
  const [hasDeliveredOpening, setHasDeliveredOpening] = useState(false);
  const isSendingRef = useRef(false);

  // Helper function to set avatar parameters
  const setAvatarParams = async (
    client: any,
    params: {
      vid: string; // voice ID
      lang: string; // language
      mode: number; // mode (1 or 2)
    },
  ) => {
    if (!client || typeof client.sendStreamMessage !== 'function') {
      throw new Error('Client does not support sendStreamMessage');
    }

    const message = {
      v: 2,
      type: 'command',
      mid: `set-params-${Date.now()}`,
      pld: {
        cmd: 'set-params',
        data: {
          vid: params.vid,
          lang: params.lang,
          mode: params.mode,
        },
      },
    };

    await client.sendStreamMessage(JSON.stringify(message), false);
  };

  // Helper function to send message to avatar
  const sendMessageToAvatar = async (client: any, messageId: string, text: string) => {
    if (!client || typeof client.sendStreamMessage !== 'function') {
      throw new Error('Client does not support sendStreamMessage');
    }

    const message = {
      v: 2,
      type: 'chat',
      mid: messageId,
      idx: 0,
      fin: true,
      pld: { text: text },
    };

    await client.sendStreamMessage(JSON.stringify(message), false);
  };

  // Set up avatar for dialogue mode with opening statement once connected
  const setupAvatarDialogueMode = async (isRetry = false) => {
    if (
      agoraClientRef.current &&
      typeof (agoraClientRef.current as any).sendStreamMessage === 'function'
    ) {
      try {
        // Define voice and language settings
        const voiceId = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice voice
        const language = 'en'; // English

        // Initial setup with dialogue mode
        await setAvatarParams(agoraClientRef.current, {
          vid: voiceId,
          lang: language,
          mode: 1, // Start with dialogue mode
        });

        setIsDialogueModeReady(true);

        // Only deliver opening statement once
        if (!hasDeliveredOpening) {
          setHasDeliveredOpening(true);

          // Opening statement with voice configuration sequence
          setTimeout(async () => {
            try {
              // Temporarily switch to mode 1 for welcome message
              await setAvatarParams(agoraClientRef.current!, {
                vid: voiceId,
                lang: language,
                mode: 1,
              });

              // Send welcome message (will appear in chat once)
              await sendMessageToAvatar(
                agoraClientRef.current!,
                `welcome-${Date.now()}`,
                "Hi! Welcome to Grand Oaks Apartments! I'm Ava, your leasing specialist. How can I help you today?",
              );

              // Switch back to dialogue mode
              await setAvatarParams(agoraClientRef.current!, {
                vid: voiceId,
                lang: language,
                mode: 1,
              });
            } catch (error) {
              console.warn('useAkoolSession: Failed to deliver opening statement:', error);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('useAkoolSession: Failed to setup avatar dialogue mode:', error);
        // More aggressive retry for dialogue mode
        if (!isRetry) {
          setTimeout(() => {
            setupAvatarDialogueMode(true);
          }, 3000); // Longer delay before retry
        } else {
          console.error(
            'useAkoolSession: Dialogue mode setup failed after retry - may experience echoing',
          );
          setAkoolSessionError('Dialogue mode setup failed - avatar may echo messages');
          setIsDialogueModeReady(true); // Allow chat to continue even if setup failed
        }
      }
    }
  };

  // Send message to AKOOL avatar
  const sendToAkool = async (userMessageId: string, llmResponse: string) => {
    if (isSendingRef.current) {
      return;
    }
    isSendingRef.current = true;

    const localAgoraClient = agoraClientRef.current;
    if (!localAgoraClient || typeof (localAgoraClient as any).sendStreamMessage !== 'function') {
      console.error('useAkoolSession: sendStreamMessage method does not exist on Agora client.');
      setAkoolSessionError('Cannot send message to avatar: method not found.');
      isSendingRef.current = false;
      return;
    }

    const agoraMessage = {
      v: 2,
      type: 'chat',
      mid: userMessageId,
      idx: 0,
      fin: true,
      pld: { text: llmResponse }, // Send LLM response instead of user input
    };

    try {
      // @ts-ignore - Assuming sendStreamMessage exists despite type issues seen previously
      await (localAgoraClient as IAgoraRTCClient).sendStreamMessage(
        JSON.stringify(agoraMessage),
        false,
      );
      // Bot response will be handled by 'stream-message' listener
    } catch (error) {
      console.error('useAkoolSession: Failed to send stream message to AKOOL:', error);
      setAkoolSessionError('Failed to send message to avatar. Check console.');
      // Optionally add an error message to chat for the user
      onMessage({
        id: `err-${Date.now()}`,
        from: 'agent',
        text: "Sorry, I couldn't say that.",
        sentAt: new Date(),
      });
    } finally {
      setTimeout(() => {
        isSendingRef.current = false;
      }, 100);
    }
  };

  // Dynamically import AgoraRTC SDK
  useEffect(() => {
    import('agora-rtc-sdk-ng')
      .then((module) => {
        setAgoraRTCModule(module.default);
      })
      .catch((err) => {
        console.error('Failed to load Agora RTC SDK in useAkoolSession:', err);
        setAkoolSessionError('Agora SDK failed to load. Video features disabled.');
      });
  }, []);

  // Effect for Agora RTC client setup and teardown, dependent on akoolSession
  useEffect(() => {
    if (!AgoraRTCModule || !akoolSession?.credentials) {
      if (agoraClientRef.current && isAgoraConnected) {
        agoraClientRef.current
          .leave()
          .then(() => {
            setIsAgoraConnected(false);
            setHasVideoStarted(false);
            setIsAvatarBuffering(false);
            setIsDialogueModeReady(false);
            setHasDeliveredOpening(false);
            agoraClientRef.current = null;
          })
          .catch((e) => console.error('Error leaving Agora channel during cleanup:', e));
      }
      setIsAvatarBuffering(false);
      setShowSessionEndedOverlay(false);
      setIsDialogueModeReady(false);
      setHasDeliveredOpening(false);
      return;
    }

    setIsAvatarBuffering(true);
    setShowSessionEndedOverlay(false);
    setHasDeliveredOpening(false);
    let clientInstance: IAgoraRTCClient | null = null;
    try {
      clientInstance = AgoraRTCModule.createClient({
        mode: 'rtc' as SDK_MODE,
        codec: 'vp8' as SDK_CODEC,
      });
    } catch (error) {
      console.error('useAkoolSession: Failed to create Agora client:', error);
      setAkoolSessionError('Failed to initialize Agora client. Please refresh.');
      return;
    }

    if (!clientInstance) {
      console.error('useAkoolSession: Agora client creation returned null unexpectedly.');
      setAkoolSessionError('Failed to initialize Agora client (instance is null).');
      return;
    }
    agoraClientRef.current = clientInstance;
    const currentActiveClient = clientInstance;
    let hasJoined = false;

    const handleUserPublished = async (user: any, mediaType: 'video' | 'audio') => {
      if (!currentActiveClient) return;
      try {
        await currentActiveClient.subscribe(user, mediaType);

        if (mediaType === 'video') {
          const videoTrack = user.videoTrack as IRemoteVideoTrack;
          const videoPlayerDiv = document.getElementById(AKOOL_PLAYER_ID);

          if (videoTrack && videoPlayerDiv) {
            const firstFrameDecodedHandler = () => {
              setHasVideoStarted(true);
              setIsAvatarBuffering(false);
              setShowSessionEndedOverlay(false);
            };
            videoTrack.once('first-frame-decoded', firstFrameDecodedHandler);
            videoTrack.play(videoPlayerDiv);
          } else {
            const warningMsg = `useAkoolSession: Video track or player div ('${AKOOL_PLAYER_ID}') not found for user ${user.uid}.`;
            console.warn(warningMsg);
            setAkoolSessionError('Video player element not found.');
            setIsAvatarBuffering(false);
          }
        }
        if (mediaType === 'audio') {
          if (user.audioTrack) {
            (user.audioTrack as IRemoteAudioTrack).play();
          } else {
            console.warn(`useAkoolSession: Audio track not available for user ${user.uid}.`);
          }
        }
      } catch (e: any) {
        const errorMsg = `useAkoolSession: Error in handleUserPublished for ${mediaType} track (user ${user.uid}): ${e.message}`;
        console.error(errorMsg, e);
        setAkoolSessionError(`Failed to handle media: ${e.message}`);
        setIsAvatarBuffering(false);
      }
    };

    const handleUserUnpublished = (user: any, mediaType: 'video' | 'audio') => {
      if (mediaType === 'video') {
        setHasVideoStarted(false);
        setShowSessionEndedOverlay(true);
        setIsAvatarBuffering(false);
      }
    };

    const handleStreamMessage = (uid: UID, data: Uint8Array | string) => {
      try {
        const messageStr =
          typeof data === 'string' ? data : new TextDecoder().decode(data as Uint8Array);
        const parsedMessage = JSON.parse(messageStr);

        if (
          parsedMessage.type === 'chat' &&
          (parsedMessage.pld?.from === 'bot' ||
            parsedMessage.pld?.from === undefined ||
            parsedMessage.pld?.from === null) &&
          parsedMessage.pld?.text
        ) {
          const displayBotMessageId = `bot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
          onMessage({
            id: displayBotMessageId,
            from: 'agent',
            text: parsedMessage.pld.text,
            sentAt: new Date(),
          });
          onAnalyticsEvent('bot_message');
        }
      } catch (e) {
        console.error('useAkoolSession: Error processing stream message:', e, 'Raw data:', data);
      }
    };

    const handleTokenWillExpire = () => {
      // When token expires and renews, dialogue mode often gets reset
    };

    const handleTokenDidExpire = () => {
      console.error('useAkoolSession: Agora token expired - connection will be lost');
      setAkoolSessionError('Session expired. Please close and reopen chat.');
      setIsAgoraConnected(false);
      setHasVideoStarted(false);
      setShowSessionEndedOverlay(true);
      setIsDialogueModeReady(false);
    };

    const handleConnectionStateChange = (curState: string, revState: string) => {
      if (curState === 'DISCONNECTED' || curState === 'DISCONNECTING') {
        setIsAgoraConnected(false);
        setHasVideoStarted(false);
        setIsAvatarBuffering(false);
        setIsDialogueModeReady(false);

        if (revState === 'CONNECTED') {
          setShowSessionEndedOverlay(true);
          setAkoolSessionError('Connection lost. Please close and reopen chat.');
        }
      } else if (curState === 'CONNECTED') {
        setIsAgoraConnected(true);
        setAkoolSessionError(null);
        setShowSessionEndedOverlay(false);

        if (revState === 'RECONNECTING') {
          setTimeout(() => {
            setupAvatarDialogueMode();
          }, 1000);
        }
      } else if (curState === 'CONNECTING' || curState === 'RECONNECTING') {
        setIsAvatarBuffering(true);
        setAkoolSessionError(null);
        setIsDialogueModeReady(false);
      }
    };

    const { agora_app_id, agora_channel, agora_token, agora_uid } = akoolSession.credentials;

    // Set up all event handlers
    currentActiveClient.on('user-published', handleUserPublished);
    currentActiveClient.on('user-unpublished', handleUserUnpublished);
    currentActiveClient.on('stream-message', handleStreamMessage);
    currentActiveClient.on('token-privilege-will-expire', handleTokenWillExpire);
    currentActiveClient.on('token-privilege-did-expire', handleTokenDidExpire);
    currentActiveClient.on('connection-state-change', handleConnectionStateChange);

    currentActiveClient
      .join(agora_app_id, agora_channel, agora_token, agora_uid)
      .then(() => {
        setIsAgoraConnected(true);
        hasJoined = true;
        setupAvatarDialogueMode();
      })
      .catch((err) => {
        setAkoolSessionError(`Agora join error: ${err.message}`);
        setIsAgoraConnected(false);
        setHasVideoStarted(false);
        setIsAvatarBuffering(false);
        console.error('useAkoolSession: Agora join error:', err);
      });

    return () => {
      setIsAvatarBuffering(false);
      if (currentActiveClient) {
        currentActiveClient.off('user-published', handleUserPublished);
        currentActiveClient.off('user-unpublished', handleUserUnpublished);
        currentActiveClient.off('stream-message', handleStreamMessage);
        currentActiveClient.off('token-privilege-will-expire', handleTokenWillExpire);
        currentActiveClient.off('token-privilege-did-expire', handleTokenDidExpire);
        currentActiveClient.off('connection-state-change', handleConnectionStateChange);

        if (
          hasJoined ||
          currentActiveClient.connectionState === 'CONNECTING' ||
          currentActiveClient.connectionState === 'CONNECTED'
        ) {
          currentActiveClient
            .leave()
            .catch((e) =>
              console.error('useAkoolSession: Error leaving Agora channel on cleanup:', e),
            )
            .finally(() => {
              if (agoraClientRef.current === currentActiveClient) {
                setIsAgoraConnected(false);
                setHasVideoStarted(false);
                setIsDialogueModeReady(false);
                agoraClientRef.current = null;
              }
            });
        } else {
          if (agoraClientRef.current === currentActiveClient) {
            setIsAgoraConnected(false);
            setHasVideoStarted(false);
            setIsDialogueModeReady(false);
            agoraClientRef.current = null;
          }
        }
      }
    };
  }, [akoolSession, AgoraRTCModule, onMessage, onAnalyticsEvent]);

  // Periodic dialogue mode reinforcement to prevent echoing
  useEffect(() => {
    if (!akoolSession || !isAgoraConnected || !isDialogueModeReady) return;

    const reinforcementInterval = setInterval(() => {
      if (agoraClientRef.current && agoraClientRef.current.connectionState === 'CONNECTED') {
        const reinforceMessage = {
          v: 2,
          type: 'command',
          mid: `reinforce-${Date.now()}`,
          pld: {
            mode: 1, // Dialogue mode
          },
        };

        try {
          // @ts-ignore
          agoraClientRef.current.sendStreamMessage(JSON.stringify(reinforceMessage), false);
        } catch (error) {
          console.warn('useAkoolSession: Failed to reinforce dialogue mode:', error);
        }
      }
    }, 120000); // Reinforce every 2 minutes

    return () => clearInterval(reinforcementInterval);
  }, [akoolSession, isAgoraConnected, isDialogueModeReady]);

  // Keep-alive mechanism for sessions
  useEffect(() => {
    if (!akoolSession || !isAgoraConnected) return;

    const keepAliveInterval = setInterval(() => {
      if (agoraClientRef.current && agoraClientRef.current.connectionState === 'CONNECTED') {
        try {
          const keepAliveMessage = {
            v: 2,
            type: 'ping',
            mid: `ping-${Date.now()}`,
            pld: {},
          };
          // @ts-ignore
          agoraClientRef.current.sendStreamMessage(JSON.stringify(keepAliveMessage), false);
        } catch (error) {
          console.warn('useAkoolSession: Keep-alive ping failed:', error);
        }
      }
    }, 30000); // Send keep-alive every 30 seconds

    return () => clearInterval(keepAliveInterval);
  }, [akoolSession, isAgoraConnected]);

  // Handle page visibility changes to maintain session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          if (agoraClientRef.current && akoolSession) {
            const connectionState = agoraClientRef.current.connectionState;

            if (connectionState === 'DISCONNECTED' && !showSessionEndedOverlay) {
              setShowSessionEndedOverlay(true);
              setAkoolSessionError(
                'Connection lost while tab was inactive. Please close and reopen chat.',
              );
            }
          }
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [akoolSession, showSessionEndedOverlay]);

  return {
    isAgoraConnected,
    hasVideoStarted,
    akoolSessionError,
    isAvatarBuffering,
    isDialogueModeReady,
    showSessionEndedOverlay,
    sendToAkool,
    setupAvatarDialogueMode,
  };
};
