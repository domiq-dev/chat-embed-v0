'use client';

import { useState } from 'react';
import LeadFunnel from './components/LeadFunnel';
import IndividualLeadTimeline from './components/IndividualLeadTimeline';
import NewLeadModal from './components/NewLeadModal';
import { dummyAgents, DummyAgent } from '@/lib/dummy-data';

export default function ActivityPage() {
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Activity</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Last 7 Days ▼
          </button>
          <button 
            onClick={() => setIsNewLeadModalOpen(true)}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            New Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Lead Funnel */}
        <LeadFunnel />
        
        {/* Individual Lead Timeline */}
        <IndividualLeadTimeline />
      </div>

      {/* New Lead Modal */}
      <NewLeadModal 
        isOpen={isNewLeadModalOpen} 
        onClose={() => setIsNewLeadModalOpen(false)} 
      />
    </div>
  );
} 