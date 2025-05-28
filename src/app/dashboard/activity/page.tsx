'use client';

import ActivityTimeline from './components/ActivityTimeline';

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Activity</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Last 7 Days ▼
          </button>
          <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
            New Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main timeline section */}
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>

        {/* Stats/Summary section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">New Leads</div>
                <div className="text-2xl font-semibold">12</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Tours Scheduled</div>
                <div className="text-2xl font-semibold">8</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Agent Handoffs</div>
                <div className="text-2xl font-semibold">15</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Active Agents</h3>
            <div className="space-y-3">
              {['Sarah Johnson', 'Mike Peters', 'Emma Davis'].map((agent) => (
                <div key={agent} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{agent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 