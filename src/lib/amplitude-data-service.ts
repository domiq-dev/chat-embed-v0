interface AmplitudeEventQuery {
  event_type: string;
  start: string;
  end: string;
  user_id?: string;
  device_id?: string;
}

interface AmplitudeResponse {
  data: Array<{
    event_type: string;
    user_id: string;
    device_id: string;
    session_id: string;
    event_properties: Record<string, any>;
    user_properties: Record<string, any>;
    timestamp: string;
  }>;
}

interface AggregatedAmplitudeData {
  // Core Engagement Metrics
  chatSessionStarted?: boolean;
  userMessagesSent?: number;
  botMessagesReceived?: number;
  answerButtonClicks?: number;

  // Contact & Tour Metrics
  contactCaptured?: boolean;
  contactMethod?: 'email' | 'phone';
  tourBooked?: boolean;
  tourType?: 'in_person' | 'self_guided' | 'virtual';

  // CTA Interactions
  emailOfficeClicked?: number;
  phoneCallClicked?: number;

  // Incentive Tracking
  incentiveOffered?: boolean;
  incentiveAccepted?: boolean;
  incentiveExpired?: boolean;

  // Advanced Session Management
  adminHandoffTriggered?: boolean;
  customerServiceEscalated?: boolean;
  conversationAbandoned?: boolean;
  widgetSessionEnded?: boolean;
  widgetMinimized?: number;

  // Calculated Metrics
  sessionDuration?: number;
  engagementScore?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  qualified?: boolean;
  preLease?: boolean;
  tourIntent?: boolean;
  hot?: boolean;
  signed?: boolean;
}

