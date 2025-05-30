'use client'; // Adding 'use client' if any date operations are complex, though for simple new Date() it's not strictly needed but good practice for lib files used in client components.

export interface DummyAgent {
  id: string;
  name: string;
}

export interface DummyProspect {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'prospect' | 'toured' | 'leased';
  // toursCount?: number; // For contacts page if needed
}

// New comprehensive Lead interface for the funnel system
export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  currentStage: 'chat_initiated' | 'info_collected' | 'tour_scheduled' | 'tour_completed' | 'handed_off';
  source: 'chat' | 'manual' | 'referral';
  createdAt: Date;
  lastActivity: Date;
  assignedAgent?: string;
  assignedAgentId?: string;
  unitInterest?: string;
  timeline: LeadActivity[];
  notes?: string;
  // 18 Amplitude Analytics Variables
  amplitudeData?: {
    // Core Engagement Metrics
    chatSessionStarted?: boolean;
    userMessagesSent?: number;
    botMessagesReceived?: number;
    answerButtonClicks?: number;
    
    // Contact & Tour Metrics
    contactCaptured?: boolean;
    contactMethod?: 'email' | 'phone';
    tourBooked?: boolean;
    tourType?: 'in_person' | 'self_guided' | 'video';
    
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
    sessionDuration?: number; // in minutes
    engagementScore?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    qualified?: boolean;
    preLease?: boolean;
    tourIntent?: boolean;
    engaged?: boolean;
    signed?: boolean;
  };
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'chat_initiated' | 'info_collected' | 'tour_scheduled' | 'tour_completed' | 'agent_assigned' | 'note_added' | 'handed_off';
  timestamp: Date;
  details: {
    agentName?: string;
    agentId?: string;
    tourDate?: Date;
    unitRequested?: string;
    notes?: string;
    chatSummary?: string;
    emailCollected?: string;
    phoneCollected?: string;
  };
  createdBy: 'system' | 'agent' | 'ai';
}

export interface DummyTour {
  id: string;
  title: string;
  start: Date;
  end: Date;
  prospectName: string; // Or prospectId linked to DummyProspect
  prospectId?: string;
  leadId?: string; // Link to new Lead system
  unit: string;
  agent?: string; // Or agentId linked to DummyAgent
  agentId?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  source: 'chat' | 'resman' | 'manual';
}

export interface DummyTask {
  id: string;
  question: string;
  answer: string;
  status: 'pending' | 'answered' | 'resolved';
  createdAt: Date;
  leadId?: string; // Link tasks to specific leads
  assignedTo?: string; // Agent ID
}

export const dummyAgents: DummyAgent[] = [
  { id: 'agent1', name: 'Sarah Miller' },
  { id: 'agent2', name: 'Tom Lee' },
];

