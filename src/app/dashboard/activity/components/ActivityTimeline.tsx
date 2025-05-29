'use client';

import { useState } from 'react';

export interface TimelineEvent {
  id: string;
  type: 'chat_started' | 'tour_scheduled' | 'agent_handoff' | 'tour_completed' | 'follow_up' | 'application_sent';
  timestamp: Date;
  status: 'completed' | 'pending' | 'in_progress';
  details: {
    agentName?: string;
    tourDate?: Date;
    notes?: string;
    chatSummary?: string;
    followUpType?: 'ai' | 'agent';
  };
}

export default function ActivityTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // This will be replaced with real data from your chat system
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'chat_started',
      timestamp: new Date('2024-03-28T10:00:00'),
      status: 'completed',
      details: {
        chatSummary: 'Initial contact through AI chat. Prospect interested in 2BR units.'
      }
    },
    {
      id: '2',
      type: 'tour_scheduled',
      timestamp: new Date('2024-03-28T10:15:00'),
      status: 'completed',
      details: {
        tourDate: new Date('2024-03-30T14:00:00'),
        notes: 'Scheduled tour for 2PM on Saturday'
      }
    },
    {
      id: '3',
      type: 'agent_handoff',
      timestamp: new Date('2024-03-28T10:20:00'),
      status: 'in_progress',
      details: {
        agentName: 'Sarah Miller'
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lead Activity Timeline</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Filter
          </button>
          <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Export
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline events */}
        <div className="space-y-6">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className={`relative pl-10 cursor-pointer transition-all ${
                selectedEvent === event.id ? 'scale-102' : ''
              }`}
              onClick={() => setSelectedEvent(event.id)}
            >
              {/* Status dot */}
              <div className={`absolute left-[14px] w-2.5 h-2.5 rounded-full ${
                event.status === 'completed' ? 'bg-green-500' :
                event.status === 'in_progress' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />

              <div className={`p-4 rounded-lg border ${
                selectedEvent === event.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{formatEventType(event.type)}</h3>
                  <span className="text-sm text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  {event.details.chatSummary && (
                    <p>{event.details.chatSummary}</p>
                  )}
                  {event.details.tourDate && (
                    <p>Tour scheduled for: {event.details.tourDate.toLocaleString()}</p>
                  )}
                  {event.details.agentName && (
                    <p>Assigned to: {event.details.agentName}</p>
                  )}
                  {event.details.notes && (
                    <p>{event.details.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatEventType(type: TimelineEvent['type']): string {
  const formats: Record<TimelineEvent['type'], string> = {
    chat_started: 'Chat Initiated',
    tour_scheduled: 'Tour Scheduled',
    agent_handoff: 'Assigned to Agent',
    tour_completed: 'Tour Completed',
    follow_up: 'Follow-up',
    application_sent: 'Application Sent'
  };
  return formats[type];
} 