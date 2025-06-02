import axios from 'axios';

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
    console.log(`✅ API Response [${response.config.url}]:`, {
      status: response.status,
      dataPreview: typeof response.data === 'object' 
        ? Array.isArray(response.data) 
          ? `Array(${response.data.length})`
          : Object.keys(response.data).slice(0, 3).join(', ') + '...'
        : response.data
    });
    return response;
  },
  (error) => {
    console.error(`❌ API Error [${error.config?.url || 'unknown'}]:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Leads API
export const fetchLeads = async () => {
  console.log('📡 Fetching leads from API...');
  try {
    const response = await apiClient.get('/leads');
    console.log(`📊 Fetched ${response.data.length || 0} leads`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch leads:', error);
    // Re-throw to let the caller handle it
    throw error;
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