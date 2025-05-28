'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { EventClickArg, ViewMountArg, DateSelectArg } from '@fullcalendar/core';

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
}

interface TourCalendarProps {
  tours: Tour[];
  onSelectTour: (tour: Tour) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
}

export default function TourCalendar({ tours, onSelectTour, onSelectSlot }: TourCalendarProps) {
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
          onSelectTour(info.event.extendedProps as Tour);
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
  );
} 