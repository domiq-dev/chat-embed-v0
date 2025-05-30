'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, MessageSquare, Phone, Mail, Target, TrendingUp, User, Calendar, FileText } from 'lucide-react';
import { Lead } from '@/lib/dummy-data';

interface LeadSummaryModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
}

const LeadSummaryModal: React.FC<LeadSummaryModalProps> = ({ isOpen, lead, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'timeline'>('analytics');

  if (!isOpen || !lead) return null;

  const amplitudeData = lead.amplitudeData;
  
  // Helper function to display boolean values with icons
  const BooleanDisplay = ({ value, label }: { value?: boolean; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <div className="flex items-center gap-1">
        {value === true ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : value === false ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        )}
      </div>
    </div>
  );

  // Helper function to display numeric values
  const NumericDisplay = ({ value, label, unit = '' }: { value?: number; label: string; unit?: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium">
        {value !== undefined ? `${value}${unit}` : 'N/A'}
      </span>
    </div>
  );

  // Helper function to display string values
  const StringDisplay = ({ value, label }: { value?: string; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium capitalize">
        {value || 'N/A'}
      </span>
    </div>
  );

  // Format duration from seconds to readable format
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get engagement score color
  const getScoreColor = (score?: string) => {
    switch (score) {
      case 'A+': return 'text-green-600 bg-green-100';
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-blue-600 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C+': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-orange-600 bg-orange-100';
      case 'D': return 'text-red-600 bg-red-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Generate AI summary based on the data
  const generateAISummary = () => {
    const data = amplitudeData;
    if (!data) return "Inquired about general property information. Status: new lead";

    let summary = "";
    
    // Engagement level
    if (data.userMessagesSent && data.userMessagesSent > 10) {
      summary += "Highly engaged visitor - ";
    } else if (data.userMessagesSent && data.userMessagesSent > 5) {
      summary += "Moderately engaged visitor - ";
    } else {
      summary += "Initial inquiry - ";
    }

    // Contact capture
    if (data.contactCaptured) {
      summary += `provided ${data.contactMethod} contact information. `;
    } else {
      summary += "contact information not captured. ";
    }

    // Tour booking
    if (data.tourBooked) {
      summary += `Scheduled ${data.tourType?.replace('_', '-')} tour. `;
    } else if (data.tourIntent) {
      summary += "Expressed tour interest but not yet scheduled. ";
    }

    // Qualification status
    if (data.qualified && data.preLease) {
      summary += "Status: qualified for pre-lease";
    } else if (data.qualified) {
      summary += "Status: qualified lead";
    } else if (data.tourBooked) {
      summary += "Status: toured";
    } else {
      summary += "Status: prospecting";
    }

    return summary;
  };

  // Get activity type icon and color
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat_initiated':
        return { icon: MessageSquare, color: 'text-blue-500' };
      case 'info_collected':
        return { icon: User, color: 'text-green-500' };
      case 'tour_scheduled':
        return { icon: Calendar, color: 'text-purple-500' };
      case 'tour_completed':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'agent_assigned':
        return { icon: User, color: 'text-indigo-500' };
      case 'note_added':
        return { icon: FileText, color: 'text-gray-500' };
      case 'handed_off':
        return { icon: Target, color: 'text-orange-500' };
      default:
        return { icon: Clock, color: 'text-gray-400' };
    }
  };

  const formatActivityType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{lead.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(amplitudeData?.engagementScore)}`}>
                  Score: {amplitudeData?.engagementScore || 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Questions: {amplitudeData?.userMessagesSent || 0}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4" />
                  Duration: {formatDuration(amplitudeData?.sessionDuration)}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex mt-4 border-b border-white/20">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Analytics Overview
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Activity Timeline
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {activeTab === 'analytics' && (
            <>
              {/* Quick Status Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {amplitudeData?.qualified ? '✅' : '❌'}
                  </div>
                  <div className="text-xs text-gray-500">Qualified</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {amplitudeData?.engaged ? '✅' : '❌'}
                  </div>
                  <div className="text-xs text-gray-500">Engaged</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {amplitudeData?.tourIntent ? '✅' : '❌'}
                  </div>
                  <div className="text-xs text-gray-500">Tour Intent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {amplitudeData?.signed ? '✅' : '❌'}
                  </div>
                  <div className="text-xs text-gray-500">Signed</div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">AI Summary</h3>
                <p className="text-sm text-gray-700 mb-3">
                  {generateAISummary()}
                </p>
                
                {/* High-Priority Follow-up CTA */}
                {amplitudeData?.engagementScore && ['A+', 'A', 'B+'].includes(amplitudeData.engagementScore) && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="font-bold text-sm">🚨 HIGH-PRIORITY LEAD</span>
                    </div>
                    <p className="text-sm mt-1 font-medium">
                      This lead has a {amplitudeData.engagementScore} engagement score. 
                      <span className="font-bold"> Follow up immediately</span> to maximize conversion potential!
                    </p>
                  </div>
                )}
              </div>

              {/* Amplitude Analytics Variables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Core Engagement Metrics */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Core Engagement
                  </h3>
                  <div className="space-y-1">
                    <BooleanDisplay value={amplitudeData?.chatSessionStarted} label="Chat Started" />
                    <NumericDisplay value={amplitudeData?.userMessagesSent} label="User Messages" />
                    <NumericDisplay value={amplitudeData?.botMessagesReceived} label="Bot Messages" />
                    <NumericDisplay value={amplitudeData?.answerButtonClicks} label="Quick Replies" />
                  </div>
                </div>

                {/* Contact & Tour Metrics */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Contact & Tours
                  </h3>
                  <div className="space-y-1">
                    <BooleanDisplay value={amplitudeData?.contactCaptured} label="Contact Captured" />
                    <StringDisplay value={amplitudeData?.contactMethod} label="Contact Method" />
                    <BooleanDisplay value={amplitudeData?.tourBooked} label="Tour Booked" />
                    <StringDisplay value={amplitudeData?.tourType} label="Tour Type" />
                  </div>
                </div>

                {/* CTA Interactions */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    CTA Interactions
                  </h3>
                  <div className="space-y-1">
                    <NumericDisplay value={amplitudeData?.emailOfficeClicked} label="Email Clicks" />
                    <NumericDisplay value={amplitudeData?.phoneCallClicked} label="Phone Clicks" />
                    <NumericDisplay value={amplitudeData?.widgetMinimized} label="Widget Minimized" />
                  </div>
                </div>

                {/* Incentive Tracking */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Incentive Tracking
                  </h3>
                  <div className="space-y-1">
                    <BooleanDisplay value={amplitudeData?.incentiveOffered} label="Incentive Offered" />
                    <BooleanDisplay value={amplitudeData?.incentiveAccepted} label="Incentive Accepted" />
                    <BooleanDisplay value={amplitudeData?.incentiveExpired} label="Incentive Expired" />
                  </div>
                </div>

                {/* Advanced Session Management */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-3">Advanced Session</h3>
                  <div className="space-y-1">
                    <BooleanDisplay value={amplitudeData?.adminHandoffTriggered} label="Admin Handoff" />
                    <BooleanDisplay value={amplitudeData?.customerServiceEscalated} label="Service Escalated" />
                    <BooleanDisplay value={amplitudeData?.conversationAbandoned} label="Conversation Abandoned" />
                    <BooleanDisplay value={amplitudeData?.widgetSessionEnded} label="Session Ended" />
                  </div>
                </div>

                {/* Qualification Status */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900 mb-3">Qualification Status</h3>
                  <div className="space-y-1">
                    <BooleanDisplay value={amplitudeData?.qualified} label="Qualified" />
                    <BooleanDisplay value={amplitudeData?.preLease} label="Pre-Lease" />
                    <BooleanDisplay value={amplitudeData?.tourIntent} label="Tour Intent" />
                    <BooleanDisplay value={amplitudeData?.engaged} label="Engaged" />
                    <BooleanDisplay value={amplitudeData?.signed} label="Signed" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
                <div className="text-sm text-gray-500">
                  {lead.timeline.length} activities
                </div>
              </div>

              {lead.timeline.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No timeline activities recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {lead.timeline
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((activity) => {
                      const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
                      
                      return (
                        <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center ${color}`}>
                            <ActivityIcon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {formatActivityType(activity.type)}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              {activity.details.chatSummary && (
                                <p><span className="font-medium">Summary:</span> {activity.details.chatSummary}</p>
                              )}
                              {activity.details.emailCollected && (
                                <p><span className="font-medium">Email:</span> {activity.details.emailCollected}</p>
                              )}
                              {activity.details.phoneCollected && (
                                <p><span className="font-medium">Phone:</span> {activity.details.phoneCollected}</p>
                              )}
                              {activity.details.agentName && (
                                <p><span className="font-medium">Agent:</span> {activity.details.agentName}</p>
                              )}
                              {activity.details.tourDate && (
                                <p><span className="font-medium">Tour Date:</span> {new Date(activity.details.tourDate).toLocaleString()}</p>
                              )}
                              {activity.details.unitRequested && (
                                <p><span className="font-medium">Unit:</span> {activity.details.unitRequested}</p>
                              )}
                              {activity.details.notes && (
                                <p><span className="font-medium">Notes:</span> {activity.details.notes}</p>
                              )}
                            </div>
                            
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                activity.createdBy === 'system' ? 'bg-blue-100 text-blue-800' :
                                activity.createdBy === 'agent' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {activity.createdBy}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LeadSummaryModal; 