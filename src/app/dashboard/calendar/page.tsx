'use client';

import { useState, useEffect } from 'react';
import TourCalendar from './components/TourCalendar';
import { X, Calendar as CalendarIcon, User2, Building2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { dummyTours, DummyTour } from '@/lib/dummy-data'; // Import dummy data

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
  const [formData, setFormData] = useState<Omit<Tour, 'id' | 'source' | 'prospectId' | 'agentId'>>({
    title: '',
    prospectName: '',
    unit: '',
    start: new Date(),
    end: new Date(),
    status: 'scheduled',
    agent: '' // agent is optional in DummyTour, ensure consistency or handle it
  });

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      ...formData,
      status: 'scheduled', // This is already in formData, could be removed here
      source: 'manual', // Add source as it's required by DummyTour
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule Tour</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Agent (Optional)
            </label>
            <input
              type="text"
              value={formData.agent || ''}
              onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
              placeholder="Enter agent's name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
  const [tours, setTours] = useState<Tour[]>(dummyTours); // Use dummyTours

  // Calculate stats
  const stats = {
    total: tours.length,
    scheduled: tours.filter(t => t.status === 'scheduled').length,
    completed: tours.filter(t => t.status === 'completed').length,
    cancelled: tours.filter(t => t.status === 'cancelled').length,
    noShow: tours.filter(t => t.status === 'no_show').length,
    fromChat: tours.filter(t => t.source === 'chat').length,
  };

  const handleScheduleTour = (tourData: Omit<Tour, 'id'>) => {
    const newTour: Tour = {
      ...tourData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTours([...tours, newTour]);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setIsScheduleModalOpen(true);
  };

  const handleCancelTour = (tourId: string) => {
    setTours(tours.map(tour => 
      tour.id === tourId 
        ? { ...tour, status: 'cancelled' }
        : tour
    ));
    setSelectedTour(null);
  };

  const handleCompleteTour = (tourId: string) => {
    setTours(tours.map(tour => 
      tour.id === tourId 
        ? { ...tour, status: 'completed' }
        : tour
    ));
    setSelectedTour(null);
  };

  const handleDeleteTour = (tourId: string) => {
    setTours(tours.filter(tour => tour.id !== tourId));
    setSelectedTour(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tour Calendar</h1>
        <button 
          onClick={() => {
            setSelectedSlot(undefined); // Clear any previously selected slot for general scheduling
            setIsScheduleModalOpen(true);
          }}
          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Schedule Tour
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Tours</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-semibold text-purple-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-semibold text-red-600">{stats.cancelled}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">No Shows</p>
          <p className="text-2xl font-semibold text-gray-600">{stats.noShow}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">From Chat</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.fromChat}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <TourCalendar 
            tours={tours} 
            onSelectTour={setSelectedTour}
            onSelectSlot={handleSelectSlot}
          />
        </div>

        {/* Tour Details Sidebar */}
        {selectedTour && (
          <div className="w-80 bg-white rounded-lg border border-gray-200 p-4 h-[700px]">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold">Tour Details</h2>
              <button
                onClick={() => setSelectedTour(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {selectedTour.start.toLocaleDateString()} at{' '}
                      {selectedTour.start.toLocaleTimeString([], { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Prospect</p>
                    <p className="font-medium">{selectedTour.prospectName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Unit</p>
                    <p className="font-medium">{selectedTour.unit}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${selectedTour.status === 'scheduled' ? 'bg-purple-100 text-purple-700' : selectedTour.status === 'completed' ? 'bg-green-100 text-green-700' : selectedTour.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {selectedTour.status.charAt(0).toUpperCase() + selectedTour.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${selectedTour.source === 'chat' ? 'bg-blue-100 text-blue-700' : selectedTour.source === 'resman' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {selectedTour.source === 'chat' ? 'AI Chat' : selectedTour.source === 'resman' ? 'ResMan' : 'Manual'}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedTour.status === 'scheduled' && (
                    <>
                      <button 
                        onClick={() => handleCompleteTour(selectedTour.id)}
                        className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark as Completed
                      </button>
                      <button 
                        onClick={() => handleCancelTour(selectedTour.id)}
                        className="w-full px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Cancel Tour
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDeleteTour(selectedTour.id)}
                    className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    Delete Tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedSlot(undefined); // Clear slot after modal closes
        }}
        selectedSlot={selectedSlot}
        onSchedule={handleScheduleTour}
      />
    </div>
  );
} 