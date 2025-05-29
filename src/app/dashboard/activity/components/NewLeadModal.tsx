'use client';

import { useState } from 'react';
import { useLeadContext } from '@/lib/lead-context';
import { Lead, dummyAgents } from '@/lib/dummy-data';
import { X } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewLeadModal({ isOpen, onClose }: NewLeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<Lead['source']>('manual');
  const [unitInterest, setUnitInterest] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('');

  const { createNewLead, updateLead, addActivity, setSelectedLead } = useLeadContext();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    // Create the new lead
    const newLead = createNewLead(name.trim(), source);

    // Update with additional information
    const updates: Partial<Lead> = {};
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (unitInterest) updates.unitInterest = unitInterest;
    if (assignedAgentId) {
      const agent = dummyAgents.find(a => a.id === assignedAgentId);
      updates.assignedAgent = agent?.name;
      updates.assignedAgentId = assignedAgentId;
    }

    if (Object.keys(updates).length > 0) {
      updateLead(newLead.id, updates);
    }

    // Add info collection activity if email or phone provided
    if (email || phone) {
      addActivity(newLead.id, {
        type: 'info_collected',
        timestamp: new Date(),
        details: {
          emailCollected: email || undefined,
          phoneCollected: phone || undefined
        },
        createdBy: 'agent'
      });

      // Update stage to info_collected
      updateLead(newLead.id, { currentStage: 'info_collected' });
    }

    // Add agent assignment activity if agent selected
    if (assignedAgentId) {
      const agent = dummyAgents.find(a => a.id === assignedAgentId);
      if (agent) {
        addActivity(newLead.id, {
          type: 'agent_assigned',
          timestamp: new Date(),
          details: {
            agentName: agent.name,
            agentId: assignedAgentId
          },
          createdBy: 'system'
        });
      }
    }

    // Select the new lead to show its timeline
    setSelectedLead(newLead);

    // Reset form and close modal
    setName('');
    setEmail('');
    setPhone('');
    setSource('manual');
    setUnitInterest('');
    setAssignedAgentId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              placeholder="Enter lead name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value as Lead['source'])}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="manual">Manual Entry</option>
              <option value="chat">Chat Interface</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Interest</label>
            <input
              type="text"
              value={unitInterest}
              onChange={e => setUnitInterest(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 1BR, 2BR, Studio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agent</label>
            <select
              value={assignedAgentId}
              onChange={e => setAssignedAgentId(e.target.value)}
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
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 