// New comprehensive leads data for the funnel system
export const leads: Lead[] = [
  {
    id: 'lead1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '(555) 111-2222',
    currentStage: 'tour_scheduled',
    source: 'chat',
    createdAt: new Date(2024, 2, 25, 9, 30),
    lastActivity: new Date(2024, 2, 25, 10, 15),
    assignedAgent: 'Sarah Miller',
    assignedAgentId: 'agent1',
    unitInterest: '1BR - Unit A101',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 8,
      botMessagesReceived: 12,
      answerButtonClicks: 5,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'email',
      tourBooked: true,
      tourType: 'in_person',
      
      // CTA Interactions
      emailOfficeClicked: 2,
      phoneCallClicked: 1,
      
      // Incentive Tracking
      incentiveOffered: true,
      incentiveAccepted: false,
      incentiveExpired: true,
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: false,
      conversationAbandoned: false,
      widgetSessionEnded: true,
      widgetMinimized: 3,
      
      // Calculated Metrics
      sessionDuration: 73, // 1m 12s in seconds converted to 1.2 minutes
      engagementScore: 'A+',
      qualified: false,
      preLease: false,
      tourIntent: true,
      engaged: true,
      signed: false,
    },
    timeline: [
      {
        id: 'activity1',
        leadId: 'lead1',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 25, 9, 30),
        details: {
          chatSummary: 'Prospect interested in 1BR units, budget around $1,500/month'
        },
        createdBy: 'system'
      },
      {
        id: 'activity2',
        leadId: 'lead1',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 25, 9, 45),
        details: {
          emailCollected: 'alex.johnson@example.com',
          phoneCollected: '(555) 111-2222'
        },
        createdBy: 'ai'
      },
      {
        id: 'activity3',
        leadId: 'lead1',
        type: 'agent_assigned',
        timestamp: new Date(2024, 2, 25, 10, 0),
        details: {
          agentName: 'Sarah Miller',
          agentId: 'agent1'
        },
        createdBy: 'system'
      },
      {
        id: 'activity4',
        leadId: 'lead1',
        type: 'tour_scheduled',
        timestamp: new Date(2024, 2, 25, 10, 15),
        details: {
          tourDate: new Date(2024, 2, 28, 14, 0),
          unitRequested: '1BR - Unit A101'
        },
        createdBy: 'agent'
      }
    ]
  },
  {
    id: 'lead2',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '(555) 333-4444',
    currentStage: 'handed_off',
    source: 'chat',
    createdAt: new Date(2024, 2, 24, 14, 20),
    lastActivity: new Date(2024, 2, 26, 16, 30),
    assignedAgent: 'Tom Lee',
    assignedAgentId: 'agent2',
    unitInterest: '2BR - Unit B205',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 15,
      botMessagesReceived: 18,
      answerButtonClicks: 8,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'phone',
      tourBooked: true,
      tourType: 'in_person',
      
      // CTA Interactions
      emailOfficeClicked: 1,
      phoneCallClicked: 3,
      
      // Incentive Tracking
      incentiveOffered: true,
      incentiveAccepted: true,
      incentiveExpired: false,
      
      // Advanced Session Management
      adminHandoffTriggered: true,
      customerServiceEscalated: false,
      conversationAbandoned: false,
      widgetSessionEnded: true,
      widgetMinimized: 1,
      
      // Calculated Metrics
      sessionDuration: 235, // ~4 minutes
      engagementScore: 'A',
      qualified: true,
      preLease: true,
      tourIntent: true,
      engaged: true,
      signed: true,
    },
    timeline: [
      {
        id: 'activity5',
        leadId: 'lead2',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 24, 14, 20),
        details: {
          chatSummary: 'Looking for 2BR unit, has pets (1 cat)'
        },
        createdBy: 'system'
      },
      {
        id: 'activity6',
        leadId: 'lead2',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 24, 14, 35),
        details: {
          emailCollected: 'maria.garcia@example.com',
          phoneCollected: '(555) 333-4444'
        },
        createdBy: 'ai'
      },
      {
        id: 'activity7',
        leadId: 'lead2',
        type: 'tour_scheduled',
        timestamp: new Date(2024, 2, 24, 15, 0),
        details: {
          tourDate: new Date(2024, 2, 26, 11, 0),
          unitRequested: '2BR - Unit B205'
        },
        createdBy: 'agent'
      },
      {
        id: 'activity8',
        leadId: 'lead2',
        type: 'tour_completed',
        timestamp: new Date(2024, 2, 26, 12, 0),
        details: {
          notes: 'Very interested, asked about move-in timeline'
        },
        createdBy: 'agent'
      },
      {
        id: 'activity9',
        leadId: 'lead2',
        type: 'handed_off',
        timestamp: new Date(2024, 2, 26, 16, 30),
        details: {
          notes: 'Qualified lead handed off to Resman for leasing process'
        },
        createdBy: 'agent'
      }
    ]
  },
  {
    id: 'lead3',
    name: 'David Kim',
    email: 'david.kim@example.com',
    currentStage: 'info_collected',
    source: 'chat',
    createdAt: new Date(2024, 2, 26, 10, 0),
    lastActivity: new Date(2024, 2, 26, 10, 30),
    unitInterest: 'Studio',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 3,
      botMessagesReceived: 4,
      answerButtonClicks: 2,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'email',
      tourBooked: false,
      
      // CTA Interactions
      emailOfficeClicked: 0,
      phoneCallClicked: 0,
      
      // Incentive Tracking
      incentiveOffered: false,
      incentiveAccepted: false,
      incentiveExpired: false,
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: false,
      conversationAbandoned: true,
      widgetSessionEnded: true,
      
      // Calculated Metrics
      sessionDuration: 30, // 30 seconds
      engagementScore: 'C+',
      qualified: false,
      preLease: false,
      tourIntent: false,
      engaged: false,
      signed: false,
    },
    timeline: [
      {
        id: 'activity10',
        leadId: 'lead3',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 26, 10, 0),
        details: {
          chatSummary: 'Student looking for affordable studio apartment'
        },
        createdBy: 'system'
      },
      {
        id: 'activity11',
        leadId: 'lead3',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 26, 10, 30),
        details: {
          emailCollected: 'david.kim@example.com'
        },
        createdBy: 'ai'
      }
    ]
  },
  {
    id: 'lead4',
    name: 'Anonymous User',
    currentStage: 'chat_initiated',
    source: 'chat',
    createdAt: new Date(2024, 2, 26, 15, 45),
    lastActivity: new Date(2024, 2, 26, 15, 45),
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 1,
      botMessagesReceived: 2,
      answerButtonClicks: 0,
      
      // Contact & Tour Metrics  
      contactCaptured: false,
      // contactMethod intentionally undefined since contact not captured
      tourBooked: false,
      // tourType intentionally undefined since no tour booked
      
      // CTA Interactions
      emailOfficeClicked: 0,
      phoneCallClicked: 0,
      // widgetMinimized intentionally undefined to show N/A
      
      // Incentive Tracking
      // All incentive fields intentionally undefined to show N/A
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: false,
      conversationAbandoned: true,
      widgetSessionEnded: false,
      
      // Calculated Metrics
      sessionDuration: 15, // 15 seconds
      engagementScore: 'D',
      qualified: false,
      preLease: false,
      tourIntent: false,
      engaged: false,
      signed: false,
    },
    timeline: [
      {
        id: 'activity12',
        leadId: 'lead4',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 26, 15, 45),
        details: {
          chatSummary: 'Just started asking about pricing'
        },
        createdBy: 'system'
      }
    ]
  },
  {
    id: 'lead5',
    name: 'Ben Carter',
    email: 'ben.carter@example.com',
    phone: '(555) 999-0000',
    currentStage: 'tour_completed',
    source: 'chat',
    createdAt: new Date(2024, 2, 23, 11, 15),
    lastActivity: new Date(2024, 2, 25, 17, 0),
    assignedAgent: 'Tom Lee',
    assignedAgentId: 'agent2',
    unitInterest: '2BR - Unit C102',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 12,
      botMessagesReceived: 14,
      answerButtonClicks: 6,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'phone',
      tourBooked: true,
      tourType: 'in_person',
      
      // CTA Interactions
      emailOfficeClicked: 1,
      phoneCallClicked: 2,
      
      // Incentive Tracking
      incentiveOffered: true,
      incentiveAccepted: false,
      incentiveExpired: true,
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: true,
      conversationAbandoned: false,
      widgetSessionEnded: true,
      widgetMinimized: 2,
      
      // Calculated Metrics
      sessionDuration: 145, // ~2.5 minutes
      engagementScore: 'B+',
      qualified: true,
      preLease: false,
      tourIntent: true,
      engaged: true,
      signed: false,
    },
    timeline: [
      {
        id: 'activity13',
        leadId: 'lead5',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 23, 11, 15),
        details: {
          chatSummary: 'Young professional relocating for work'
        },
        createdBy: 'system'
      },
      {
        id: 'activity14',
        leadId: 'lead5',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 23, 11, 30),
        details: {
          emailCollected: 'ben.carter@example.com',
          phoneCollected: '(555) 999-0000'
        },
        createdBy: 'ai'
      },
      {
        id: 'activity15',
        leadId: 'lead5',
        type: 'tour_scheduled',
        timestamp: new Date(2024, 2, 23, 12, 0),
        details: {
          tourDate: new Date(2024, 2, 25, 16, 0),
          unitRequested: '2BR - Unit C102'
        },
        createdBy: 'agent'
      },
      {
        id: 'activity16',
        leadId: 'lead5',
        type: 'tour_completed',
        timestamp: new Date(2024, 2, 25, 17, 0),
        details: {
          notes: 'Completed tour, seemed hesitant about price point'
        },
        createdBy: 'agent'
      }
    ]
  },
  {
    id: 'lead6',
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    phone: '(555) 444-7777',
    currentStage: 'tour_scheduled',
    source: 'chat',
    createdAt: new Date(2024, 2, 26, 8, 15),
    lastActivity: new Date(2024, 2, 26, 14, 30),
    assignedAgent: 'Sarah Miller',
    assignedAgentId: 'agent1',
    unitInterest: '2BR - Unit B301',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 22,
      botMessagesReceived: 25,
      answerButtonClicks: 12,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'email',
      tourBooked: true,
      tourType: 'video',
      
      // CTA Interactions
      emailOfficeClicked: 3,
      phoneCallClicked: 1,
      
      // Incentive Tracking
      incentiveOffered: true,
      incentiveAccepted: true,
      incentiveExpired: false,
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: false,
      conversationAbandoned: false,
      widgetSessionEnded: true,
      widgetMinimized: 4,
      
      // Calculated Metrics
      sessionDuration: 420, // 7 minutes
      engagementScore: 'A+',
      qualified: true,
      preLease: true,
      tourIntent: true,
      engaged: true,
      signed: false,
    },
    timeline: [
      {
        id: 'activity17',
        leadId: 'lead6',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 26, 8, 15),
        details: {
          chatSummary: 'Looking for 2BR apartment, prefers top floor with good natural light'
        },
        createdBy: 'system'
      },
      {
        id: 'activity18',
        leadId: 'lead6',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 26, 8, 30),
        details: {
          emailCollected: 'emma.wilson@example.com',
          phoneCollected: '(555) 444-7777'
        },
        createdBy: 'ai'
      },
      {
        id: 'activity19',
        leadId: 'lead6',
        type: 'agent_assigned',
        timestamp: new Date(2024, 2, 26, 14, 0),
        details: {
          agentName: 'Sarah Miller',
          agentId: 'agent1'
        },
        createdBy: 'system'
      },
      {
        id: 'activity20',
        leadId: 'lead6',
        type: 'tour_scheduled',
        timestamp: new Date(2024, 2, 26, 14, 30),
        details: {
          tourDate: new Date(2024, 2, 29, 10, 0),
          unitRequested: '2BR - Unit B301'
        },
        createdBy: 'agent'
      }
    ]
  },
  {
    id: 'lead7',
    name: 'Jessica Chen',
    email: 'jessica.chen@example.com',
    phone: '(555) 222-3333',
    currentStage: 'handed_off',
    source: 'chat',
    createdAt: new Date(2024, 2, 22, 16, 45),
    lastActivity: new Date(2024, 2, 24, 11, 20),
    assignedAgent: 'Sarah Miller',
    assignedAgentId: 'agent1',
    unitInterest: '3BR - Unit C304',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 31,
      botMessagesReceived: 35,
      answerButtonClicks: 15,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'phone',
      tourBooked: true,
      tourType: 'self_guided',
      
      // CTA Interactions
      emailOfficeClicked: 4,
      phoneCallClicked: 7,
      
      // Incentive Tracking
      incentiveOffered: true,
      incentiveAccepted: true,
      incentiveExpired: false,
      
      // Advanced Session Management
      adminHandoffTriggered: true,
      customerServiceEscalated: false,
      conversationAbandoned: false,
      widgetSessionEnded: true,
      widgetMinimized: 2,
      
      // Calculated Metrics
      sessionDuration: 650, // ~11 minutes
      engagementScore: 'A+',
      qualified: true,
      preLease: true,
      tourIntent: true,
      engaged: true,
      signed: true,
    },
    timeline: [
      {
        id: 'activity21',
        leadId: 'lead7',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 22, 16, 45),
        details: {
          chatSummary: 'High-intent prospect looking for luxury 3BR unit'
        },
        createdBy: 'system'
      },
      {
        id: 'activity22',
        leadId: 'lead7',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 22, 17, 0),
        details: {
          emailCollected: 'jessica.chen@example.com',
          phoneCollected: '(555) 222-3333'
        },
        createdBy: 'ai'
      },
      {
        id: 'activity23',
        leadId: 'lead7',
        type: 'tour_completed',
        timestamp: new Date(2024, 2, 23, 14, 30),
        details: {
          notes: 'Extremely interested, ready to sign lease immediately'
        },
        createdBy: 'agent'
      },
      {
        id: 'activity24',
        leadId: 'lead7',
        type: 'handed_off',
        timestamp: new Date(2024, 2, 24, 11, 20),
        details: {
          notes: 'Priority lead - lease signed and approved'
        },
        createdBy: 'agent'
      }
    ]
  },
  {
    id: 'lead8',
    name: 'Mike Thompson',
    currentStage: 'chat_initiated',
    source: 'chat',
    createdAt: new Date(2024, 2, 27, 9, 15),
    lastActivity: new Date(2024, 2, 27, 9, 20),
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 2,
      botMessagesReceived: 3,
      answerButtonClicks: 1,
      
      // Contact & Tour Metrics  
      contactCaptured: false,
      tourBooked: false,
      
      // CTA Interactions
      emailOfficeClicked: 0,
      phoneCallClicked: 1,
      
      // Incentive Tracking
      incentiveOffered: false,
      incentiveAccepted: false,
      incentiveExpired: false,
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: false,
      conversationAbandoned: true,
      widgetSessionEnded: false,
      
      // Calculated Metrics
      sessionDuration: 5, // 5 seconds
      engagementScore: 'F',
      qualified: false,
      preLease: false,
      tourIntent: false,
      engaged: false,
      signed: false,
    },
    timeline: [
      {
        id: 'activity25',
        leadId: 'lead8',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 27, 9, 15),
        details: {
          chatSummary: 'Asked about pricing, left immediately'
        },
        createdBy: 'system'
      }
    ]
  },
  {
    id: 'lead9',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@example.com',
    currentStage: 'info_collected',
    source: 'chat',
    createdAt: new Date(2024, 2, 26, 13, 30),
    lastActivity: new Date(2024, 2, 26, 14, 45),
    unitInterest: '1BR - Unit A205',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 6,
      botMessagesReceived: 8,
      answerButtonClicks: 3,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'email',
      tourBooked: false,
      
      // CTA Interactions
      emailOfficeClicked: 2,
      phoneCallClicked: 0,
      
      // Incentive Tracking
      incentiveOffered: true,
      incentiveAccepted: false,
      incentiveExpired: true,
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: true,
      conversationAbandoned: false,
      widgetSessionEnded: true,
      
      // Calculated Metrics
      sessionDuration: 75, // 1m 15s
      engagementScore: 'B',
      qualified: false,
      preLease: false,
      tourIntent: true,
      engaged: true,
      signed: false,
    },
    timeline: [
      {
        id: 'activity26',
        leadId: 'lead9',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 26, 13, 30),
        details: {
          chatSummary: 'Graduate student interested in 1BR units'
        },
        createdBy: 'system'
      },
      {
        id: 'activity27',
        leadId: 'lead9',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 26, 14, 45),
        details: {
          emailCollected: 'sarah.martinez@example.com'
        },
        createdBy: 'ai'
      }
    ]
  },
  {
    id: 'lead10',
    name: 'Robert Kim',
    phone: '(555) 888-9999',
    currentStage: 'tour_completed',
    source: 'chat',
    createdAt: new Date(2024, 2, 20, 11, 0),
    lastActivity: new Date(2024, 2, 22, 15, 30),
    assignedAgent: 'Tom Lee',
    assignedAgentId: 'agent2',
    unitInterest: '2BR - Unit B102',
    amplitudeData: {
      // Core Engagement Metrics
      chatSessionStarted: true,
      userMessagesSent: 18,
      botMessagesReceived: 21,
      answerButtonClicks: 9,
      
      // Contact & Tour Metrics  
      contactCaptured: true,
      contactMethod: 'phone',
      tourBooked: true,
      tourType: 'in_person',
      
      // CTA Interactions
      phoneCallClicked: 5,
      
      // Incentive Tracking
      incentiveOffered: true,
      incentiveAccepted: false,
      incentiveExpired: true,
      
      // Advanced Session Management
      adminHandoffTriggered: false,
      customerServiceEscalated: false,
      conversationAbandoned: false,
      widgetSessionEnded: true,
      
      // Calculated Metrics
      sessionDuration: 280, // ~4.5 minutes
      engagementScore: 'B+',
      qualified: true,
      preLease: false,
      tourIntent: true,
      engaged: true,
      signed: false,
    },
    timeline: [
      {
        id: 'activity28',
        leadId: 'lead10',
        type: 'chat_initiated',
        timestamp: new Date(2024, 2, 20, 11, 0),
        details: {
          chatSummary: 'Professional interested in 2BR with home office space'
        },
        createdBy: 'system'
      },
      {
        id: 'activity29',
        leadId: 'lead10',
        type: 'info_collected',
        timestamp: new Date(2024, 2, 20, 11, 30),
        details: {
          phoneCollected: '(555) 888-9999'
        },
        createdBy: 'ai'
      },
      {
        id: 'activity30',
        leadId: 'lead10',
        type: 'tour_completed',
        timestamp: new Date(2024, 2, 22, 15, 30),
        details: {
          notes: 'Liked the unit but wants to think about it over the weekend'
        },
        createdBy: 'agent'
      }
    ]
  }
];

