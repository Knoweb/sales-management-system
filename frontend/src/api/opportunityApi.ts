import { apiClient as api } from '../services/Api';

export interface OpportunityActivityDTO {
  id: string;
  activityType: string;
  description: string;
  details: unknown;
  createdAt: string;
  createdById: string;
  createdByName: string;
}

export interface ProjectBriefSummaryDTO {
  id: string;
  status: string;
  dueAt?: string;
  overdue?: boolean;
  overdueHours?: number;
  deadlineStatus?: 'ON_TIME' | 'DUE_SOON' | 'OVERDUE' | 'SUBMITTED_ON_TIME' | 'SUBMITTED_LATE';
  currentVersionNumber?: number;
}

export interface SalesOpportunityDTO {
  id: string;
  opportunityNumber: string;
  title: string;
  description?: string;
  estimatedValue: number;
  currency: string;
  stage: string;
  expectedCloseDate: string;
  clientId: string;
  clientName: string;
  primaryContactId?: string;
  primaryContactName?: string;
  productCategoryId: string;
  productCategoryName: string;
  assignedSalesOfficerId?: string;
  assignedSalesOfficerName?: string;
  createdAt: string;
  updatedAt: string;
  projectBrief?: ProjectBriefSummaryDTO;
  activities: OpportunityActivityDTO[];
}

export interface SalesOpportunitySummaryDTO {
  id: string;
  opportunityNumber: string;
  title: string;
  estimatedValue: number;
  currency: string;
  stage: string;
  expectedCloseDate: string;
  clientName: string;
  assignedSalesOfficerName?: string;
  createdAt: string;
}

export interface ConvertLeadRequest {
  title: string;
  estimatedValue: number;
  currency: string;
  expectedCloseDate: string;
  productCategoryId: string;
  assignedSalesOfficerId: string;
}

export const convertLeadToOpportunity = async (leadId: string, data: ConvertLeadRequest): Promise<SalesOpportunityDTO> => {
  const response = await api.post(`/leads/${leadId}/convert-to-opportunity`, data);
  return response.data;
};

export const getOpportunities = async (
  page = 0,
  size = 10,
  search?: string,
  stage?: string,
  clientId?: string
): Promise<{ content: SalesOpportunitySummaryDTO[]; totalElements: number; totalPages: number }> => {
  const params: Record<string, string | number> = { page, size };
  if (search && search.trim().length > 0) params.search = search;
  if (stage && stage.trim().length > 0) params.stage = stage;
  if (clientId && clientId.trim().length > 0) params.clientId = clientId;

  const response = await api.get('/opportunities', { params });
  return response.data;
};

export const getOpportunity = async (id: string): Promise<SalesOpportunityDTO> => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};