class AmplitudeDataService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl = 'https://amplitude.com/api/2/events';
  private activeRequests = new Set<AbortController>();
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || '';
    this.secretKey = process.env.AMPLITUDE_SECRET_KEY || '';

    if (!this.apiKey || !this.secretKey) {
      console.warn('Amplitude API credentials not found - data service disabled');
    }
  }

  private createAbortController(): AbortController {
    const controller = new AbortController();
    this.activeRequests.add(controller);

    // Auto-timeout after REQUEST_TIMEOUT
    const timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        console.warn('Amplitude API request timed out, forcing abort');
        controller.abort();
      }
    }, this.REQUEST_TIMEOUT);

    // Clean up timeout when request completes
    controller.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      this.activeRequests.delete(controller);
    });

    return controller;
  }

  private cleanupRequest(controller: AbortController) {
    this.activeRequests.delete(controller);
    if (!controller.signal.aborted) {
      controller.abort();
    }
  }

  async fetchEvents(query: AmplitudeEventQuery): Promise<AmplitudeResponse> {
    const controller = this.createAbortController();

    try {
      const params = new URLSearchParams({
        start: query.start,
        end: query.end,
      });

      if (query.user_id) params.append('user_id', query.user_id);
      if (query.device_id) params.append('device_id', query.device_id);

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          Authorization: `Basic ${btoa(`${this.apiKey}:${this.secretKey}`)}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Amplitude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.cleanupRequest(controller);
      return data;
    } catch (error) {
      this.cleanupRequest(controller);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Amplitude API request was cancelled (timeout or manual abort)');
        }
        throw new Error(`Amplitude API fetch failed: ${error.message}`);
      }
      throw error;
    }
  }

  aggregateUserData(events: AmplitudeResponse['data']): AggregatedAmplitudeData {
    const data: AggregatedAmplitudeData = {};

    // Group events by type and count them
    const eventCounts = events.reduce(
      (acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Core Engagement Metrics
    data.chatSessionStarted = eventCounts['chat_session_started'] > 0;
    data.userMessagesSent = eventCounts['user_message_sent'] || 0;
    data.botMessagesReceived = eventCounts['bot_message_received'] || 0;
    data.answerButtonClicks = eventCounts['answer_button_clicked'] || 0;

    // Contact & Tour Metrics
    const contactEvents = events.filter((e) => e.event_type === 'contact_captured');
    data.contactCaptured = contactEvents.length > 0;
    data.contactMethod = contactEvents[0]?.event_properties?.contact_method as 'email' | 'phone';

    const tourEvents = events.filter((e) => e.event_type === 'tour_booked');
    data.tourBooked = tourEvents.length > 0;
    data.tourType = tourEvents[0]?.event_properties?.tour_type as
      | 'in_person'
      | 'self_guided'
      | 'virtual';

    // CTA Interactions
    data.emailOfficeClicked = eventCounts['email_office_clicked'] || 0;
    data.phoneCallClicked = eventCounts['phone_call_clicked'] || 0;

    // Incentive Tracking
    data.incentiveOffered = eventCounts['incentive_offered'] > 0;
    data.incentiveAccepted = eventCounts['incentive_accepted'] > 0;
    data.incentiveExpired = eventCounts['incentive_expired'] > 0;

    // Advanced Session Management
    data.adminHandoffTriggered = eventCounts['admin_handoff_triggered'] > 0;
    data.customerServiceEscalated = eventCounts['customer_service_escalated'] > 0;
    data.conversationAbandoned = eventCounts['conversation_abandoned'] > 0;
    data.widgetSessionEnded = eventCounts['widget_session_ended'] > 0;
    data.widgetMinimized = eventCounts['widget_minimized'] || 0;

    // Calculate session duration
    const sessionStartEvent = events.find((e) => e.event_type === 'chat_session_started');
    const sessionEndEvent = events.find((e) => e.event_type === 'widget_session_ended');
    if (sessionStartEvent && sessionEndEvent) {
      const duration =
        new Date(sessionEndEvent.timestamp).getTime() -
        new Date(sessionStartEvent.timestamp).getTime();
      data.sessionDuration = Math.round(duration / 1000); // in seconds
    }

    // Calculate engagement score
    data.engagementScore = this.calculateEngagementScore(data);

    // Calculate qualification flags
    data.qualified = data.contactCaptured && (data.userMessagesSent || 0) > 5;
    data.tourIntent = data.tourBooked || eventCounts['tour_intent_expressed'] > 0;
    data.hot = (data.userMessagesSent || 0) > 3 && (data.answerButtonClicks || 0) > 1;
    data.preLease = data.qualified && data.tourBooked;
    data.signed = eventCounts['lease_signed'] > 0;

    return data;
  }

  private calculateEngagementScore(
    data: AggregatedAmplitudeData,
  ): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    let score = 0;

    // Message engagement (0-40 points)
    const messages = data.userMessagesSent || 0;
    if (messages > 20) score += 40;
    else if (messages > 15) score += 35;
    else if (messages > 10) score += 30;
    else if (messages > 5) score += 20;
    else if (messages > 1) score += 10;

    // Contact capture (0-25 points)
    if (data.contactCaptured) score += 25;

    // Tour booking (0-25 points)
    if (data.tourBooked) score += 25;

    // Interaction depth (0-10 points)
    const interactions =
      (data.answerButtonClicks || 0) +
      (data.emailOfficeClicked || 0) +
      (data.phoneCallClicked || 0);
    if (interactions > 5) score += 10;
    else if (interactions > 2) score += 5;

    // Return letter grade
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  async getUserData(
    userId?: string,
    deviceId?: string,
    days = 30,
  ): Promise<AggregatedAmplitudeData> {
    try {
      const end = new Date().toISOString();
      const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const response = await this.fetchEvents({
        event_type: '*', // All events
        start,
        end,
        user_id: userId,
        device_id: deviceId,
      });

      return this.aggregateUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch Amplitude data:', error);
      return {};
    }
  }

  async getLeadAmplitudeData(leadId: string): Promise<AggregatedAmplitudeData> {
    // For now, use device_id as lead identifier
    // In production, you'd want to map lead IDs to user/device IDs
    return this.getUserData(undefined, leadId);
  }

  // Force close all active sessions
  forceCloseAllSessions() {
    // Force close all active requests
    this.activeRequests.forEach((controller) => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });

    // Clear set
    this.activeRequests.clear();
  }

  // Get status of active sessions
  getActiveSessionsCount(): number {
    return this.activeRequests.size;
  }
}

export const amplitudeDataService = new AmplitudeDataService();
export type { AggregatedAmplitudeData };

// Global cleanup function for emergency session closure
if (typeof window !== 'undefined') {
  (window as any).forceCloseAmplitudeSessions = () => {
    amplitudeDataService.forceCloseAllSessions();
  };
}
