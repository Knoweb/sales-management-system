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

export interface ProjectBriefVersionDTO {
  id: string;
  projectBriefId: string;
  versionNumber: number;
  snapshot: string;
  changeSummary?: string;
  submittedVersion: boolean;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export interface ProjectBriefAttachmentDTO {
  id: string;
  projectBriefId: string;
  fileName: string;
  fileType?: string;
  fileUrl: string;
  fileSize?: number;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
}

export interface ProjectBriefSubmitRequest {
  confirmation?: boolean;
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

export const saveProjectBriefVersion = async (id: string, data: ProjectBriefUpdateDraftRequest): Promise<ProjectBriefDTO> => {
  const response = await api.post(`/project-briefs/${id}/version`, data);
  return response.data;
};

export const submitProjectBrief = async (id: string, data: ProjectBriefSubmitRequest): Promise<ProjectBriefDTO> => {
  const response = await api.post(`/project-briefs/${id}/submit`, data);
  return response.data;
};

export const getProjectBriefVersions = async (id: string): Promise<ProjectBriefVersionDTO[]> => {
  const response = await api.get(`/project-briefs/${id}/versions`);
  return response.data;
};

export const getProjectBriefAttachments = async (id: string): Promise<ProjectBriefAttachmentDTO[]> => {
  const response = await api.get(`/project-briefs/${id}/attachments`);
  return response.data;
};

export const uploadProjectBriefAttachment = async (id: string, file: File): Promise<ProjectBriefAttachmentDTO> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/project-briefs/${id}/attachments/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProjectBriefAttachment = async (id: string, attachmentId: string): Promise<void> => {
  await api.delete(`/project-briefs/${id}/attachments/${attachmentId}`);
};
