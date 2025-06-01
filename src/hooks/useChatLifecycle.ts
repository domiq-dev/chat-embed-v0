import { useEffect } from 'react';
import { track, setUserId, getIds } from '../lib/analytics';

interface ChatLifecycleHook {
  chatSdk?: any;
  userId?: string;
  onSessionStart?: () => void;
  onUserMessage?: (text: string) => void;
  onBotMessage?: () => void;
  onFallback?: (reason: string) => void;
  onAnswerButtonClick?: (optionId: string, optionText: string) => void;
  onIncentiveOffered?: (incentiveType: string) => void;
  onIncentiveAccepted?: (incentiveType: string) => void;
  onChatEnd?: (converted: boolean) => void;
}

export function useChatLifecycle({
  chatSdk,
  userId,
  onSessionStart,
  onUserMessage,
  onBotMessage,
  onFallback,
  onAnswerButtonClick,
  onIncentiveOffered,
  onIncentiveAccepted,
  onChatEnd
}: ChatLifecycleHook) {
  
  // Set user ID when available
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId]);

  // Track chat session start
  useEffect(() => {
    const { sessionId } = getIds();
    const chat_start_ts = Date.now();
    
    // Track session started
    track('chat_session_started', {
      session_id: sessionId,
      chat_start_ts,
      page_url: typeof window !== 'undefined' ? window.location.href : ''
    });

    // Call callback if provided
    onSessionStart?.();
  }, []); // Only fire once when component mounts

  // Set up chatSdk event listeners
  useEffect(() => {
    if (!chatSdk) return;

    const { sessionId } = getIds();

    // User message sent
    const handleUserMessage = (text: string) => {
      track('user_message_sent', {
        session_id: sessionId,
        text_len: text.length
      });
      onUserMessage?.(text);
    };

    // Bot message received
    const handleBotMessage = () => {
      track('bot_message_received', {
        session_id: sessionId
      });
      onBotMessage?.();
    };

    // Fallback occurred
    const handleFallback = (reason: string) => {
      track('fallback_occurred', {
        session_id: sessionId,
        reason: reason || 'no_match'
      });
      onFallback?.(reason);
    };

    // Answer button clicked
    const handleAnswerButtonClick = (optionId: string, optionText: string) => {
      track('answer_button_clicked', {
        session_id: sessionId,
        option_id: optionId,
        option_text: optionText
      });
      onAnswerButtonClick?.(optionId, optionText);
    };

    // Incentive offered
    const handleIncentiveOffered = (incentiveType: string) => {
      track('incentive_offered', {
        session_id: sessionId,
        incentive_type: incentiveType
      });
      onIncentiveOffered?.(incentiveType);
    };

    // Incentive accepted
    const handleIncentiveAccepted = (incentiveType: string) => {
      track('incentive_accepted', {
        session_id: sessionId,
        incentive_type: incentiveType
      });
      onIncentiveAccepted?.(incentiveType);
    };

    // Chat ended
    const handleChatEnd = (converted: boolean) => {
      track('chat_ended', {
        session_id: sessionId,
        converted
      });
      onChatEnd?.(converted);
    };

    // Set up event listeners if chatSdk supports them
    if (typeof chatSdk.on === 'function') {
      chatSdk.on('userSend', handleUserMessage);
      chatSdk.on('botReply', handleBotMessage);
      chatSdk.on('fallback', handleFallback);
      chatSdk.on('optionClick', handleAnswerButtonClick);
      chatSdk.on('incentiveOffered', handleIncentiveOffered);
      chatSdk.on('incentiveAccepted', handleIncentiveAccepted);
      chatSdk.on('chatEnd', handleChatEnd);
    }

    // Cleanup function
    return () => {
      if (typeof chatSdk.off === 'function') {
        chatSdk.off('userSend', handleUserMessage);
        chatSdk.off('botReply', handleBotMessage);
        chatSdk.off('fallback', handleFallback);
        chatSdk.off('optionClick', handleAnswerButtonClick);
        chatSdk.off('incentiveOffered', handleIncentiveOffered);
        chatSdk.off('incentiveAccepted', handleIncentiveAccepted);
        chatSdk.off('chatEnd', handleChatEnd);
      }
    };
  }, [chatSdk, onSessionStart, onUserMessage, onBotMessage, onFallback, onAnswerButtonClick, onIncentiveOffered, onIncentiveAccepted, onChatEnd]);

  // Return helper functions for manual event tracking
  return {
    trackUserMessage: (text: string) => {
      try {
        const { sessionId } = getIds();
        track('user_message_sent', {
          session_id: sessionId,
          text_len: text.length
        });
      } catch (error) {
        console.warn('trackUserMessage error:', error);
      }
    },
    trackBotMessage: () => {
      try {
        const { sessionId } = getIds();
        track('bot_message_received', {
          session_id: sessionId
        });
      } catch (error) {
        console.warn('trackBotMessage error:', error);
      }
    },
    trackFallback: (reason: string) => {
      try {
        const { sessionId } = getIds();
        track('fallback_occurred', {
          session_id: sessionId,
          reason: reason || 'no_match'
        });
      } catch (error) {
        console.warn('trackFallback error:', error);
      }
    },
    trackAnswerButtonClick: (optionId: string, optionText: string) => {
      try {
        const { sessionId } = getIds();
        track('answer_button_clicked', {
          session_id: sessionId,
          option_id: optionId,
          option_text: optionText
        });
      } catch (error) {
        console.warn('trackAnswerButtonClick error:', error);
      }
    },
    trackContactCapture: (method: 'email' | 'phone', isValid: boolean) => {
      try {
        const { sessionId } = getIds();
        track('contact_captured', {
          session_id: sessionId,
          contact_method: method,
          valid: isValid
        });
      } catch (error) {
        console.warn('trackContactCapture error:', error);
      }
    },
    trackTourBooked: (tourType: 'in_person' | 'self_guided' | 'virtual') => {
      try {
        const { sessionId } = getIds();
        track('tour_booked', {
          session_id: sessionId,
          tour_type: tourType,
          source: 'widget'
        });
      } catch (error) {
        console.warn('trackTourBooked error:', error);
      }
    },
    trackEmailOfficeClick: (location: string) => {
      try {
        const { sessionId } = getIds();
        track('email_office_clicked', {
          session_id: sessionId,
          cta_location: location
        });
      } catch (error) {
        console.warn('trackEmailOfficeClick error:', error);
      }
    },
    trackPhoneCallClick: (location: string) => {
      try {
        const { sessionId } = getIds();
        track('phone_call_clicked', {
          session_id: sessionId,
          cta_location: location
        });
      } catch (error) {
        console.warn('trackPhoneCallClick error:', error);
      }
    },
    trackIncentiveOffered: (incentiveType: string) => {
      try {
        const { sessionId } = getIds();
        track('incentive_offered', {
          session_id: sessionId,
          incentive_type: incentiveType
        });
      } catch (error) {
        console.warn('trackIncentiveOffered error:', error);
      }
    },
    trackIncentiveExpired: (incentiveType: string) => {
      try {
        const { sessionId } = getIds();
        track('incentive_expired', {
          session_id: sessionId,
          incentive_type: incentiveType
        });
      } catch (error) {
        console.warn('trackIncentiveExpired error:', error);
      }
    },
    trackIncentiveAccepted: (incentiveType: string) => {
      try {
        const { sessionId } = getIds();
        track('incentive_accepted', {
          session_id: sessionId,
          incentive_type: incentiveType
        });
      } catch (error) {
        console.warn('trackIncentiveAccepted error:', error);
      }
    },
    // NEW: Remaining 6 analytics events for 18/18 completion
    trackAdminHandoffTriggered: (reason: string, currentStage?: string) => {
      try {
        const { sessionId } = getIds();
        track('admin_handoff_triggered', {
          session_id: sessionId,
          handoff_reason: reason,
          conversation_stage: currentStage || 'unknown'
        });
      } catch (error) {
        console.warn('trackAdminHandoffTriggered error:', error);
      }
    },
    trackCustomerServiceEscalated: (escalationType: 'complex_query' | 'user_request' | 'fallback_limit', query?: string) => {
      try {
        const { sessionId } = getIds();
        track('customer_service_escalated', {
          session_id: sessionId,
          escalation_type: escalationType,
          original_query: query || '',
          escalation_timestamp: Date.now()
        });
      } catch (error) {
        console.warn('trackCustomerServiceEscalated error:', error);
      }
    },
    trackConversationAbandoned: (sessionDuration: number, messageCount: number, lastActivity: string) => {
      try {
        const { sessionId } = getIds();
        track('conversation_abandoned', {
          session_id: sessionId,
          session_duration_ms: sessionDuration,
          total_messages: messageCount,
          last_activity_type: lastActivity,
          abandonment_timestamp: Date.now()
        });
      } catch (error) {
        console.warn('trackConversationAbandoned error:', error);
      }
    },
    trackWidgetSessionEnded: (endReason: 'user_closed' | 'timeout' | 'navigation' | 'error', sessionDuration: number, messageCount: number) => {
      try {
        const { sessionId } = getIds();
        track('widget_session_ended', {
          session_id: sessionId,
          end_reason: endReason,
          session_duration_ms: sessionDuration,
          total_messages: messageCount,
          end_timestamp: Date.now()
        });
      } catch (error) {
        console.warn('trackWidgetSessionEnded error:', error);
      }
    },
    trackWidgetMinimized: (currentStage: string, messageCount: number) => {
      try {
        const { sessionId } = getIds();
        track('widget_minimized', {
          session_id: sessionId,
          conversation_stage: currentStage,
          messages_at_minimize: messageCount,
          minimize_timestamp: Date.now()
        });
      } catch (error) {
        console.warn('trackWidgetMinimized error:', error);
      }
    },
    trackWidgetMaximized: (previouslyMinimized: boolean, timeSinceMinimize?: number) => {
      try {
        const { sessionId } = getIds();
        track('widget_maximized', {
          session_id: sessionId,
          was_minimized: previouslyMinimized,
          time_minimized_ms: timeSinceMinimize || 0,
          maximize_timestamp: Date.now()
        });
      } catch (error) {
        console.warn('trackWidgetMaximized error:', error);
      }
    }
  };
} 