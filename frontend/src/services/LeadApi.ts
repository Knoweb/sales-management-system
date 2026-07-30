import { apiClient as api } from './Api';
import type { Lead, LeadRequest, LeadActivity, LeadActivityRequest, FollowUp, FollowUpRequest, LeadStatus } from '../types/lead';
import type { PaginatedResponse } from './ClientApi';

export const LeadApi = {
  searchLeads: async (search?: string, status?: string, active?: boolean, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
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
    const response = await api.patch<Lead>(`/leads/${id}/assignee`, { assignedTo });
    return response.data;
  },

  updateStatus: async (id: string, status?: LeadStatus, notes?: string, active?: boolean) => {
    const payload: Record<string, unknown> = {};
    if (status !== undefined) payload.status = status;
    if (notes !== undefined) payload.notes = notes;
    if (active !== undefined) payload.active = active;
    
    const response = await api.patch<Lead>(`/leads/${id}/status`, payload);
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
  },

  updateFollowUp: async (leadId: string, followUpId: string, data: FollowUpRequest) => {
    const response = await api.put<FollowUp>(`/leads/${leadId}/follow-ups/${followUpId}`, data);
    return response.data;
  },

  completeFollowUp: async (leadId: string, followUpId: string, notes?: string) => {
    const response = await api.patch<FollowUp>(`/leads/${leadId}/follow-ups/${followUpId}/complete`, { notes });
    return response.data;
  }
};
