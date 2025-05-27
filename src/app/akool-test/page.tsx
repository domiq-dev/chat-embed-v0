'use client';

import { useEffect, useState, useRef } from 'react';
import { ApiService, Avatar as AkoolAvatarType, Session as AkoolSessionType } from '../../services/apiService';
// Dynamically import AgoraRTC
import type { IAgoraRTCClient, IRemoteVideoTrack, UID, SDK_MODE, SDK_CODEC } from 'agora-rtc-sdk-ng';

// Define the expected structure of the token API response
interface TokenResponse {
  token?: string;
  error?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

const AKOOL_OPENAPI_HOST = 'https://openapi.akool.com'; // Please verify if this is the correct host
const DEFAULT_SESSION_DURATION = 300; // 5 minutes in seconds

export default function AkoolTestPage() {
  const [AgoraRTCModule, setAgoraRTCModule] = useState<any>(null); // To hold the dynamically imported module

  const [avatars, setAvatars] = useState<AkoolAvatarType[]>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [apiService, setApiService] = useState<ApiService | null>(null);

  const [currentSession, setCurrentSession] = useState<AkoolSessionType | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null);
  const [isAgoraConnected, setIsAgoraConnected] = useState(false);
  const [hasVideoStarted, setHasVideoStarted] = useState(false); // New state for video playback

