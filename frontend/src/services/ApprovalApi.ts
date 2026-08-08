import { apiClient, publicApiClient } from './Api';

export interface BdmApprovalDTO {
  id: string;
  opportunityId: string;
  projectBriefId: string;
  projectBriefVersionNumber: number;
  status: string;
  decisionMakerId?: string;
  decisionMakerName?: string;
  decisionDate?: string;
  createdAt: string;
  comments?: BdmApprovalCommentDTO[];
  opportunityNumber?: string;
  opportunityTitle?: string;
  clientName?: string;
  assignedSalesOfficerId?: string;
  assignedSalesOfficerName?: string;
}

export interface ProjectBriefVersionDTO {
  id: string;
  projectBriefId: string;
  versionNumber: number;
  snapshot: string;
  changeSummary?: string;
  submittedVersion: boolean;
  createdAt: string;
  createdById?: string;
  createdByName?: string;
}

export interface ProjectBriefAttachmentDTO {
  id: string;
  projectBriefId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
  createdById?: string;
  createdByName?: string;
}

export interface BdmApprovalCommentDTO {
  id: string;
  comment: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface ClientVerificationDTO {
  id: string;
  opportunityId: string;
  projectBriefId: string;
  projectBriefVersionNumber: number;
  status: string;
  verifierName?: string;
  verifierEmail?: string;
  clientComments?: string;
  requestedChanges?: string;
  digitalConfirmation: boolean;
  expiresAt: string;
  decisionDate?: string;
  createdAt: string;
  recoverable?: boolean;
  projectBriefSnapshot?: string;
  recordedByName?: string;
}

export interface WorkflowHistoryDTO {
  id: string;
  opportunityId: string;
  projectBriefId: string;
  projectBriefVersionNumber: number;
  actorId?: string;
  actorName?: string;
  action: string;
  previousState?: string;
  newState?: string;
  comments?: string;
  createdAt: string;
}

export const getBdmApprovals = async (opportunityId: string): Promise<BdmApprovalDTO[]> => {
  const response = await apiClient.get(`/opportunities/${opportunityId}/bdm-approvals`);
  return response.data;
};

export const getPendingBdmApprovals = async (): Promise<BdmApprovalDTO[]> => {
  const response = await apiClient.get('/bdm-approvals');
  if (response.data && Array.isArray(response.data.content)) {
    return response.data.content;
  }
  return response.data || [];
};

export const getBdmApprovalById = async (id: string): Promise<BdmApprovalDTO> => {
  const response = await apiClient.get(`/bdm-approvals/${id}`);
  return response.data;
};

export const getProjectBriefVersion = async (briefId: string, versionNumber: number): Promise<ProjectBriefVersionDTO> => {
  const response = await apiClient.get(`/project-briefs/${briefId}/versions/${versionNumber}`);
  return response.data;
};

export const getProjectBriefAttachments = async (briefId: string): Promise<ProjectBriefAttachmentDTO[]> => {
  const response = await apiClient.get(`/project-briefs/${briefId}/attachments`);
  return response.data;
};

export const bdmApprove = async (briefId: string, comments?: string): Promise<BdmApprovalDTO> => {
  const response = await apiClient.post(`/project-briefs/${briefId}/bdm-approve`, { comments });
  return response.data;
};

export const bdmReject = async (briefId: string, comments: string): Promise<BdmApprovalDTO> => {
  const response = await apiClient.post(`/project-briefs/${briefId}/bdm-reject`, { comments });
  return response.data;
};

export const bdmReturnForRevision = async (briefId: string, comments: string): Promise<BdmApprovalDTO> => {
  const response = await apiClient.post(`/project-briefs/${briefId}/bdm-return`, { comments });
  return response.data;
};

export const bdmRequestInfo = async (briefId: string, comments: string): Promise<BdmApprovalDTO> => {
  const response = await apiClient.post(`/project-briefs/${briefId}/bdm-request-info`, { comments });
  return response.data;
};

export const createClientVerification = async (briefId: string, data?: { verifierName?: string; verifierEmail?: string; expiresAt?: string; opportunityId?: string }): Promise<{ token: string }> => {
  const response = await apiClient.post(`/project-briefs/${briefId}/create-verification`, data || {});
  return response.data;
};

export const getClientVerifications = async (opportunityId: string): Promise<ClientVerificationDTO[]> => {
  const response = await apiClient.get(`/opportunities/${opportunityId}/client-verifications`);
  return response.data;
};

export const getVerificationByToken = async (token: string): Promise<ClientVerificationDTO> => {
  const response = await publicApiClient.get(`/public/client-verifications/${token}`);
  return response.data;
};

export const confirmVerification = async (token: string, data: { verifierName: string; verifierEmail?: string; comments?: string; digitalConfirmation: boolean }): Promise<ClientVerificationDTO> => {
  const response = await publicApiClient.post(`/public/client-verifications/${token}/confirm`, data);
  return response.data;
};

export const requestChangesVerification = async (token: string, data: { verifierName: string; verifierEmail?: string; comments: string; digitalConfirmation: boolean }): Promise<ClientVerificationDTO> => {
  const response = await publicApiClient.post(`/public/client-verifications/${token}/request-changes`, data);
  return response.data;
};

export const rejectVerification = async (token: string, data: { verifierName: string; verifierEmail?: string; comments: string; digitalConfirmation: boolean }): Promise<ClientVerificationDTO> => {
  const response = await publicApiClient.post(`/public/client-verifications/${token}/reject`, data);
  return response.data;
};

export const getWorkflowHistory = async (opportunityId: string): Promise<WorkflowHistoryDTO[]> => {
  const response = await apiClient.get(`/opportunities/${opportunityId}/approval-history`);
  return response.data;
};

export const regenerateClientVerification = async (id: string): Promise<{ token: string }> => {
  const response = await apiClient.post(`/client-verifications/${id}/regenerate`);
  return response.data;
};

export const revokeClientVerification = async (id: string): Promise<void> => {
  await apiClient.post(`/client-verifications/${id}/revoke`);
};

export const getVerificationLink = async (id: string): Promise<{ token: string }> => {
  const response = await apiClient.get(`/client-verifications/${id}/link`);
  return response.data;
};

export const downloadClientApprovalDocument = async (opportunityId: string): Promise<Blob> => {
  const response = await apiClient.get(`/opportunities/${opportunityId}/client-approval-document`, {
    responseType: 'blob',
  });
  return response.data;
};

export const markClientConfirmed = async (opportunityId: string): Promise<ClientVerificationDTO> => {
  const response = await apiClient.post(`/opportunities/${opportunityId}/mark-client-confirmed`);
  return response.data;
};
