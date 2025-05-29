'use client';

import { useState, useEffect } from 'react';
import TourCalendar from './components/TourCalendar';
import { X, Calendar as CalendarIcon, User2, Building2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useLeadContext } from '@/lib/lead-context';
import { dummyTours, DummyTour, dummyAgents } from '@/lib/dummy-data';

// Use DummyTour as Tour, or rename DummyTour to Tour in dummy-data.ts
interface Tour extends DummyTour {}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot?: { start: Date; end: Date };
  onSchedule: (tour: Omit<Tour, 'id'>) => void;
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function ScheduleModal({ isOpen, onClose, selectedSlot, onSchedule }: ScheduleModalProps) {
  const { leads } = useLeadContext();
  const [formData, setFormData] = useState<Omit<Tour, 'id' | 'source' | 'prospectId' | 'agentId' | 'leadId'>>({
    title: '',
    prospectName: '',
    unit: '',
    start: new Date(),
    end: new Date(),
    status: 'scheduled',
    agent: ''
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Update form data when selectedSlot changes
  useEffect(() => {
    if (selectedSlot) {
      setFormData(prev => ({
        ...prev,
        start: selectedSlot.start,
        end: selectedSlot.end
      }));
    }
  }, [selectedSlot]);

  // Update prospect name when lead is selected
  useEffect(() => {
    if (selectedLeadId) {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead) {
        setFormData(prev => ({
          ...prev,
          prospectName: lead.name,
          unit: lead.unitInterest || prev.unit
        }));
        if (lead.assignedAgentId) {
          setSelectedAgentId(lead.assignedAgentId);
        }
      }
    }
  }, [selectedLeadId, leads]);

  // Update agent name when agent is selected
  useEffect(() => {
    if (selectedAgentId) {
      const agent = dummyAgents.find(a => a.id === selectedAgentId);
      if (agent) {
        setFormData(prev => ({
          ...prev,
          agent: agent.name
        }));
      }
    }
  }, [selectedAgentId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      ...formData,
      status: 'scheduled',
      source: 'manual',
      leadId: selectedLeadId || undefined,
      agentId: selectedAgentId || undefined,
      prospectId: undefined, // Legacy field
    });
    
    // Reset form
    setFormData({
      title: '',
      prospectName: '',
      unit: '',
      start: new Date(),
      end: new Date(),
      status: 'scheduled',
      agent: ''
    });
    setSelectedLeadId('');
    setSelectedAgentId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule Tour</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Lead (Optional)
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Manual entry (no lead)</option>
              {leads
                .filter(lead => lead.currentStage !== 'handed_off')
                .map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.currentStage.replace('_', ' ')}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Tour - 2BR Unit"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prospect Name
            </label>
            <input
              type="text"
              value={formData.prospectName}
              onChange={(e) => setFormData({ ...formData, prospectName: e.target.value })}
              placeholder="Enter prospect's name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={!!selectedLeadId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., 2BR - Unit 204"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">No agent assigned</option>
              {dummyAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.start)}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    start: newDate,
                    end: prev.end < newDate ? new Date(newDate.getTime() + 60 * 60 * 1000) : prev.end
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.end)}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    start: newDate < prev.start ? new Date(newDate.getTime() - 60 * 60 * 1000) : prev.start,
                    end: newDate
                  }));
                }}
                min={formatDateForInput(formData.start)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Schedule Tour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | undefined>();
  const [tours, setTours] = useState<Tour[]>(dummyTours);
  
  const { leads, updateLead, addActivity, setSelectedLead } = useLeadContext();

  // Calculate stats
  const stats = {
    total: tours.length,
    scheduled: tours.filter(t => t.status === 'scheduled').length,
    completed: tours.filter(t => t.status === 'completed').length,
    cancelled: tours.filter(t => t.status === 'cancelled').length,
  };

  const handleScheduleTour = (tourData: Omit<Tour, 'id'>) => {
    const newTour: Tour = {
      ...tourData,
      id: `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setTours(prev => [...prev, newTour]);

    // If linked to a lead, update the lead's stage and add activity
    if (tourData.leadId) {
      const lead = leads.find(l => l.id === tourData.leadId);
      if (lead && lead.currentStage !== 'tour_scheduled') {
        // Update lead stage to tour_scheduled
        updateLead(tourData.leadId, { currentStage: 'tour_scheduled' });
        
        // Add tour scheduled activity
        addActivity(tourData.leadId, {
          type: 'tour_scheduled',
          timestamp: new Date(),
          details: {
            tourDate: tourData.start,
            unitRequested: tourData.unit,
            agentName: tourData.agent
          },
          createdBy: 'agent'
        });
      }
    }
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsScheduleModalOpen(true);
  };

  const handleCancelTour = (tourId: string) => {
    setTours(prev => 
      prev.map(tour => 
        tour.id === tourId 
          ? { ...tour, status: 'cancelled' as const }
          : tour
      )
    );
  };

  const handleCompleteTour = (tourId: string) => {
    const tour = tours.find(t => t.id === tourId);
    setTours(prev => 
      prev.map(t => 
        t.id === tourId 
          ? { ...t, status: 'completed' as const }
          : t
      )
    );

    // If linked to a lead, update the lead's stage and add activity
    if (tour?.leadId) {
      const lead = leads.find(l => l.id === tour.leadId);
      if (lead) {
        // Update lead stage to tour_completed
        updateLead(tour.leadId, { currentStage: 'tour_completed' });
        
        // Add tour completed activity
        addActivity(tour.leadId, {
          type: 'tour_completed',
          timestamp: new Date(),
          details: {
            notes: 'Tour completed successfully'
          },
          createdBy: 'agent'
        });
      }
    }
  };

  const handleDeleteTour = (tourId: string) => {
    setTours(prev => prev.filter(tour => tour.id !== tourId));
  };

  const handleTourClick = (tour: Tour) => {
    setSelectedTour(tour);
    
    // If tour is linked to a lead, select that lead for cross-tab navigation
    if (tour.leadId) {
      const lead = leads.find(l => l.id === tour.leadId);
      if (lead) {
        setSelectedLead(lead);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Schedule Tour
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CalendarIcon className="w-6 h-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Tours</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <User2 className="w-6 h-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <TourCalendar
        tours={tours}
        onSelectSlot={handleSelectSlot}
        onTourClick={handleTourClick}
        selectedTour={selectedTour}
        onCancelTour={handleCancelTour}
        onCompleteTour={handleCompleteTour}
        onDeleteTour={handleDeleteTour}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedSlot(undefined);
        }}
        selectedSlot={selectedSlot}
        onSchedule={handleScheduleTour}
      />
    </div>
  );
} 