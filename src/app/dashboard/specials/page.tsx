'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Send, Trash2 } from 'lucide-react';
import { dummyProspects, DummyProspect } from '@/lib/dummy-data'; // Import dummy data

interface Campaign {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

// Use DummyProspect as Prospect or rename in dummy-data.ts
interface Prospect extends DummyProspect {}

// Sample campaigns (can be moved to dummy-data.ts if needed later)
const initialCampaigns: Campaign[] = [
  {
    id: 'campaign1',
    title: 'Summer Breeze Special',
    description: 'Get $200 off your first month if you sign a 12-month lease by July 31st!',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    id: 'campaign2',
    title: 'Refer-a-Resident',
    description: 'Current residents: Refer a friend and both of you get a $150 rent credit when they lease!',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
];

function AddCampaignModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (title: string, description: string) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Special/Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (title.trim() && description.trim()) {
              onAdd(title.trim(), description.trim());
              setTitle('');
              setDescription('');
              onClose();
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              required
            />
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
              Add Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampaignBlastModal({ isOpen, onClose, campaign, recipients, onSend }: {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  recipients: Prospect[];
  onSend: (selected: Prospect[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(recipients.map(r => r.id));
  if (!isOpen || !campaign) return null;
  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleSend = () => {
    const selected = recipients.filter(r => selectedIds.includes(r.id));
    onSend(selected);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Send Campaign: {campaign.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Select Recipients:</div>
          <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {recipients.length === 0 ? (
              <li className="py-2 text-gray-500">No eligible prospects.</li>
            ) : (
              recipients.map(r => (
                <li key={r.id} className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggle(r.id)}
                    className="accent-purple-600"
                  />
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <span className="text-gray-600 text-sm">({r.email})</span>
                </li>
              ))
            )}
          </ul>
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
            type="button"
            onClick={handleSend}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={selectedIds.length === 0}
          >
            Send Emails
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpecialsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [prospects] = useState<Prospect[]>(dummyProspects); // Use dummyProspects, no need for setProspects if not modified here
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [blastSent, setBlastSent] = useState<string | null>(null);
  const [openCampaign, setOpenCampaign] = useState<Campaign | null>(null);
  const [lastSentTo, setLastSentTo] = useState<string[]>([]);

  // Only prospects who toured but have not leased
  const eligibleProspects = prospects.filter(p => p.status === 'toured');

  const handleAddCampaign = (title: string, description: string) => {
    setCampaigns(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        createdAt: new Date(),
      },
    ]);
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const handleSendBlast = (recipients: Prospect[]) => {
    setBlastSent(openCampaign?.title || null);
    setLastSentTo(recipients.map(r => r.email));
    setTimeout(() => setBlastSent(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Specials & Campaigns</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>

      {/* Current Specials/Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map(campaign => (
          <Card key={campaign.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{campaign.title}</CardTitle>
                <div className="text-xs text-gray-500 mt-1">Created {campaign.createdAt.toLocaleDateString()}</div>
              </div>
              <button
                onClick={() => handleDeleteCampaign(campaign.id)}
                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                title="Delete Campaign"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-700">{campaign.description}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenCampaign(campaign)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Open Campaign
                </button>
                {blastSent === campaign.title && (
                  <span className="text-green-600 text-sm font-medium">Emails sent to: {lastSentTo.join(', ')}</span>
                )}
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">Eligible Recipients:</div>
                <ul className="list-disc pl-6 text-sm text-gray-700">
                  {eligibleProspects.length === 0 ? (
                    <li>No eligible prospects (all have leased).</li>
                  ) : (
                    eligibleProspects.map(p => (
                      <li key={p.id}>{p.name} ({p.email})</li>
                    ))
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddCampaignModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddCampaign} />
      <CampaignBlastModal
        isOpen={!!openCampaign}
        onClose={() => setOpenCampaign(null)}
        campaign={openCampaign}
        recipients={eligibleProspects}
        onSend={handleSendBlast}
      />
    </div>
  );
} 