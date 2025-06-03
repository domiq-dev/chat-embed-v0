'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Lead, LeadActivity, leads as initialLeads } from '@/lib/dummy-data';
import { fetchLeads, fetchAgents, fetchTours } from '@/services/api-client';

interface LeadContextType {
  leads: Lead[];
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  setLeads: (leads: Lead[]) => void;
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
  refreshAmplitudeData: () => Promise<void>;
  isLoadingAmplitudeData: boolean;
  forceCloseSession: () => void;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  // Start with empty array and fetch real data on mount
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoadingAmplitudeData, setIsLoadingAmplitudeData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track active fetch request for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);

  // Function to refresh all data from the API
  const refresh = async () => {
    if (isUnmountedRef.current) return;
    
    setIsLoading(true);
    try {
      const leadsData = await fetchLeads();
      
      if (!isUnmountedRef.current) {
        setLeads(leadsData);
      }
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
      // Fall back to dummy data in development
      if (process.env.NODE_ENV === 'development' && !isUnmountedRef.current) {
        console.warn('⚠️ Using dummy data in development mode');
        setLeads(initialLeads);
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    if (isUnmountedRef.current) return;
    
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, ...updates, lastActivity: new Date() }
          : lead
      )
    );
  };

  const addActivity = (leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId'>) => {
    if (isUnmountedRef.current) return;
    
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

    if (!isUnmountedRef.current) {
      setLeads(prevLeads => [...prevLeads, newLead]);
    }
    return newLead;
  };

  const deleteLead = (leadId: string) => {
    if (isUnmountedRef.current) return;
    
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

  const forceCloseSession = () => {
    
    // Abort any active fetch request
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      abortControllerRef.current.abort();
    }
    
    // Reset loading state
    if (!isUnmountedRef.current) {
      setIsLoadingAmplitudeData(false);
    }
    
    // Force close Amplitude service sessions
    try {
      // Dynamic import to avoid circular dependency
      import('@/lib/amplitude-data-service').then(({ amplitudeDataService }) => {
        amplitudeDataService.forceCloseAllSessions();
      });
    } catch (error) {
      console.warn('Could not force close Amplitude sessions:', error);
    }
    
  };

  const refreshAmplitudeData = async () => {
    // Abort any existing request first
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (isUnmountedRef.current) return;
    setIsLoadingAmplitudeData(true);
    
    try {
      // Fetch real Amplitude data for all leads
      const leadIds = leads.map(lead => lead.id);
      
      const response = await fetch('/api/amplitude-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadIds }),
        signal, // Add abort signal
      });

      // Check if request was aborted
      if (signal.aborted) {
        return;
      }

      if (response.ok) {
        const { data } = await response.json();
        
        // Only update state if component is still mounted
        if (!isUnmountedRef.current) {
          setLeads(prev => prev.map(lead => ({
            ...lead,
            amplitudeData: data[lead.id] || lead.amplitudeData
          })));
        }
      } else {
        console.warn('Failed to fetch Amplitude data, using dummy data');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      } else {
        console.error('Failed to refresh Amplitude data:', error);
      }
    } finally {
      // Only update loading state if component is still mounted
      if (!isUnmountedRef.current) {
        setIsLoadingAmplitudeData(false);
      }
      
      // Clear the abort controller reference
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      
      // Abort any active request
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Automatically try to fetch real data on mount (but don't block the UI)
  useEffect(() => {
    // Only auto-fetch in production or when explicitly testing
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_AMPLITUDE_FETCH === 'true') {
      refreshAmplitudeData();
    }
  }, []); // Only run once on mount

  return (
    <LeadContext.Provider value={{
      leads,
      selectedLead,
      setSelectedLead,
      setLeads,
      updateLead,
      addActivity,
      createNewLead,
      deleteLead,
      getLeadsByStage,
      getLeadStats,
      refreshAmplitudeData,
      isLoadingAmplitudeData,
      forceCloseSession,
      isLoading,
      refresh
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