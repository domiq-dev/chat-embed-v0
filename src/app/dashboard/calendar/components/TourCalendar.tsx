'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { EventClickArg, ViewMountArg, DateSelectArg } from '@fullcalendar/core';
import { X, Calendar as CalendarIcon, User2, Building2, Clock } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  start: Date;
  end: Date;
  prospectName: string;
  unit: string;
  agent?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  source: 'chat' | 'resman' | 'manual';
  leadId?: string;
}

interface TourCalendarProps {
  tours: Tour[];
  onTourClick: (tour: Tour) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  selectedTour: Tour | null;
  onCancelTour: (tourId: string) => void;
  onCompleteTour: (tourId: string) => void;
  onDeleteTour: (tourId: string) => void;
}

export default function TourCalendar({ 
  tours, 
  onTourClick, 
  onSelectSlot, 
  selectedTour,
  onCancelTour,
  onCompleteTour,
  onDeleteTour
}: TourCalendarProps) {
  const [view, setView] = useState<'timeGridWeek' | 'timeGridDay'>('timeGridWeek');

  // Convert tours to FullCalendar event format
  const events = tours.map(tour => ({
    id: tour.id,
    title: tour.title,
    start: tour.start,
    end: tour.end,
    backgroundColor: tour.status === 'scheduled' ? '#7c3aed' : // Purple
                    tour.status === 'completed' ? '#16a34a' : // Green
                    tour.status === 'cancelled' ? '#dc2626' : // Red
                    '#6b7280', // Gray for no_show
    opacity: tour.status === 'cancelled' || tour.status === 'no_show' ? 0.7 : 1,
    extendedProps: tour
  }));

  return (
    <div className="flex gap-6">
      {/* Calendar */}
      <div className="flex-1">
        <div className="h-[700px] bg-white rounded-lg border border-gray-200 p-4">
          <style jsx global>{`
            .fc {
              height: 100%;
              --fc-border-color: #e5e7eb;
              --fc-page-bg-color: white;
              --fc-neutral-bg-color: #f9fafb;
              --fc-today-bg-color: #f5f3ff;
              --fc-highlight-color: #f5f3ff;
            }

            .fc .fc-timegrid-slot {
              height: 60px;
            }

            .fc .fc-toolbar-title {
              font-size: 1.25rem;
              font-weight: 600;
            }

            .fc .fc-button {
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              border-radius: 0.5rem;
              font-weight: 500;
            }

            .fc .fc-button-primary {
              background-color: #7c3aed;
              border-color: #7c3aed;
            }

            .fc .fc-button-primary:hover {
              background-color: #6d28d9;
              border-color: #6d28d9;
            }

            .fc .fc-button-primary:not(:disabled).fc-button-active,
            .fc .fc-button-primary:not(:disabled):active {
              background-color: #6d28d9;
              border-color: #6d28d9;
            }

            .fc .fc-timegrid-col-events {
              margin: 0 5px;
            }

            .fc-event {
              border: none;
              border-radius: 4px;
              padding: 2px 4px;
            }

            .fc-event-title {
              font-weight: 500;
              padding: 2px;
            }

            .fc-scrollgrid {
              border-radius: 6px;
            }

            .fc-theme-standard td, 
            .fc-theme-standard th {
              border-color: var(--fc-border-color);
            }
          `}</style>

          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
            initialView={view}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            events={events}
            eventClick={(info: EventClickArg) => {
              onTourClick(info.event.extendedProps as Tour);
            }}
            selectable={true}
            select={(info: DateSelectArg) => {
              // Only allow if user dragged for at least 30 minutes
              if ((info.end.getTime() - info.start.getTime()) > (30 * 60 * 1000)) {
                onSelectSlot({
                  start: info.start,
                  end: info.end
                });
              }
            }}
            selectAllow={(selectInfo) => {
              // Only allow selection if duration is at least 30 minutes
              return (selectInfo.end.getTime() - selectInfo.start.getTime()) > (30 * 60 * 1000);
            }}
            slotDuration="00:30:00"
            allDaySlot={false}
            nowIndicator={true}
            editable={false}
            dayMaxEvents={true}
            expandRows={true}
            stickyHeaderDates={true}
            viewDidMount={(info: ViewMountArg) => setView(info.view.type as 'timeGridWeek' | 'timeGridDay')}
          />
        </div>
      </div>

      {/* Tour Details Sidebar */}
      {selectedTour && (
        <div className="w-80 bg-white rounded-lg border border-gray-200 p-4 h-[700px]">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-semibold">Tour Details</h2>
            <button
              onClick={() => onTourClick(selectedTour)}
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

              {selectedTour.agent && (
                <div className="flex items-start gap-3">
                  <User2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Agent</p>
                    <p className="font-medium">{selectedTour.agent}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex gap-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedTour.status === 'scheduled' ? 'bg-purple-100 text-purple-700' : 
                  selectedTour.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  selectedTour.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedTour.status.charAt(0).toUpperCase() + selectedTour.status.slice(1)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedTour.source === 'chat' ? 'bg-blue-100 text-blue-700' : 
                  selectedTour.source === 'resman' ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedTour.source === 'chat' ? 'AI Chat' : selectedTour.source === 'resman' ? 'ResMan' : 'Manual'}
                </span>
              </div>

              <div className="space-y-2">
                {selectedTour.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => onCompleteTour(selectedTour.id)}
                      className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                    <button 
                      onClick={() => onCancelTour(selectedTour.id)}
                      className="w-full px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Cancel Tour
                    </button>
                  </>
                )}
                <button 
                  onClick={() => onDeleteTour(selectedTour.id)}
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
  );
} 