'use client';

import { useState } from 'react';
import LeadOverview from './components/LeadOverview';
import LeadFunnel from './components/LeadFunnel';
import NewLeadModal from './components/NewLeadModal';
import { LeadProvider, useLeadContext } from '@/lib/lead-context';
import { dummyAgents, DummyAgent } from '@/lib/dummy-data';

function ActivityPageContent() {
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const { refreshAmplitudeData, isLoadingAmplitudeData, forceCloseSession } = useLeadContext();

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

      {isLoadingAmplitudeData && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Fetching latest Amplitude analytics data...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Lead Distribution Overview */}
        <LeadOverview />
        
        {/* Lead Funnel */}
        <LeadFunnel />
      </div>

      {/* New Lead Modal */}
      <NewLeadModal 
        isOpen={isNewLeadModalOpen} 
        onClose={() => setIsNewLeadModalOpen(false)} 
      />
    </div>
  );
}

export default function ActivityPage() {
  return (
    <LeadProvider>
      <ActivityPageContent />
    </LeadProvider>
  );
} 