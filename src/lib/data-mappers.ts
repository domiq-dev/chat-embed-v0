import { Lead, LeadActivity, DummyAgent, DummyTour } from './dummy-data';

// Map database PropertyManager to frontend Agent format
export const mapPropertyManagerToAgent = (manager: any): DummyAgent => {
  try {
    if (!manager) {
      console.warn('⚠️ mapPropertyManagerToAgent: No manager data provided');
      return { id: 'unknown', name: 'Unknown Manager' };
    }

    return {
      id: manager.id || 'unknown',
      name: `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || 'Unknown Manager',
    };
  } catch (error) {
    console.error('❌ mapPropertyManagerToAgent error:', error);
    return { id: 'error', name: 'Error Mapping Manager' };
  }
};

// Map database User + Conversation to frontend Lead format
export const mapToLead = (conversation: any, user: any, activities: any[] = []): Lead => {
  try {
    // Map conversation status to frontend stage
    const stageMap: Record<string, Lead['currentStage']> = {
      new: 'chat_initiated',
      qualified: 'info_collected',
      tour_requested: 'tour_scheduled',
      tour_completed: 'tour_completed',
      handoff: 'handed_off',
    };

    // Handle potential missing data
    if (!conversation) {
      console.warn('⚠️ mapToLead: No conversation data provided');
      return {
        id: 'unknown',
        name: 'Unknown Lead',
        currentStage: 'chat_initiated',
        source: 'chat',
        createdAt: new Date(),
        lastActivity: new Date(),
        timeline: [],
      };
    }

    // Map timeline activities
    const mappedActivities: LeadActivity[] = (activities || []).map((activity) => {
      try {
        return {
          id: activity.id || `activity-${Math.random().toString(36).substring(2, 9)}`,
          leadId: conversation.id,
          type: activity.type as LeadActivity['type'],
          timestamp: new Date(activity.timestamp || Date.now()),
          details: {
            agentName: activity.details?.agentName,
            agentId: activity.details?.agentId,
            tourDate: activity.details?.tourDate ? new Date(activity.details.tourDate) : undefined,
            unitRequested: activity.details?.unitRequested,
            notes: activity.details?.notes,
            chatSummary: activity.details?.chatSummary,
            emailCollected: activity.details?.emailCollected,
            phoneCollected: activity.details?.phoneCollected,
          },
          createdBy: activity.created_by || 'system',
        };
      } catch (error) {
        console.error('❌ Error mapping activity:', error, activity);
        return {
          id: `error-${Math.random().toString(36).substring(2, 9)}`,
          leadId: conversation.id,
          type: 'chat_initiated',
          timestamp: new Date(),
          details: { chatSummary: 'Error mapping activity' },
          createdBy: 'system',
        };
      }
    });

    // Create Amplitude data or use defaults
    const amplitudeData = conversation.metadata?.amplitude || {
      chatSessionStarted: true,
      userMessagesSent: 0,
      botMessagesReceived: 0,
      contactCaptured: !!(user?.email || user?.phone),
      contactMethod: user?.email ? 'email' : user?.phone ? 'phone' : undefined,
      tourBooked: conversation.is_book_tour || false,
      sessionDuration: 0,
      engagementScore: 'C',
      qualified: conversation.is_qualified || false,
    };

    const result: Lead = {
      id: conversation.id || `lead-${Math.random().toString(36).substring(2, 9)}`,
      name: user
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous User'
        : 'Anonymous User',
      email: user?.email,
      phone: user?.phone,
      currentStage: stageMap[conversation.status] || 'chat_initiated',
      source: conversation.source || 'chat',
      createdAt: new Date(conversation.created_at || Date.now()),
      lastActivity: new Date(conversation.updated_at || Date.now()),
      assignedAgent: conversation.property_manager_name,
      assignedAgentId: conversation.property_manager_id,
      unitInterest: conversation.apartment_size_preference,
      timeline: mappedActivities,
      notes: conversation.ai_intent_summary,
      amplitudeData,
    };

    return result;
  } catch (error) {
    console.error('❌ mapToLead error:', error, { conversation, user });
    // Return minimal valid lead to prevent UI crashes
    return {
      id: `error-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Error Mapping Lead',
      currentStage: 'chat_initiated',
      source: 'chat',
      createdAt: new Date(),
      lastActivity: new Date(),
      timeline: [
        {
          id: 'error',
          leadId: 'error',
          type: 'chat_initiated',
          timestamp: new Date(),
          details: { chatSummary: 'Error mapping lead data' },
          createdBy: 'system',
        },
      ],
    };
  }
};

