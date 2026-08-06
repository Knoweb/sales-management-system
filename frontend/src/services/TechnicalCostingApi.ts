import { apiClient as api } from './Api';

export type DepartmentEstimateStatus = 'DRAFT' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED';
export type ConsolidatedEstimateStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'REVISION_REQUESTED' | 'APPROVED';
export type EstimateLineItemCategory = 
  | 'MATERIALS'
  | 'LABOUR'
  | 'MACHINES_EQUIPMENT'
  | 'SOFTWARE'
  | 'TRANSPORT'
  | 'INSTALLATION'
  | 'TESTING'
  | 'SUBCONTRACTING'
  | 'MAINTENANCE'
  | 'CONTINGENCY'
  | 'TAX_OTHER_COSTS';

export interface DepartmentEstimateLineItemDTO {
  id: string;
  category: EstimateLineItemCategory;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  totalCost: number;
  employeeAllocationId?: string;
  notes?: string;
}

export interface DepartmentEstimateLineItemRequest {
  id?: string;
  category: EstimateLineItemCategory;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  employeeAllocationId?: string;
  notes?: string;
}

export interface DepartmentEstimateDTO {
  id: string;
  technicalProjectId: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  versionNumber: number;
  status: DepartmentEstimateStatus;
  subtotal: number;
  contingencyPercentage: number;
  contingencyAmount: number;
  taxPercentage: number;
  taxAmount: number;
  marginPercentage: number;
  marginAmount: number;
  finalTotal: number;
  designDurationDays: number;
  procurementDurationDays: number;
  developmentDurationDays: number;
  testingDurationDays: number;
  installationDurationDays: number;
  trainingDurationDays: number;
  deliveryDurationDays: number;
  submittedBy?: string;
  submittedByName?: string;
  submittedAt?: string;
  revisionNotes?: string;
  createdAt: string;
  updatedAt: string;
  lineItems: DepartmentEstimateLineItemDTO[];
}

export interface DepartmentEstimateSaveRequest {
  contingencyPercentage: number;
  contingencyAmount?: number;
  taxPercentage: number;
  marginPercentage: number;
  designDurationDays: number;
  procurementDurationDays: number;
  developmentDurationDays: number;
  testingDurationDays: number;
  installationDurationDays: number;
  trainingDurationDays: number;
  deliveryDurationDays: number;
  lineItems: DepartmentEstimateLineItemRequest[];
}

export interface ConsolidatedTechnicalEstimateDTO {
  id: string;
  technicalProjectId: string;
  versionNumber: number;
  status: ConsolidatedEstimateStatus;
  totalDesignDurationDays: number;
  totalProcurementDurationDays: number;
  totalDevelopmentDurationDays: number;
  totalTestingDurationDays: number;
  totalInstallationDurationDays: number;
  totalTrainingDurationDays: number;
  totalDeliveryDurationDays: number;
  totalEstimatedDurationDays: number;
  subtotal: number;
  contingencyAmount: number;
  taxAmount: number;
  marginAmount: number;
  finalTotal: number;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  revisionNotes?: string;
  createdAt: string;
  updatedAt: string;
  departmentEstimates: DepartmentEstimateDTO[];
}

export interface RevisionRequest {
  notes: string;
}

export interface ApprovedTechnicalEstimateSummaryDTO {
  id: string;
  technicalProjectId: string;
  projectCode: string;
  projectTitle: string;
  versionNumber: number;
  status: string;
  subtotal: number;
  contingencyAmount: number;
  taxAmount: number;
  marginAmount: number;
  finalTotal: number;
  totalDurationDays: number;
  approvedAt: string;
  approvedByName: string;
  categoryBreakdown: Record<string, number>;
}

export const getDepartmentEstimate = async (projectId: string, departmentId: string): Promise<DepartmentEstimateDTO> => {
  const response = await api.get<DepartmentEstimateDTO>(`/technical-projects/${projectId}/estimates/department/${departmentId}`);
  return response.data;
};

export const saveDepartmentEstimate = async (projectId: string, departmentId: string, request: DepartmentEstimateSaveRequest): Promise<DepartmentEstimateDTO> => {
  const response = await api.put<DepartmentEstimateDTO>(`/technical-projects/${projectId}/estimates/department/${departmentId}`, request);
  return response.data;
};

export const submitDepartmentEstimate = async (projectId: string, departmentId: string): Promise<DepartmentEstimateDTO> => {
  const response = await api.post<DepartmentEstimateDTO>(`/technical-projects/${projectId}/estimates/department/${departmentId}/submit`);
  return response.data;
};

export const getDepartmentEstimateHistory = async (projectId: string, departmentId: string): Promise<DepartmentEstimateDTO[]> => {
  const response = await api.get<DepartmentEstimateDTO[]>(`/technical-projects/${projectId}/estimates/department/${departmentId}/history`);
  return response.data;
};

export const getSubmittedEstimates = async (projectId: string): Promise<DepartmentEstimateDTO[]> => {
  const response = await api.get<DepartmentEstimateDTO[]>(`/technical-projects/${projectId}/estimates/submitted`);
  return response.data;
};

export const requestRevision = async (projectId: string, departmentId: string, request: RevisionRequest): Promise<DepartmentEstimateDTO> => {
  const response = await api.post<DepartmentEstimateDTO>(`/technical-projects/${projectId}/estimates/department/${departmentId}/request-revision`, request);
  return response.data;
};

export const consolidateAndApprove = async (projectId: string): Promise<ConsolidatedTechnicalEstimateDTO> => {
  const response = await api.post<ConsolidatedTechnicalEstimateDTO>(`/technical-projects/${projectId}/estimates/consolidate-and-approve`);
  return response.data;
};

export const getLatestConsolidatedEstimate = async (projectId: string): Promise<ConsolidatedTechnicalEstimateDTO> => {
  const response = await api.get<ConsolidatedTechnicalEstimateDTO>(`/technical-projects/${projectId}/estimates/consolidated`);
  return response.data;
};

export const getConsolidatedEstimateHistory = async (projectId: string): Promise<ConsolidatedTechnicalEstimateDTO[]> => {
  const response = await api.get<ConsolidatedTechnicalEstimateDTO[]>(`/technical-projects/${projectId}/estimates/consolidated/history`);
  return response.data;
};

export const getApprovedEstimateSummary = async (projectId: string): Promise<ApprovedTechnicalEstimateSummaryDTO> => {
  const response = await api.get<ApprovedTechnicalEstimateSummaryDTO>(`/technical-projects/${projectId}/estimates/approved-summary`);
  return response.data;
};
