// Shared types for chat components

// Chat message structure
export interface ChatMessageForDisplay {
  id: string;
  from: 'agent' | 'user'; // 'agent' is our bot/AKOOL, 'user' is the human
  text: string;
  sentAt?: Date; // Changed from timestamp for consistency with existing Message type
}

// Analytics interface for tracking - expanded to include all methods used in ChatModal
export interface ChatAnalytics {
  trackEmailOfficeClick: (location: string) => void;
  trackPhoneCallClick: (location: string) => void;
  trackAnswerButtonClick?: (optionId: string, optionText: string) => void;
  trackIncentiveOffered?: (incentiveType: string) => void;
  trackIncentiveExpired?: (incentiveType: string) => void;
  trackIncentiveAccepted?: (incentiveType: string) => void;
  // Additional methods used in ChatModal
  trackUserMessage?: (message: string) => void;
  trackBotMessage?: () => void;
  trackAdminHandoffTriggered?: (reason: string, stage: string) => void;
  trackCustomerServiceEscalated?: (reason: string, message: string) => void;
  trackFallback?: (reason: string) => void;
  trackConversationAbandoned?: (
    duration: number,
    messageCount: number,
    lastActivity: string,
  ) => void;
  trackWidgetSessionEnded?: (reason: string, duration: number, messageCount: number) => void;
}

// AKOOL video player ID constant
export const AKOOL_PLAYER_ID = 'akool-avatar-video-player';
