import { apiClient as api } from './Api';
import type { ProjectRole, ProjectTeamStatus } from './TechnicalProjectApi';
export interface AssignedProjectSummaryDTO {
  technicalProjectDepartmentId: string;
  technicalProjectId: string;
  projectCode: string;
  projectStatus: string;
  projectTitle: string;
  clientName: string;
  requiredScope: string;
  expectedEstimateSubmissionDate: string;
  formationStatus: string;
  projectTeamId: string | null;
  assignedAt: string;
}

export type TeamFormationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProjectTeamMemberDTO {
  id: string;
  employeeId: string;
  employeeNumber?: string;
  status: string;
  allocationId: string;
  overrideFlag: boolean;
}

export interface ProjectTeamDetailDTO {
  id: string;
  technicalProjectId: string;
  departmentId: string;
  teamName: string;
  status: ProjectTeamStatus;
  formationStatus: TeamFormationStatus;
  requiredScope?: string;
  projectCode?: string;
  projectTitle?: string;
  clientName?: string;
  expectedStartDate?: string | null;
  expectedDeliveryDate?: string | null;
  expectedEstimateSubmissionDate?: string | null;
  members?: ProjectTeamMemberDTO[];
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface AddTeamMemberRequest {
  employeeId: string;
  projectRole: ProjectRole;
  allocationStartDate: string; // ISO Date YYYY-MM-DD
  allocationEndDate: string; // ISO Date YYYY-MM-DD
  assignedHours: number;
  overrideRequested?: boolean;
  overrideReason?: string;
}

export interface UpdateTeamMemberRequest {
  projectRole?: ProjectRole;
  allocationStartDate?: string;
  allocationEndDate?: string;
  assignedHours?: number;
  overrideRequested?: boolean;
  overrideReason?: string;
}

export interface EmployeeAvailabilityDTO {
  employeeId: string;
  firstName?: string;
  lastName?: string;
  employeeName?: string;
  email?: string;
  jobTitle?: string;
  departmentId?: string;
  departmentName?: string;
  skills?: string[] | { id: string; name: string }[];
  currentAllocations?: {
    allocationId: string;
    projectId: string;
    projectName: string;
    startDate: string;
    endDate: string;
    assignedHours: number;
  }[];
  totalAllocatedHours?: number;
  availableHours?: number;
  available?: boolean;
  conflicts?: string[];
}


export const getDepartmentAssignedProjects = async (departmentId: string): Promise<{ content: AssignedProjectSummaryDTO[] }> => {
  const response = await api.get<{ content: AssignedProjectSummaryDTO[] }>(`/departments/${departmentId}/assigned-projects`);
  return response.data;
};

export const createProjectTeam = async (tpdId: string, teamName?: string, requiredScope?: string): Promise<ProjectTeamDetailDTO> => {
  const response = await api.post<ProjectTeamDetailDTO>(`/project-teams/department-assignments/${tpdId}`, null, {
    params: { teamName, requiredScope }
  });
  return response.data;
};

export const getProjectTeam = async (teamId: string): Promise<ProjectTeamDetailDTO> => {
  const response = await api.get<ProjectTeamDetailDTO>(`/project-teams/${teamId}`);
  return response.data;
};

export const addTeamMember = async (teamId: string, request: AddTeamMemberRequest): Promise<ProjectTeamDetailDTO> => {
  const response = await api.post<ProjectTeamDetailDTO>(`/project-teams/${teamId}/members`, request);
  return response.data;
};

export const updateTeamMember = async (teamId: string, memberId: string, request: UpdateTeamMemberRequest): Promise<ProjectTeamDetailDTO> => {
  const response = await api.put<ProjectTeamDetailDTO>(`/project-teams/${teamId}/members/${memberId}`, request);
  return response.data;
};

export const removeTeamMember = async (teamId: string, memberId: string): Promise<void> => {
  await api.delete(`/project-teams/${teamId}/members/${memberId}`);
};

export const markTeamReady = async (teamId: string): Promise<ProjectTeamDetailDTO> => {
  const response = await api.post<ProjectTeamDetailDTO>(`/project-teams/${teamId}/mark-ready`);
  return response.data;
};

export const searchEmployeeAvailability = async (
  departmentId: string | undefined,
  startDate: string,
  endDate: string,
  skillIds?: string[],
  proposedHours?: number
): Promise<EmployeeAvailabilityDTO[]> => {
  const params: Record<string, string | number | boolean | undefined> = { startDate, endDate };
  if (departmentId) params.departmentId = departmentId;
  if (skillIds && skillIds.length > 0) params.skillIds = skillIds.join(',');
  if (proposedHours) params.proposedHours = proposedHours;
  
  const response = await api.get<EmployeeAvailabilityDTO[]>('/employees/availability', { params });
  return response.data;
};