  const [textToSend, setTextToSend] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false); // Ref to track if a send is in progress

  useEffect(() => {
    // Dynamically import AgoraRTC SDK
    import('agora-rtc-sdk-ng').then(module => {
      setAgoraRTCModule(module.default); // .default is common for UMD/ESM modules
    }).catch(err => {
      console.error("Failed to load Agora RTC SDK dynamically:", err);
      setAvatarError("Failed to load Agora RTC SDK. Features requiring it will not work.");
    });
  }, []);

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

        const service = new ApiService(AKOOL_OPENAPI_HOST, tokenData.token);
        setApiService(service);
      } catch (err) {
        console.error('Error initializing ApiService:', err);
        setAvatarError(err instanceof Error ? err.message : String(err)); // Use avatarError for service init issues
        setIsLoadingAvatars(false);
      }
    };

    initializeService();
  }, []);

  useEffect(() => {
    if (!apiService) {
      if (!isLoadingAvatars && !avatarError) setIsLoadingAvatars(true);
      return;
    }

    const fetchAvatars = async () => {
      setIsLoadingAvatars(true);
      setAvatarError(null);
      try {
        const avatarList = await apiService.getAvatarList();
        setAvatars(avatarList || []);
      } catch (err) {
        console.error('Error fetching avatars:', err);
        setAvatarError(err instanceof Error ? err.message : String(err));
        setAvatars([]);
      } finally {
        setIsLoadingAvatars(false);
      }
    };

    fetchAvatars();
  }, [apiService]);

  const handleStartSession = async (avatarId: string) => {
    if (!apiService) {
      setSessionError('ApiService not initialized yet.');
      return;
    }
    if (currentSession && isAgoraConnected && agoraClientRef.current) { 
        try {
            await agoraClientRef.current.leave();
        } catch (e) {
            console.error("Error leaving previous Agora session:", e);
        }
        setIsAgoraConnected(false);
        setHasVideoStarted(false); // Reset video state
        agoraClientRef.current = null;
        setCurrentSession(null); 
        setConversation([]); 
    }
    setIsCreatingSession(true);
    setSessionError(null);
    setHasVideoStarted(false); // Reset for new session
    try {
      const sessionData = await apiService.createSession({ avatar_id: avatarId, duration: DEFAULT_SESSION_DURATION });
      setCurrentSession(sessionData);
      setConversation([]); 
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Effect for Agora RTC client setup and teardown
  useEffect(() => {
    if (!AgoraRTCModule || !currentSession?.credentials) { // Guard against AgoraRTCModule not loaded
      if (agoraClientRef.current && isAgoraConnected) {
        agoraClientRef.current.leave()
          .then(() => { 
            setIsAgoraConnected(false); 
            setHasVideoStarted(false);
            agoraClientRef.current = null; 
          })
          .catch(e => console.error('Error leaving Agora channel during credential/module cleanup:', e));
      }
      return;
    }

    let clientInstance: IAgoraRTCClient | null = null;
    try {
      clientInstance = AgoraRTCModule.createClient({ mode: 'rtc' as SDK_MODE, codec: 'vp8' as SDK_CODEC });
    } catch (error) {
      console.error("Failed to create Agora client:", error);
      setSessionError("Failed to initialize Agora client. Please refresh.");
      return;
    }
    
    if (!clientInstance) {
        console.error("Agora client creation returned null or undefined unexpectedly.");
        setSessionError("Failed to initialize Agora client (instance is null).");
        return;
    }
    agoraClientRef.current = clientInstance; // Assign to ref after successful creation
    const currentActiveClient = clientInstance; // Use this local variable for operations in this effect scope
    let hasJoined = false;

    const handleUserPublished = async (user: any, mediaType: 'video' | 'audio') => {
      if (!currentActiveClient) return;
      console.log(`Agora user ${user.uid} published ${mediaType}`);
      await currentActiveClient.subscribe(user, mediaType); // Subscribe to whatever is published
      
      if (mediaType === 'video') {
        const videoPlayerDiv = document.getElementById('akool-avatar-player');
        if (videoPlayerDiv) {
            console.log('Playing remote video track in akool-avatar-player.');
            user.videoTrack?.play(videoPlayerDiv);
            setHasVideoStarted(true); // Video has started
        } else {
            console.warn("Video player div 'akool-avatar-player' not found during user-published");
        }
      }
      if (mediaType === 'audio') {
        console.log('Remote user published audio. Attempting to play.');
        // SDK usually handles playing audio automatically after subscription.
        // Explicitly calling play() can ensure it or help catch errors.
        try {
          user.audioTrack?.play();
          console.log('Successfully called play() on remote audio track.');
        } catch (e) {
          console.error('Error attempting to play remote audio track:', e);
        }
      }
    };

    const handleUserUnpublished = (user: any, mediaType: 'video' | 'audio') => {
        // Logic for unpublish (e.g., stop playing if needed)
    };

    const handleStreamMessage = (uid: UID, data: Uint8Array | string) => {
      try {
        const messageStr = typeof data === 'string' ? data : new TextDecoder().decode(data as Uint8Array);
        console.log('Received stream message from UID:', uid, 'Data:', messageStr); 
        const parsedMessage = JSON.parse(messageStr);

        if (parsedMessage.type === 'chat' && parsedMessage.pld?.from === 'bot' && parsedMessage.pld?.text) {
          // Always generate a new, unique ID for displaying the bot's message.
          // parsedMessage.mid is for correlation if needed, not for React key.
          const displayBotMessageId = `bot-${window.crypto.randomUUID()}`;
          console.log(
            'Processing Bot Message. Original mid:',
            parsedMessage.mid,
            'Generated Display ID for bot message:',
            displayBotMessageId
          );
          setConversation(prev => {
            // This specific warning for duplicate bot display IDs should ideally not trigger now.
            if (prev.some(msg => msg.id === displayBotMessageId)) {
              console.warn(
                'DUPLICATE displayBotMessageId detected before adding to conversation:',
                displayBotMessageId
              );
            }
            return [
              ...prev,
              {
                id: displayBotMessageId, // Use the newly generated unique ID for the key
                sender: 'bot',
                text: parsedMessage.pld.text,
                timestamp: Date.now(),
                // Optionally, store the original mid for correlation:
                // correlationId: parsedMessage.mid 
              },
            ];
          });
        }
      } catch (e) {
        console.error('Error processing stream message:', e, 'Raw data:', data);
      }
    };

    const { agora_app_id, agora_channel, agora_token, agora_uid } = currentSession.credentials;
    // Use AgoraRTCModule here
    currentActiveClient.on('user-published', handleUserPublished);
    currentActiveClient.on('user-unpublished', handleUserUnpublished);
    currentActiveClient.on('stream-message', handleStreamMessage);
    
    currentActiveClient.join(agora_app_id, agora_channel, agora_token, agora_uid)
      .then(() => {
        setIsAgoraConnected(true);
        hasJoined = true;
      })
      .catch(err => {
        setSessionError(`Agora join error: ${err.message}`);
        setIsAgoraConnected(false);
        setHasVideoStarted(false);
      });

    return () => {
      if (currentActiveClient) {
        currentActiveClient.off('user-published', handleUserPublished);
        currentActiveClient.off('user-unpublished', handleUserUnpublished);
        currentActiveClient.off('stream-message', handleStreamMessage);
        if (hasJoined || currentActiveClient.connectionState === 'CONNECTING' || currentActiveClient.connectionState === 'CONNECTED') {
          currentActiveClient.leave()
            .catch(e => console.error('Error leaving Agora channel on cleanup:', e))
            .finally(() => {
              if (agoraClientRef.current === currentActiveClient) {
                setIsAgoraConnected(false);
                setHasVideoStarted(false);
                agoraClientRef.current = null;
              }
            });
        } else {
           if (agoraClientRef.current === currentActiveClient) {
             setIsAgoraConnected(false);
             setHasVideoStarted(false);
             agoraClientRef.current = null; 
           }
        }
      }
    };
  }, [currentSession, AgoraRTCModule]); // Add AgoraRTCModule to dependencies

  const handleSendText = async () => {
    if (!textToSend.trim() || !agoraClientRef.current || !isAgoraConnected || !AgoraRTCModule) {
      console.warn('Cannot send message. Conditions not met.');
      return;
    }
    // Add a flag to prevent rapid double submission - simple debounce
    if (isSendingRef.current) {
        console.log('Send already in progress, skipping.');
        return;
    }
    isSendingRef.current = true;

    const localAgoraClient = agoraClientRef.current;
    if (typeof (localAgoraClient as any).sendStreamMessage !== 'function') {
      console.error('sendStreamMessage method does not exist on Agora client instance.');
      setSessionError('Error: sendStreamMessage method not found.');
      isSendingRef.current = false;
      return;
    }

    const messageId = `user-${window.crypto.randomUUID()}`;
    console.log('Generated User Message ID:', messageId);

    const agoraMessage = {
      v: 2, type: "chat", mid: messageId, idx: 0, fin: true,
      pld: { text: textToSend.trim() },
    };

    try {
      // @ts-ignore 
      await (localAgoraClient as IAgoraRTCClient).sendStreamMessage(JSON.stringify(agoraMessage), false);
      setConversation(prev => {
        // Check for existing ID before adding - for debugging
        if (prev.some(msg => msg.id === messageId)) {
            console.warn('Duplicate USER ID detected before adding to conversation:', messageId);
        }
        return [
            ...prev,
            { id: messageId, sender: 'user', text: textToSend.trim(), timestamp: Date.now() },
        ];
      });
      setTextToSend('');
    } catch (error) {
      console.error('Failed to send stream message:', error);
      setSessionError('Failed to send message. Check console.');
    } finally {
        setTimeout(() => { isSendingRef.current = false; }, 100); // Reset flag after a short delay
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}> {/* Left column for controls */}
        <h1>AKOOL Avatar Test</h1>
        {!AgoraRTCModule && <p style={{color: 'orange'}}>Loading Agora SDK...</p> } 

        {/* Avatar Selection */}
        {!isLoadingAvatars && !avatarError && avatars.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2>Available Avatars:</h2>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {avatars.map((avatar) => (
                <li key={avatar.avatar_id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                  <strong>{avatar.name}</strong> (ID: {avatar.avatar_id}) - Gender: {avatar.gender}
                  {avatar.thumbnailUrl && (
                    <div style={{ margin: '5px 0' }}>
                      <img src={avatar.thumbnailUrl} alt={avatar.name} style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                  )}
                  <button 
                    onClick={() => handleStartSession(avatar.avatar_id)} 
                    disabled={!AgoraRTCModule || isCreatingSession || (currentSession?.credentials?.agora_channel.startsWith(avatar.avatar_id) && isAgoraConnected)}
                    style={{ padding: '8px 12px', marginTop: '10px', cursor: 'pointer' }}
                  >
                    {!AgoraRTCModule ? 'SDK Loading...' : (currentSession?.credentials?.agora_channel.startsWith(avatar.avatar_id) && isAgoraConnected) 
                      ? 'Session Active' 
                      : isCreatingSession 
                      ? 'Starting...' 
                      : 'Start Session'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {isLoadingAvatars && <p>Loading avatars...</p>}
        {avatarError && (
          <div style={{ color: 'red', border: '1px solid red', padding: '10px', marginBottom: '15px' }}>
            <h2>Error Loading Avatars:</h2>
            <p>{avatarError}</p>
            <p>
              <strong>Troubleshooting Tips:</strong>
              <ul>
                <li>Ensure your AKOOL_CLIENT_ID and AKOOL_CLIENT_SECRET are correctly set in your <code>.env.local</code> file.</li>
                <li>Verify the <code>AKOOL_OPENAPI_HOST</code> ('{AKOOL_OPENAPI_HOST}') is correct.</li>
                <li>Check your internet connection and firewall settings.</li>
                <li>Inspect the browser console and network tab for more detailed error messages.</li>
                <li>Confirm the <code>/api/akool-token</code> endpoint is working correctly and returning a token.</li>
              </ul>
            </p>
          </div>
        )}
      </div>

      <div style={{ flex: 2 }}> {/* Right column for avatar and chat */}
        {currentSession && isAgoraConnected && (
          <div style={{ border: '1px solid green', padding: '15px', backgroundColor: '#f0fff0' }}>
            <h2>Live Avatar Session</h2>
            <p><strong>Channel:</strong> {currentSession.credentials.agora_channel}</p>
            <div 
              id="akool-avatar-player" 
              style={{
                width: '320px', 
                height: '240px', 
                border: '1px solid black', 
                backgroundColor: '#333', 
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden' // Important for clean look if aspect ratios differ
              }}
            >
              {!isAgoraConnected && AgoraRTCModule && <p style={{ color: 'white', textAlign: 'center' }}>Connecting to Agora...</p>}
              {!AgoraRTCModule && <p style={{ color: 'white', textAlign: 'center'}}>Waiting for Agora SDK...</p>}
              {isAgoraConnected && !hasVideoStarted && <p style={{ color: 'white', textAlign: 'center' }}>Waiting for avatar video...</p>}
              {/* Video track will be played here by Agora SDK */} 
            </div>
            
            <h3>Chat with Avatar</h3>
            <div ref={chatContainerRef} style={{ height: '200px', border: '1px solid #ccc', overflowY: 'auto', padding: '10px', marginBottom: '10px', backgroundColor:'white' }}>
              {conversation.map(msg => (
                <div key={msg.id} style={{ marginBottom: '8px', textAlign: msg.sender === 'bot' ? 'left' : 'right' }}>
                  <span style={{
                    backgroundColor: msg.sender === 'bot' ? '#e1f5fe' : '#c8e6c9',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    display: 'inline-block'
                  }}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={textToSend} 
                onChange={(e) => setTextToSend(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Type your message..." 
                style={{ flexGrow: 1, padding: '8px' }}
                disabled={!AgoraRTCModule || !isAgoraConnected || !currentSession}
              />
              <button onClick={handleSendText} disabled={!AgoraRTCModule || !isAgoraConnected || !currentSession || !textToSend.trim()}>Send</button>
            </div>
          </div>
        )}
        {!currentSession && !isCreatingSession && <p>Select an avatar and start a session to interact.</p>}
      </div>
    </div>
  );
} 