'use client';

import { useState } from 'react';
import LeadOverview from './components/LeadOverview';
import LeadFunnel from './components/LeadFunnel';
import NewLeadModal from './components/NewLeadModal';
import { LeadProvider, useLeadContext } from '@/lib/lead-context';
import { leads as dummyLeads } from '@/lib/dummy-data';

function ActivityPageContent() {
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    refreshAmplitudeData,
    isLoadingAmplitudeData,
    forceCloseSession,
    isLoading,
    refresh,
    leads,
    setLeads,
  } = useLeadContext();

  // Function to force fallback to dummy data for testing
  const forceFallback = () => {
    setLeads(dummyLeads);
  };

  // Enhanced refresh function with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 text-sm text-white rounded-md ${isRefreshing ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={forceFallback}
            className="px-4 py-2 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            Use Dummy Data
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Loading lead data...</span>
          </div>
        </div>
      )}

      {!isLoading && leads.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-800">
              No leads found. Try using the "Use Dummy Data" button for testing.
            </span>
          </div>
        </div>
      )}

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
      <NewLeadModal isOpen={isNewLeadModalOpen} onClose={() => setIsNewLeadModalOpen(false)} />
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
