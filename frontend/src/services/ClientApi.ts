import { apiClient as api } from './Api';
import type { Client, ClientRequest, ClientContact, ClientContactRequest } from '../types/client';

export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export const ClientApi = {
  searchClients: async (search?: string, active?: boolean, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (active !== undefined) params.append('active', String(active));
    params.append('page', String(page));
    params.append('size', String(size));
    
    const response = await api.get<PaginatedResponse<Client>>(`/clients?${params.toString()}`);
    return response.data;
  },

  getClient: async (id: string) => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: ClientRequest, ignoreDuplicates = false) => {
    const response = await api.post<Client>(`/clients?ignoreDuplicates=${ignoreDuplicates}`, data);
    return response.data;
  },

  updateClient: async (id: string, data: ClientRequest, ignoreDuplicates = false) => {
    const response = await api.put<Client>(`/clients/${id}?ignoreDuplicates=${ignoreDuplicates}`, data);
    return response.data;
  },

  deleteClient: async (id: string) => {
    await api.delete(`/clients/${id}`); // Still keeping if it exists, though they requested activate/deactivate
  },

  activateClient: async (id: string) => {
    await api.patch(`/clients/${id}/activate`);
  },

  deactivateClient: async (id: string) => {
    await api.patch(`/clients/${id}/deactivate`);
  },

  checkClientDuplicates: async (data: ClientRequest, excludeClientId?: string) => {
    const url = excludeClientId 
      ? `/clients/duplicate-check?excludeClientId=${excludeClientId}`
      : `/clients/duplicate-check`;
    const response = await api.post<import('../types/client').DuplicateClientCheckResponse>(url, data);
    return response.data;
  },

  getClientContacts: async (clientId: string) => {
    const response = await api.get<ClientContact[]>(`/clients/${clientId}/contacts`);
    return response.data;
  },

  getClientContact: async (clientId: string, contactId: string) => {
    const response = await api.get<ClientContact>(`/clients/${clientId}/contacts/${contactId}`);
    return response.data;
  },

  addContact: async (clientId: string, data: ClientContactRequest) => {
    const response = await api.post<ClientContact>(`/clients/${clientId}/contacts`, data);
    return response.data;
  },

  updateContact: async (clientId: string, contactId: string, data: ClientContactRequest) => {
    const response = await api.put<ClientContact>(`/clients/${clientId}/contacts/${contactId}`, data);
    return response.data;
  },

  setPrimaryContact: async (clientId: string, contactId: string) => {
    const response = await api.patch<ClientContact>(`/clients/${clientId}/contacts/${contactId}/primary`);
    return response.data;
  },

  activateClientContact: async (clientId: string, contactId: string) => {
    await api.patch(`/clients/${clientId}/contacts/${contactId}/activate`);
  },

  deactivateClientContact: async (clientId: string, contactId: string) => {
    await api.patch(`/clients/${clientId}/contacts/${contactId}/deactivate`);
  }
};
