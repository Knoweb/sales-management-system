import { apiClient as api } from './Api';

// Shared Enums
export type TechnicalProjectStatus = 'AWAITING_TECHNICAL_ROUTING' | 'ROUTED' | 'TEAM_FORMATION_IN_PROGRESS' | 'TEAM_READY';
export type TechnicalProjectDepartmentStatus = 'PENDING_TEAM' | 'TEAM_DRAFTING' | 'TEAM_READY';
export type ProjectTeamStatus = 'DRAFT' | 'READY';
export type ProjectTeamMemberStatus = 'ACTIVE' | 'INACTIVE';
export type ProjectRole = 'OTHER' | 'ELECTRONIC_ENGINEER' | 'WELDER' | 'TECHNICIAN' | 'PROJECT_ENGINEER' | 'ELECTRICAL_ENGINEER' | 'PROJECT_MANAGER' | 'QUALITY_CONTROLLER' | 'ASSISTANT' | 'MECHANICAL_ENGINEER' | 'SITE_SUPERVISOR' | 'SOFTWARE_ENGINEER';

export interface TechnicalProjectSummaryDTO {
  id: string;
  projectCode: string;
  status: TechnicalProjectStatus;
  projectBriefId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  salesOpportunityId: string;
  opportunityReference: string;
  technicalCoordinatorId: string;
  technicalCoordinatorName: string;
  bdmApprovedDate: string;
  routedAt: string;
  createdAt: string;
  departmentCount: number;
  teamReadyDepartmentCount: number;
  suggestedDepartments: string;
  routedDepartments: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface EligibleProjectBriefSummaryDTO {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  opportunityId: string;
  opportunityReference: string;
  bdmApprovedDate: string;
  suggestedDepartments: string;
}

export interface TechnicalProjectBriefDTO {
  id: string;
  projectId: string;
  leadId: string;
  clientId: string;
  projectName: string;
  projectDescription: string;
  projectScope: string;
  estimatedBudget: number;
  expectedStartDate: string;
  expectedDeliveryDate: string;
  status: string;
  primaryTechnologyStack: string[];
}

export interface TechnicalProjectDepartmentDTO {
  id: string;
  departmentId: string;
  departmentName?: string;
  status: TechnicalProjectDepartmentStatus;
  routingReason: string;
  revisionReason?: string;
  assignedAt: string;
  assignedBy: string;
  teamId?: string;
}

export interface TechnicalProjectDetailDTO {
  id: string;
  projectCode: string;
  status: TechnicalProjectStatus;
  technicalCoordinatorId?: string;
  technicalCoordinatorName?: string;
  createdAt: string;
  routedAt?: string;
  version: number;

  clientId: string;
  clientName: string;
  primaryContactSummary?: string;

  salesOpportunityId: string;
  opportunityReference: string;
  opportunityTitle: string;
  opportunityStage?: string;

  projectBriefId: string;
  currentVersionNumber: number;
  projectTitle: string;
  projectScope?: string;
  technicalRequirements?: string;
  expectedBudget?: number;
  currency?: string;
  expectedDeadline?: string;
  siteDetails?: string;
  suggestedDepartments?: string;
  suggestedDepartmentIds?: string[];
  projectBriefStatus?: string;

  routedDepartments: TechnicalProjectDepartmentDTO[];
}
export interface TechnicalRoutingDepartmentRequest {
  departmentId: string;
  requiredScope: string;
  expectedEstimateSubmissionDate: string; // YYYY-MM-DD
  routingNotes?: string;
}

export interface ProjectRoutingRequest {
  departments: TechnicalRoutingDepartmentRequest[];
}

export interface RoutingRevisionRequest extends ProjectRoutingRequest {
  revisionReason: string;
  optimisticLockVersion: number;
}

export const getPendingRoutingProjects = async (page: number = 0, size: number = 20): Promise<Page<TechnicalProjectSummaryDTO>> => {
  const response = await api.get<Page<TechnicalProjectSummaryDTO>>('/technical-routing/projects', { params: { status: 'AWAITING_TECHNICAL_ROUTING', page, size } });
  return response.data;
};

export const getEligibleProjectBriefs = async (page: number = 0, size: number = 20): Promise<Page<EligibleProjectBriefSummaryDTO>> => {
  const response = await api.get<Page<EligibleProjectBriefSummaryDTO>>('/technical-routing/eligible-briefs', { params: { page, size } });
  return response.data;
};

export const initializeTechnicalProject = async (projectBriefId: string): Promise<void> => {
  await api.post(`/technical-routing/project-briefs/${projectBriefId}/initialize`);
};

export const getTechnicalProject = async (id: string): Promise<TechnicalProjectDetailDTO> => {
  const response = await api.get<TechnicalProjectDetailDTO>(`/technical-routing/projects/${id}`);
  return response.data;
};

export const routeProject = async (id: string, request: ProjectRoutingRequest): Promise<TechnicalProjectDetailDTO> => {
  const response = await api.post<TechnicalProjectDetailDTO>(`/technical-routing/projects/${id}/route`, request);
  return response.data;
};

export const reviseRouting = async (id: string, request: RoutingRevisionRequest): Promise<TechnicalProjectDetailDTO> => {
  const response = await api.put<TechnicalProjectDetailDTO>(`/technical-routing/projects/${id}/route`, request);
  return response.data;
};

export const getTechnicalProjects = async (page: number = 0, size: number = 20, status?: string): Promise<Page<TechnicalProjectSummaryDTO>> => {
  const params: Record<string, string | number> = { page, size };
  if (status) params.status = status;
  const response = await api.get<Page<TechnicalProjectSummaryDTO>>('/technical-routing/projects', { params });
  return response.data;
};
