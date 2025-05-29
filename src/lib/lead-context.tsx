'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, LeadActivity, leads as initialLeads } from '@/lib/dummy-data';

interface LeadContextType {
  leads: Lead[];
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  addActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId'>) => void;
  createNewLead: (name: string, source?: Lead['source']) => Lead;
  deleteLead: (leadId: string) => void;
  getLeadsByStage: (stage: Lead['currentStage']) => Lead[];
  getLeadStats: () => {
    total: number;
    byStage: Record<Lead['currentStage'], number>;
    recentActivity: number;
  };
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, ...updates, lastActivity: new Date() }
          : lead
      )
    );
  };

  const addActivity = (leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId'>) => {
    const newActivity: LeadActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leadId,
    };

    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              timeline: [...lead.timeline, newActivity],
              lastActivity: newActivity.timestamp,
            }
          : lead
      )
    );
  };

  const createNewLead = (name: string, source: Lead['source'] = 'manual') => {
    const now = new Date();
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newLead: Lead = {
      id: leadId,
      name,
      currentStage: 'chat_initiated',
      source,
      createdAt: now,
      lastActivity: now,
      timeline: [
        {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          leadId,
          type: 'chat_initiated',
          timestamp: now,
          details: {
            chatSummary: source === 'manual' ? 'Lead created manually by agent' : 'New lead initiated'
          },
          createdBy: source === 'manual' ? 'agent' : 'system'
        }
      ]
    };

    setLeads(prevLeads => [...prevLeads, newLead]);
    return newLead;
  };

  const deleteLead = (leadId: string) => {
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
    
    // Clear selection if the deleted lead was selected
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
    }
  };

  const getLeadsByStage = (stage: Lead['currentStage']) => {
    return leads.filter(lead => lead.currentStage === stage);
  };

  const getLeadStats = () => {
    const total = leads.length;
    const byStage = leads.reduce((acc, lead) => {
      acc[lead.currentStage] = (acc[lead.currentStage] || 0) + 1;
      return acc;
    }, {} as Record<Lead['currentStage'], number>);

    // Count recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const recentActivity = leads.filter(lead => 
      lead.lastActivity > yesterday
    ).length;

    return { total, byStage, recentActivity };
  };

  return (
    <LeadContext.Provider value={{
      leads,
      selectedLead,
      setSelectedLead,
      updateLead,
      addActivity,
      createNewLead,
      deleteLead,
      getLeadsByStage,
      getLeadStats,
    }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeadContext() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeadContext must be used within a LeadProvider');
  }
  return context;
} 