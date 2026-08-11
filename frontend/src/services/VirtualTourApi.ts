import { apiClient } from './Api';

export interface VirtualTour {
  id: string;
  leadId?: string;
  opportunityId?: string;
  targetName?: string;
  targetType?: string;
  platform: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  tourDate: string;
  notes?: string;
  language?: string;
  demonstratedProduct?: string;
  clientResponse?: string;
  probabilityBefore?: number;
  probabilityAfter?: number;
  followUpRequired?: boolean;
  conductedById?: string;
  conductedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualTourAnalytics {
  completedTours: number;
  averageProbabilityIncrease: number;
}

export interface VirtualTourRequest {
  leadId?: string;
  opportunityId?: string;
  platform: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  tourDate: string;
  notes?: string;
  language?: string;
  demonstratedProduct?: string;
  clientResponse?: string;
  probabilityBefore?: number;
  probabilityAfter?: number;
  followUpRequired?: boolean;
  conductedBy?: string;
}

const BASE_URL = '/virtual-tours';

export const VirtualTourApi = {
  createVirtualTour: async (data: VirtualTourRequest): Promise<VirtualTour> => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  updateTourStatus: async (id: string, status: string): Promise<VirtualTour> => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  updateTour: async (id: string, data: VirtualTourRequest): Promise<VirtualTour> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  getToursByLead: async (leadId: string): Promise<VirtualTour[]> => {
    const response = await apiClient.get(`${BASE_URL}/lead/${leadId}`);
    return response.data;
  },

  getToursByOpportunity: async (opportunityId: string): Promise<VirtualTour[]> => {
    const response = await apiClient.get(`${BASE_URL}/opportunity/${opportunityId}`);
    return response.data;
  },

  getUpcomingTours: async (): Promise<VirtualTour[]> => {
    const response = await apiClient.get(`${BASE_URL}/upcoming`);
    return response.data;
  },

  getEffectivenessAnalytics: async (): Promise<VirtualTourAnalytics> => {
    const response = await apiClient.get(`${BASE_URL}/analytics/effectiveness`);
    return response.data;
  }
};
