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

export interface DummyTour {
  id: string;
  title: string;
  start: Date;
  end: Date;
  prospectName: string; // Or prospectId linked to DummyProspect
  prospectId?: string;
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
}

export const dummyAgents: DummyAgent[] = [
  { id: 'agent1', name: 'Sarah Miller' },
  { id: 'agent2', name: 'Tom Lee' },
];

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
  },
  {
    id: 'task2',
    question: 'Are there any covered parking options, and what is the additional cost?',
    answer: 'Yes, covered parking is available for $50/month per spot.',
    status: 'answered',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
  {
    id: 'task3',
    question: 'What are the operating hours for the community pool and gym?',
    answer: 'The pool and gym are open daily from 6 AM to 10 PM.',
    status: 'resolved',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
]; 