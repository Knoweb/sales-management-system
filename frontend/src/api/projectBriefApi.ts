import { apiClient as api } from '../services/Api';

export interface DepartmentSummaryDTO {
  id: string;
  name: string;
}

export interface ProjectBriefDTO {
  id: string;
  opportunityId: string;
  status: string;
  currentVersionNumber: number;
  projectTitle: string;
  businessProblem?: string;
  requiredSolution?: string;
  projectScope?: string;
  technicalRequirements?: string;
  expectedBudget?: number;
  currency?: string;
  expectedDeadline?: string;
  siteName?: string;
  siteAddress?: string;
  siteInformation?: string;
  meetingNotes?: string;
  specialConditions?: string;
  requiredDepartments: DepartmentSummaryDTO[];
  dueAt: string;
  submittedAt?: string;
  submittedById?: string;
  submittedByName?: string;
  createdAt: string;
  updatedAt: string;
  overdue: boolean;
  deadlineStatus: string;
}

export interface ProjectBriefUpdateDraftRequest {
  projectTitle: string;
  businessProblem?: string;
  requiredSolution?: string;
  projectScope?: string;
  technicalRequirements?: string;
  expectedBudget?: number;
  currency?: string;
  expectedDeadline?: string;
  siteName?: string;
  siteAddress?: string;
  siteInformation?: string;
  meetingNotes?: string;
  specialConditions?: string;
  requiredDepartmentIds?: string[];
}

export interface ProjectBriefSubmitRequest {
  // Can contain electronic signature or confirmation flag
  confirmation: boolean;
}

export const initializeProjectBrief = async (opportunityId: string): Promise<ProjectBriefDTO> => {
  const response = await api.post(`/opportunities/${opportunityId}/project-brief/initialize`);
  return response.data;
};

export const getProjectBrief = async (id: string): Promise<ProjectBriefDTO> => {
  const response = await api.get(`/project-briefs/${id}`);
  return response.data;
};

export const updateProjectBriefDraft = async (id: string, data: ProjectBriefUpdateDraftRequest): Promise<ProjectBriefDTO> => {
  const response = await api.put(`/project-briefs/${id}/draft`, data);
  return response.data;
};

export const submitProjectBrief = async (id: string, data: ProjectBriefSubmitRequest): Promise<ProjectBriefDTO> => {
  const response = await api.post(`/project-briefs/${id}/submit`, data);
  return response.data;
};