// Keep existing data for backward compatibility
export const dummyProspects: DummyProspect[] = [
  {
    id: 'prospect1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '(555) 111-2222',
    status: 'toured',
  },
  {
    id: 'prospect2',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '(555) 333-4444',
    status: 'leased',
  },
  {
    id: 'prospect3',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '(555) 555-6666',
    status: 'toured',
  },
  {
    id: 'prospect4',
    name: 'Chloe Dubois',
    email: 'chloe.dubois@example.com',
    phone: '(555) 777-8888',
    status: 'prospect',
  },
    {
    id: 'prospect5',
    name: 'Ben Carter',
    email: 'ben.carter@example.com',
    phone: '(555) 999-0000',
    status: 'toured',
  },
];

export const dummyTours: DummyTour[] = [
  {
    id: 'tour1',
    title: 'Tour - 1BR Unit A101',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 11, 0),
    prospectName: 'Alex Johnson',
    prospectId: 'prospect1',
    leadId: 'lead1',
    unit: '1BR - Unit A101',
    agent: 'Sarah Miller',
    agentId: 'agent1',
    status: 'scheduled',
    source: 'chat',
  },
  {
    id: 'tour2',
    title: 'Tour - 2BR Unit B205',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 14, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 15, 0),
    prospectName: 'Maria Garcia',
    prospectId: 'prospect2',
    leadId: 'lead2',
    unit: '2BR - Unit B205',
    agent: 'Tom Lee',
    agentId: 'agent2',
    status: 'completed',
    source: 'resman',
  },
  {
    id: 'tour3',
    title: 'Tour - Studio S30',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 11, 30),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 12, 0),
    prospectName: 'David Kim',
    prospectId: 'prospect3',
    leadId: 'lead3',
    unit: 'Studio - Unit S30',
    agent: 'Sarah Miller',
    agentId: 'agent1',
    status: 'cancelled',
    source: 'manual',
  },
    {
    id: 'tour4',
    title: 'Tour - 2BR Unit C102',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 16, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 17, 0),
    prospectName: 'Ben Carter',
    prospectId: 'prospect5',
    leadId: 'lead5',
    unit: '2BR - Unit C102',
    agent: 'Tom Lee',
    agentId: 'agent2',
    status: 'scheduled',
    source: 'chat',
  },
];

export const dummyTasks: DummyTask[] = [
  {
    id: 'task1',
    question: 'What is the detailed pet policy, including fees and breed restrictions?',
    answer: '',
    status: 'pending',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    leadId: 'lead2',
    assignedTo: 'agent2'
  },
  {
    id: 'task2',
    question: 'Are there any covered parking options, and what is the additional cost?',
    answer: 'Yes, covered parking is available for $50/month per spot.',
    status: 'answered',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    leadId: 'lead1',
    assignedTo: 'agent1'
  },
  {
    id: 'task3',
    question: 'What are the operating hours for the community pool and gym?',
    answer: 'The pool and gym are open daily from 6 AM to 10 PM.',
    status: 'resolved',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    leadId: 'lead5',
    assignedTo: 'agent2'
  },
]; 