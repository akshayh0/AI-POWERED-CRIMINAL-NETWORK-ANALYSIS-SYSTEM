// Centralized API Service for Crime Analytics Platform
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export async function fetchFromApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const path = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
  const url = `${API_BASE_URL}${path}`;

  // Setup headers
  const headers = new Headers(options?.headers);
  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  // Case Analytics & CRUD
  getCases: (params?: Record<string, string | number>) => {
    const query = params 
      ? '?' + new URLSearchParams(params as Record<string, string>).toString() 
      : '';
    return fetchFromApi(`/cases${query}`);
  },

  getCaseDetail: (id: number | string) => {
    return fetchFromApi(`/cases/${id}`);
  },

  getKpis: () => {
    return fetchFromApi('/cases/kpis');
  },

  getTrends: () => {
    return fetchFromApi('/cases/trends');
  },

  getDistricts: () => {
    return fetchFromApi('/cases/districts');
  },

  getStations: () => {
    return fetchFromApi('/cases/stations');
  },

  getCategories: () => {
    return fetchFromApi('/cases/categories');
  },

  getDemographics: () => {
    return fetchFromApi('/cases/demographics');
  },

  getOfficers: () => {
    return fetchFromApi('/cases/officers');
  },

  getAccused: () => {
    return fetchFromApi('/cases/accused');
  },

  getAccusedDetail: (personId: string) => {
    return fetchFromApi(`/cases/accused/${personId}`);
  },

  getVictims: () => {
    return fetchFromApi('/cases/victims');
  },

  // AI Intelligence & Predictions
  getHotspots: (params?: { categoryId?: number | string; refresh?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.categoryId) q.set('category_id', String(params.categoryId));
    if (params?.refresh) q.set('refresh', 'true');
    const queryStr = q.toString() ? '?' + q.toString() : '';
    return fetchFromApi(`/ai-predictions/hotspots${queryStr}`);
  },

  getForecast: (refresh?: boolean) => {
    const q = refresh ? '?refresh=true' : '';
    return fetchFromApi(`/ai-predictions/trends${q}`);
  },

  getAiTrends: (refresh?: boolean) => {
    const q = refresh ? '?refresh=true' : '';
    return fetchFromApi(`/ai-predictions/trends${q}`);
  },

  getDistrictRisk: () => {
    return fetchFromApi('/ai/districts-risk');
  },

  getAnomalies: (refresh?: boolean) => {
    const q = refresh ? '?refresh=true' : '';
    return fetchFromApi(`/ai-predictions/anomalies${q}`);
  },

  getSimilarCases: (caseId: number | string) => {
    return fetchFromApi(`/ai/similar-cases/${caseId}`);
  },

  getNetworkGraph: (params?: { case_id?: number | string; accused_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.case_id) queryParams.set('case_id', String(params.case_id));
    if (params?.accused_id) queryParams.set('accused_id', params.accused_id);
    
    const queryStr = queryParams.toString() ? '?' + queryParams.toString() : '';
    return fetchFromApi(`/ai/network${queryStr}`);
  },

  getAiStatus: () => {
    return fetchFromApi<{
      online: boolean;
      ai_engine: string;
      groq_connected: boolean;
      model: string;
      records_available: number;
    }>('/ai/status');
  },

  postChatQuery: (
    queryText: string, 
    history?: Array<{ sender: 'user' | 'bot'; text: string }>,
    officerContext?: { role?: string; district?: string; name?: string; clearance_level?: string }
  ) => {
    return fetchFromApi<{
      success: boolean;
      response: string;
      data_used?: { records_analyzed: number };
      insights?: string[];
      limitations?: string[];
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: queryText,
        query: queryText,
        user_role: officerContext?.role,
        district: officerContext?.district,
        officer_name: officerContext?.name,
        clearance_level: officerContext?.clearance_level || officerContext?.role,
        history: (history || []).map(h => ({
          role: h.sender === 'user' ? 'user' : 'assistant',
          content: h.text
        }))
      })
    });
  }
};

export const api = apiService;
export const crimeApi = apiService;
