'use client';

import KnowledgeForm from '../components/KnowledgeForm';

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            View All Entries
          </button>
          <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Save Changes
          </button>
        </div>
      </div>

      <p className="text-gray-600">
        Add additional information or context your AI should know. Pricing and scheduling settings are managed separately.
      </p>

      <KnowledgeForm />
    </div>
  );
}