// Map conversations to tours
export const mapConversationToTour = (
  conversation: any,
  user: any,
  agent: any,
): DummyTour | null => {
  if (!conversation.is_book_tour || !conversation.tour_datetime) {
    return null;
  }

  const tourStart = new Date(conversation.tour_datetime);
  const tourEnd = new Date(tourStart);
  tourEnd.setHours(tourEnd.getHours() + 1); // Assume 1 hour duration

  return {
    id: `tour-${conversation.id}`,
    title: `Tour - ${conversation.apartment_size_preference || 'Unit'}`,
    start: tourStart,
    end: tourEnd,
    prospectName: user ? `${user.first_name} ${user.last_name}` : 'Anonymous',
    prospectId: user?.id,
    leadId: conversation.id,
    unit: conversation.apartment_size_preference || 'Not specified',
    agent: agent ? `${agent.first_name} ${agent.last_name}` : undefined,
    agentId: agent?.id,
    status: conversation.status === 'tour_completed' ? 'completed' : 'scheduled',
    source: conversation.source || 'chat',
  };
};

export function mapConversationToLead(conversation: any, activities: any[] = []): Lead {
  // Map conversation status to frontend stage
  const stageMap: Record<string, Lead['currentStage']> = {
    new: 'chat_initiated',
    qualified: 'info_collected',
    tour_requested: 'tour_scheduled',
    tour_completed: 'tour_completed',
    handoff: 'handed_off',
  };

  // Handle potential missing data
  if (!conversation) {
    console.warn('⚠️ mapToLead: No conversation data provided');
    return {
      id: 'unknown',
      name: 'Unknown Lead',
      currentStage: 'chat_initiated',
      source: 'chat',
      createdAt: new Date(),
      lastActivity: new Date(),
      timeline: [],
    };
  }

  // Map timeline activities
  const mappedActivities: LeadActivity[] = (activities || []).map((activity) => {
    try {
      return {
        id: activity.id || `activity-${Math.random().toString(36).substring(2, 9)}`,
        leadId: conversation.id,
        type: activity.type as LeadActivity['type'],
        timestamp: new Date(activity.timestamp || Date.now()),
        details: {
          agentName: activity.details?.agentName,
          agentId: activity.details?.agentId,
          tourDate: activity.details?.tourDate ? new Date(activity.details.tourDate) : undefined,
          unitRequested: activity.details?.unitRequested,
          notes: activity.details?.notes,
          chatSummary: activity.details?.chatSummary,
          emailCollected: activity.details?.emailCollected,
          phoneCollected: activity.details?.phoneCollected,
        },
        createdBy: activity.created_by || 'system',
      };
    } catch (error) {
      console.error('❌ Error mapping activity:', error, activity);
      return {
        id: `error-${Math.random().toString(36).substring(2, 9)}`,
        leadId: conversation.id,
        type: 'chat_initiated',
        timestamp: new Date(),
        details: { chatSummary: 'Error mapping activity' },
        createdBy: 'system',
      };
    }
  });

  // Create Amplitude data or use defaults
  const amplitudeData = conversation.metadata?.amplitude || {
    chatSessionStarted: true,
    userMessagesSent: 0,
    botMessagesReceived: 0,
    contactCaptured: !!(conversation.user?.email || conversation.user?.phone),
    contactMethod: conversation.user?.email
      ? 'email'
      : conversation.user?.phone
        ? 'phone'
        : undefined,
    tourBooked: conversation.is_book_tour || false,
    sessionDuration: 0,
    engagementScore: 'C',
    qualified: conversation.is_qualified || false,
  };

  const mappedLead: Lead = {
    id: conversation.id || `lead-${Math.random().toString(36).substring(2, 9)}`,
    name: conversation.user
      ? `${conversation.user.first_name || ''} ${conversation.user.last_name || ''}`.trim() ||
        'Anonymous User'
      : 'Anonymous User',
    email: conversation.user?.email,
    phone: conversation.user?.phone,
    currentStage: stageMap[conversation.status] || 'chat_initiated',
    source: conversation.source || 'chat',
    createdAt: new Date(conversation.created_at || Date.now()),
    lastActivity: new Date(conversation.updated_at || Date.now()),
    assignedAgent: conversation.property_manager_name,
    assignedAgentId: conversation.property_manager_id,
    unitInterest: conversation.apartment_size_preference,
    timeline: mappedActivities,
    notes: conversation.ai_intent_summary,
    amplitudeData,
  };

  return mappedLead;
}
