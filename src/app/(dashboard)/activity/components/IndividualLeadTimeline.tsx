'use client';

import { useLeadContext } from '@/lib/lead-context';
import { Lead, LeadActivity } from '@/lib/dummy-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  UserPlus,
  FileText,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

function getActivityIcon(type: LeadActivity['type']) {
  switch (type) {
    case 'chat_initiated':
      return <Clock className="w-4 h-4" />;
    case 'info_collected':
      return <User className="w-4 h-4" />;
    case 'agent_assigned':
      return <UserPlus className="w-4 h-4" />;
    case 'tour_scheduled':
      return <Calendar className="w-4 h-4" />;
    case 'tour_completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'note_added':
      return <FileText className="w-4 h-4" />;
    case 'handed_off':
      return <ExternalLink className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getActivityColor(type: LeadActivity['type']) {
  switch (type) {
    case 'chat_initiated':
      return 'bg-blue-500';
    case 'info_collected':
      return 'bg-indigo-500';
    case 'agent_assigned':
      return 'bg-orange-500';
    case 'tour_scheduled':
      return 'bg-purple-500';
    case 'tour_completed':
      return 'bg-green-500';
    case 'note_added':
      return 'bg-gray-500';
    case 'handed_off':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function formatActivityType(type: LeadActivity['type']): string {
  const formats: Record<LeadActivity['type'], string> = {
    chat_initiated: 'Chat Initiated',
    info_collected: 'Information Collected',
    agent_assigned: 'Agent Assigned',
    tour_scheduled: 'Tour Scheduled',
    tour_completed: 'Tour Completed',
    note_added: 'Note Added',
    handed_off: 'Handed Off to Resman',
  };
  return formats[type];
}

function getCurrentStageColor(stage: Lead['currentStage']) {
  switch (stage) {
    case 'chat_initiated':
      return 'bg-blue-100 text-blue-800';
    case 'info_collected':
      return 'bg-indigo-100 text-indigo-800';
    case 'tour_scheduled':
      return 'bg-purple-100 text-purple-800';
    case 'tour_completed':
      return 'bg-green-100 text-green-800';
    case 'handed_off':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  leadName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmationModal({
  isOpen,
  leadName,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Delete Lead</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{leadName}</strong>? This action cannot be undone
          and will remove all associated activities and timeline data.
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

export default function IndividualLeadTimeline() {
  const { selectedLead, setSelectedLead, deleteLead } = useLeadContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!selectedLead) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <User className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lead Selected</h3>
          <p className="text-gray-500">
            Click on a lead in the funnel above to view their detailed timeline and activity
            history.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedTimeline = [...selectedLead.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const handleDeleteLead = () => {
    deleteLead(selectedLead.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLead(null)}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-xl">{selectedLead.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getCurrentStageColor(selectedLead.currentStage)}>
                    {formatActivityType(selectedLead.currentStage)}
                  </Badge>
                  <Badge variant="outline">{selectedLead.source}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Lead Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{selectedLead.email || 'Email not collected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{selectedLead.phone || 'Phone not collected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{selectedLead.assignedAgent || 'No agent assigned'}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {sortedTimeline.map((activity, index) => (
                <div key={activity.id} className="relative pl-10">
                  {/* Activity dot */}
                  <div
                    className={`absolute left-[14px] w-3 h-3 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center`}
                  >
                    <div className="text-white text-xs">{getActivityIcon(activity.type)}</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {formatActivityType(activity.type)}
                      </h4>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      {activity.details.chatSummary && (
                        <p>
                          <strong>Summary:</strong> {activity.details.chatSummary}
                        </p>
                      )}
                      {activity.details.emailCollected && (
                        <p>
                          <strong>Email collected:</strong> {activity.details.emailCollected}
                        </p>
                      )}
                      {activity.details.phoneCollected && (
                        <p>
                          <strong>Phone collected:</strong> {activity.details.phoneCollected}
                        </p>
                      )}
                      {activity.details.agentName && (
                        <p>
                          <strong>Assigned to:</strong> {activity.details.agentName}
                        </p>
                      )}
                      {activity.details.tourDate && (
                        <p>
                          <strong>Tour scheduled:</strong>{' '}
                          {new Date(activity.details.tourDate).toLocaleString()}
                        </p>
                      )}
                      {activity.details.unitRequested && (
                        <p>
                          <strong>Unit requested:</strong> {activity.details.unitRequested}
                        </p>
                      )}
                      {activity.details.notes && (
                        <p>
                          <strong>Notes:</strong> {activity.details.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {activity.createdBy}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Actions */}
          {selectedLead.currentStage !== 'handed_off' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Suggested Next Actions</h4>
              <div className="text-sm text-blue-700">
                {selectedLead.currentStage === 'chat_initiated' && (
                  <p>• Follow up to collect contact information</p>
                )}
                {selectedLead.currentStage === 'info_collected' && (
                  <p>• Schedule a property tour</p>
                )}
                {selectedLead.currentStage === 'tour_scheduled' && (
                  <p>• Prepare for upcoming tour and follow up after completion</p>
                )}
                {selectedLead.currentStage === 'tour_completed' && (
                  <p>• Follow up on interest level and next steps</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        leadName={selectedLead.name}
        onConfirm={handleDeleteLead}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
