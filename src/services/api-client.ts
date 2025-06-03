import axios from 'axios';
import type { Lead } from '@/lib/dummy-data';

// Base API client
const apiClient = axios.create({
  baseURL: '/api', // Proxy to backend API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Leads API
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const response = await apiClient.get<Lead[]>('/leads');
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
};

export const fetchLeadById = async (id: string) => {
  const response = await apiClient.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (leadData: any) => {
  const response = await apiClient.post('/leads', leadData);
  return response.data;
};

// Property Managers API (Agents)
export const fetchAgents = async () => {
  const response = await apiClient.get('/property-managers');
  return response.data;
};

// Tours API
export const fetchTours = async () => {
  const response = await apiClient.get('/tours');
  return response.data;
};

// Conversations API
export const fetchConversations = async () => {
  const response = await apiClient.get('/conversations');
  return response.data;
};

export default apiClient; 