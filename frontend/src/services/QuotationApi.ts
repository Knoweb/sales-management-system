import { apiClient } from './Api';

export type QuotationStatus = 
  'DRAFT' | 
  'PENDING_TOP_MANAGEMENT_APPROVAL' | 
  'APPROVED_BY_TOP_MANAGEMENT' | 
  'REJECTED_BY_TOP_MANAGEMENT' | 
  'RETURNED_FOR_CORRECTION' | 
  'PENDING_CLIENT_APPROVAL' | 
  'CLIENT_ACCEPTED' | 
  'CLIENT_REJECTED';

export interface EstimateCostItemDto {
  departmentName: string;
  costType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ApprovedEstimateDto {
  id: string;
  technicalProjectId: string;
  projectCode: string;
  clientName: string;
  totalEstimatedCost: number;
  costItems: EstimateCostItemDto[];
}

export interface QuotationItemDto {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuotationDto {
  id?: string;
  quotationNumber?: string;
  version?: number;
  approvedEstimateId?: string;
  
  clientDetails: string;
  projectTitle: string;
  projectDescription: string;
  scopeOfWork: string;
  
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  finalTotal: number;
  
  paymentTerms: string;
  deliveryPeriod: string;
  warrantyInformation: string;
  validityPeriod: string;
  termsAndConditions: string;
  
  status?: QuotationStatus;
  items?: QuotationItemDto[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationApprovalDto {
  action: 'APPROVE' | 'REJECT' | 'RETURN' | 'REVISE';
  comments?: string;
}

export interface QuotationApprovalHistoryDto {
  id: string;
  action: string;
  comments?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export const getQuotations = async (): Promise<QuotationDto[]> => {
  const response = await apiClient.get<QuotationDto[]>('/quotations');
  return response.data;
};

export const getQuotationById = async (id: string): Promise<QuotationDto> => {
  const response = await apiClient.get<QuotationDto>(`/quotations/${id}`);
  return response.data;
};

export const createQuotation = async (data: QuotationDto): Promise<QuotationDto> => {
  const response = await apiClient.post<QuotationDto>('/quotations', data);
  return response.data;
};

export const updateQuotation = async (id: string, data: QuotationDto): Promise<QuotationDto> => {
  const response = await apiClient.put<QuotationDto>(`/quotations/${id}`, data);
  return response.data;
};

export const submitQuotationForApproval = async (id: string): Promise<QuotationDto> => {
  const response = await apiClient.post<QuotationDto>(`/quotations/${id}/submit-for-approval`);
  return response.data;
};

export const processQuotationApproval = async (id: string, data: QuotationApprovalDto): Promise<QuotationDto> => {
  const response = await apiClient.post<QuotationDto>(`/quotations/${id}/approve`, data);
  return response.data;
};

export const markQuotationAsSent = async (id: string): Promise<QuotationDto> => {
  const response = await apiClient.post<QuotationDto>(`/quotations/${id}/mark-sent`);
  return response.data;
};

export const updateQuotationClientDecision = async (id: string, decision: { action: string; comments?: string }): Promise<QuotationDto> => {
  const response = await apiClient.post<QuotationDto>(`/quotations/${id}/client-decision`, decision);
  return response.data;
};

export const getQuotationApprovalHistory = async (id: string): Promise<QuotationApprovalHistoryDto[]> => {
  const response = await apiClient.get<QuotationApprovalHistoryDto[]>(`/quotations/${id}/approval-history`);
  return response.data;
};
