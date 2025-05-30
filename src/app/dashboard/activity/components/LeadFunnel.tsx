'use client';

import { useState } from 'react';
import { useLeadContext } from '@/lib/lead-context';
import { Lead } from '@/lib/dummy-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle } from 'lucide-react';
import LeadSummaryModal from './LeadSummaryModal';

interface FunnelStageProps {
  stage: Lead['currentStage'];
  title: string;
  color: string;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  selectedLead: Lead | null;
}

function FunnelStage({ stage, title, color, leads, onLeadClick, onDeleteLead, selectedLead }: FunnelStageProps) {
  return (
    <div className="flex-1">
      <div className={`${color} rounded-lg p-4 mb-4`}>
        <h3 className="font-semibold text-white text-center">{title}</h3>
        <div className="text-center text-white text-2xl font-bold mt-2">
          {leads.length}
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
              selectedLead?.id === lead.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-200'
            }`}
            onClick={() => onLeadClick(lead)}
          >
            <div className="font-medium text-sm">{lead.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {lead.unitInterest && (
                <span className="mr-2">{lead.unitInterest}</span>
              )}
              <span>
                {new Date(lead.lastActivity).toLocaleDateString()}
              </span>
            </div>
            {lead.assignedAgent && (
              <Badge variant="secondary" className="text-xs mt-1">
                {lead.assignedAgent}
              </Badge>
            )}
            {/* Amplitude Score Badge */}
            {lead.amplitudeData?.engagementScore && (
              <Badge variant="outline" className="text-xs mt-1 ml-2">
                {lead.amplitudeData.engagementScore}
              </Badge>
            )}
            <div className="flex justify-end mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLead(lead);
                }}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Delete lead"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        
        {leads.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  );
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmationModal({ isOpen, lead, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Delete Lead</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be undone and will remove all associated activities and timeline data.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadFunnel() {
  const { leads, selectedLead, setSelectedLead, getLeadsByStage, deleteLead } = useLeadContext();
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [summaryModalLead, setSummaryModalLead] = useState<Lead | null>(null);

  const stages = [
    {
      stage: 'chat_initiated' as const,
      title: 'Chat Started',
      color: 'bg-blue-500',
      leads: getLeadsByStage('chat_initiated')
    },
    {
      stage: 'info_collected' as const,
      title: 'Info Collected',
      color: 'bg-indigo-500',
      leads: getLeadsByStage('info_collected')
    },
    {
      stage: 'tour_scheduled' as const,
      title: 'Tour Scheduled',
      color: 'bg-purple-500',
      leads: getLeadsByStage('tour_scheduled')
    },
    {
      stage: 'tour_completed' as const,
      title: 'Tour Completed',
      color: 'bg-green-500',
      leads: getLeadsByStage('tour_completed')
    },
    {
      stage: 'handed_off' as const,
      title: 'Handed Off',
      color: 'bg-gray-500',
      leads: getLeadsByStage('handed_off')
    }
  ];

  const handleLeadClick = (lead: Lead) => {
    setSummaryModalLead(lead);
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  const cancelDelete = () => {
    setLeadToDelete(null);
  };

  const totalLeads = leads.length;
  const conversionRates = stages.map((stage, index) => {
    if (index === 0) return 100;
    const previousTotal = stages.slice(0, index + 1).reduce((sum, s) => sum + s.leads.length, 0);
    return totalLeads > 0 ? Math.round((previousTotal / totalLeads) * 100) : 0;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Lead Activity Funnel
            <Badge variant="outline" className="text-sm">
              {totalLeads} Total Leads
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stages.map((stage, index) => (
              <FunnelStage
                key={stage.stage}
                stage={stage.stage}
                title={stage.title}
                color={stage.color}
                leads={stage.leads}
                onLeadClick={handleLeadClick}
                onDeleteLead={handleDeleteLead}
                selectedLead={summaryModalLead}
              />
            ))}
          </div>
          
          {/* Conversion rates */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            {conversionRates.map((rate, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500">Conversion</div>
                <div className="text-lg font-semibold text-purple-600">{rate}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lead Summary Modal */}
      <LeadSummaryModal
        isOpen={!!summaryModalLead}
        lead={summaryModalLead}
        onClose={() => setSummaryModalLead(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!leadToDelete}
        lead={leadToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
} 