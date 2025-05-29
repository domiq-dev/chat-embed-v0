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