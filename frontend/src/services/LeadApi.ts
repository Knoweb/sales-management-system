import { apiClient as api } from './Api';
import type { Lead, LeadRequest, LeadActivity, LeadActivityRequest, FollowUp, FollowUpRequest } from '../types/lead';
import type { PaginatedResponse } from './ClientApi';

export const LeadApi = {
  searchLeads: async (search?: string, status?: string, active?: boolean, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (active !== undefined) params.append('active', String(active));
    params.append('page', String(page));
    params.append('size', String(size));
    
    const response = await api.get<PaginatedResponse<Lead>>(`/leads?${params.toString()}`);
    return response.data;
  },

  getLead: async (id: string) => {
    const response = await api.get<Lead>(`/leads/${id}`);
    return response.data;
  },

  createLead: async (data: LeadRequest) => {
    const response = await api.post<Lead>('/leads', data);
    return response.data;
  },

  updateLead: async (id: string, data: LeadRequest) => {
    const response = await api.put<Lead>(`/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id: string) => {
    await api.delete(`/leads/${id}`);
  },

  assignLead: async (id: string, assignedTo: string) => {
    const response = await api.patch<Lead>(`/leads/${id}/assign`, { assignedTo });
    return response.data;
  },

  addActivity: async (leadId: string, data: LeadActivityRequest) => {
    const response = await api.post<LeadActivity>(`/leads/${leadId}/activities`, data);
    return response.data;
  },

  getActivities: async (leadId: string) => {
    const response = await api.get<LeadActivity[]>(`/leads/${leadId}/activities`);
    return response.data;
  },

  addFollowUp: async (leadId: string, data: FollowUpRequest) => {
    const response = await api.post<FollowUp>(`/leads/${leadId}/follow-ups`, data);
    return response.data;
  },

  getFollowUps: async (leadId: string) => {
    const response = await api.get<FollowUp[]>(`/leads/${leadId}/follow-ups`);
    return response.data;
  }
};
