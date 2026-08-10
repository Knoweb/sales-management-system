import { apiClient as api } from '../services/Api';

const API_BASE = '/project-execution';

// Core DTOs
export interface ExecutionWorkspaceDTO {
    id: string;
    technicalProjectId: string;
    projectCode: string;
    projectManagerId?: string;
    projectManagerName?: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    plannedStartDate?: string;
    plannedEndDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    overallProgress: number;
    executionNotes?: string;
    inspectionStatus?: 'PENDING' | 'PASSED' | 'FAILED';
    inspectionDate?: string;
    inspectionNotes?: string;
    deliveryDate?: string;
    installationCompleted?: boolean;
    deliveryNotes?: string;
}

export interface ProjectClosureDTO {
    inspectionStatus: 'PENDING' | 'PASSED' | 'FAILED';
    inspectionDate?: string;
    inspectionNotes?: string;
    deliveryDate?: string;
    installationCompleted?: boolean;
    deliveryNotes?: string;
}

export interface ProjectTaskDTO {
    id: string;
    workspaceId: string;
    title: string;
    description?: string;
    departmentId?: string;
    departmentName?: string;
    assigneeId?: string;
    assigneeName?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
    plannedStartDate?: string;
    plannedEndDate?: string;
    actualStartDate?: string;
    actualEndDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    completionPercentage: number;
    executionStatus?: 'ON_TRACK' | 'DELAYED' | 'NO_UPDATE';
    delayDays?: number;
}

export interface ProjectEmployeeAllocationDTO {
    id?: string;
    workspaceId: string;
    employeeId: string;
    employeeName?: string;
    departmentId?: string;
    departmentName?: string;
    roleDescription: string;
    allocationPercentage?: number;
    allocatedHours?: number;
    allocationStartDate: string;
    allocationEndDate: string;
    isActive?: boolean;
}

export interface DailyProgressUpdateDTO {
    id?: string;
    workspaceId: string;
    taskId?: string;
    taskTitle?: string;
    progressDate: string;
    workCompleted: string;
    workPlannedNext?: string;
    blockers?: string;
    completionPercentage: number;
    hoursWorked: number;
    employeeName?: string;
    submittedAt?: string;
    supportRequired?: boolean;
    supportDetails?: string;
}

export interface ProjectLabourEntryDTO {
    id?: string;
    workspaceId: string;
    taskId: string;
    taskTitle?: string;
    employeeId: string;
    employeeName?: string;
    workDate: string;
    hours: number;
    description?: string;
    approvedById?: string;
    approvedByName?: string;
    createdAt?: string;
}

export interface ProjectMaterialUsageDTO {
    id?: string;
    workspaceId: string;
    taskId?: string;
    taskTitle?: string;
    materialCode: string;
    materialName: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost?: number;
    usageDate: string;
    approvedById?: string;
    createdAt?: string;
}

export interface ProjectIssueDTO {
    id?: string;
    workspaceId: string;
    taskId?: string;
    taskTitle?: string;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    ownerId?: string;
    ownerName?: string;
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    resolutionNote?: string;
    reportedBy?: string;
    reportedDate?: string;
}

export interface ProjectDelayReportDTO {
    id?: string;
    workspaceId: string;
    taskId?: string;
    taskTitle?: string;
    reason: string;
    expectedDelayDays: number;
    revisedExpectedDate: string;
    impactDescription?: string;
    mitigationPlan?: string;
    status?: 'REPORTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';
    createdAt?: string;
}

export interface ProjectExecutionAttachmentDTO {
    id?: string;
    workspaceId: string;
    taskId?: string;
    attachmentType: string;
    originalFileName?: string;
    storageReference?: string;
    mimeType?: string;
    fileSize?: number;
    description?: string;
    uploadedAt?: string;
}

export interface ProjectApprovalRequestDTO {
    id?: string;
    workspaceId: string;
    taskId?: string;
    taskTitle?: string;
    approvalType: string;
    title: string;
    description?: string;
    status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    decisionComment?: string;
    assignedApproverId?: string;
    assignedApproverName?: string;
    createdAt?: string;
}

export interface ProjectChangeRequestDTO {
    id?: string;
    workspaceId: string;
    title: string;
    description: string;
    reason: string;
    impactDescription?: string;
    estimatedCostImpact?: number;
    estimatedScheduleImpactDays?: number;
    status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED' | 'CANCELLED';
    decisionComment?: string;
    createdAt?: string;
}

export const projectExecutionApi = {
    workspaces: {
        create: (technicalProjectId: string, projectManagerId?: string) => 
            api.post<ExecutionWorkspaceDTO>(`${API_BASE}/workspaces`, null, { params: { technicalProjectId, projectManagerId } }),
        getAll: () => api.get<ExecutionWorkspaceDTO[]>(`${API_BASE}/workspaces`),
        getEligible: () => api.get<ExecutionWorkspaceDTO[]>(`${API_BASE}/workspaces/eligible`),
        getById: (id: string) => api.get<ExecutionWorkspaceDTO>(`${API_BASE}/workspaces/${id}`),
        setup: (id: string, data: Record<string, unknown>) => api.put<ExecutionWorkspaceDTO>(`${API_BASE}/workspaces/${id}/setup`, data),
    },
    tasks: {
        getByWorkspace: (workspaceId: string) => api.get<ProjectTaskDTO[]>(`${API_BASE}/tasks/workspace/${workspaceId}`),
        create: (workspaceId: string, data: Partial<ProjectTaskDTO>) => api.post<ProjectTaskDTO>(`${API_BASE}/tasks`, { ...data, workspaceId }),
        update: (taskId: string, data: Partial<ProjectTaskDTO>) => api.put<ProjectTaskDTO>(`${API_BASE}/tasks/${taskId}`, data),
        updateStatus: (taskId: string, status: string, completionPercentage?: number, comment?: string) => 
            api.put<ProjectTaskDTO>(`${API_BASE}/tasks/${taskId}/status`, null, { params: { status, completionPercentage, comment } }),
        addDependency: (taskId: string, predecessorId: string) => 
            api.post(`${API_BASE}/tasks/${taskId}/dependencies/${predecessorId}`)
    },
    resources: {
        getAllocations: (workspaceId: string) => api.get<ProjectEmployeeAllocationDTO[]>(`${API_BASE}/resources/allocations/workspace/${workspaceId}`),
        allocateEmployee: (workspaceId: string, data: Partial<ProjectEmployeeAllocationDTO>) => api.post(`${API_BASE}/resources/allocations`, { ...data, workspaceId }),
        deactivateAllocation: (id: string) => api.put(`${API_BASE}/resources/allocations/${id}/deactivate`)
    },
    monitoring: {
        getSummary: (workspaceId: string) => api.get<ProjectExecutionSummary>(`${API_BASE}/monitoring/workspace/${workspaceId}/summary`),
        getProgress: (workspaceId: string) => api.get<DailyProgressUpdateDTO[]>(`${API_BASE}/monitoring/progress/workspace/${workspaceId}`),
        submitProgress: (workspaceId: string, data: Partial<DailyProgressUpdateDTO>) => api.post(`${API_BASE}/monitoring/progress`, { ...data, workspaceId })
    },
    labour: {
        getByWorkspace: (workspaceId: string) => api.get<ProjectLabourEntryDTO[]>(`${API_BASE}/labour/workspace/${workspaceId}`),
        record: (workspaceId: string, data: Partial<ProjectLabourEntryDTO>) => api.post<ProjectLabourEntryDTO>(`${API_BASE}/labour`, { ...data, workspaceId }),
        approve: (id: string) => api.put(`${API_BASE}/labour/${id}/approve`),
        reject: (id: string) => api.delete(`${API_BASE}/labour/${id}/reject`)
    },
    materials: {
        getByWorkspace: (workspaceId: string) => api.get<ProjectMaterialUsageDTO[]>(`${API_BASE}/materials/workspace/${workspaceId}`),
        record: (workspaceId: string, data: Partial<ProjectMaterialUsageDTO>) => api.post<ProjectMaterialUsageDTO>(`${API_BASE}/materials`, { ...data, workspaceId }),
        approve: (id: string) => api.put(`${API_BASE}/materials/${id}/approve`),
        reject: (id: string) => api.delete(`${API_BASE}/materials/${id}/reject`)
    },
    issues: {
        getByWorkspace: (workspaceId: string) => api.get<ProjectIssueDTO[]>(`${API_BASE}/issues/workspace/${workspaceId}`),
        report: (workspaceId: string, data: Partial<ProjectIssueDTO>) => api.post<ProjectIssueDTO>(`${API_BASE}/issues`, { ...data, workspaceId }),
        updateStatus: (id: string, status: string, resolutionNote?: string) => api.put<ProjectIssueDTO>(`${API_BASE}/issues/${id}/status`, null, { params: { status, resolutionNote } })
    },
    delays: {
        getByWorkspace: (workspaceId: string) => api.get<ProjectDelayReportDTO[]>(`${API_BASE}/delays/workspace/${workspaceId}`),
        report: (workspaceId: string, data: Partial<ProjectDelayReportDTO>) => api.post<ProjectDelayReportDTO>(`${API_BASE}/delays`, { ...data, workspaceId })
    },
    attachments: {
        getByWorkspace: (workspaceId: string, type?: string) => api.get<ProjectExecutionAttachmentDTO[]>(`${API_BASE}/attachments/workspace/${workspaceId}`, { params: { type } }),
        save: (workspaceId: string, data: Partial<ProjectExecutionAttachmentDTO>) => api.post<ProjectExecutionAttachmentDTO>(`${API_BASE}/attachments`, { ...data, workspaceId }),
        delete: (id: string) => api.delete(`${API_BASE}/attachments/${id}`)
    },
    approvals: {
        getByWorkspace: (workspaceId: string) => api.get<ProjectApprovalRequestDTO[]>(`${API_BASE}/approvals/workspace/${workspaceId}`),
        request: (workspaceId: string, data: Partial<ProjectApprovalRequestDTO>) => api.post<ProjectApprovalRequestDTO>(`${API_BASE}/approvals`, { ...data, workspaceId }),
        updateDecision: (id: string, status: string, comment?: string) => api.put<ProjectApprovalRequestDTO>(`${API_BASE}/approvals/${id}/decision`, null, { params: { status, comment } })
    },
    changeRequests: {
        getByWorkspace: (workspaceId: string) => api.get<ProjectChangeRequestDTO[]>(`${API_BASE}/change-requests/workspace/${workspaceId}`),
        create: (workspaceId: string, data: Partial<ProjectChangeRequestDTO>) => api.post<ProjectChangeRequestDTO>(`${API_BASE}/change-requests`, { ...data, workspaceId }),
        review: (id: string, status: string, comment?: string) => api.put<ProjectChangeRequestDTO>(`${API_BASE}/change-requests/${id}/review`, null, { params: { status, comment } })
    },
    lookups: {
        employees: async () => {
            const res = await api.get<any[]>(`${API_BASE}/lookups/employees`);
            return res.data;
        },
        projectManagers: async () => {
            const res = await api.get<any[]>(`${API_BASE}/lookups/project-managers`);
            return res.data;
        },
        departments: async () => {
            const res = await api.get<any[]>(`${API_BASE}/lookups/departments`);
            return res.data;
        }
    },
    updateClosure: async (workspaceId: string, data: ProjectClosureDTO): Promise<ExecutionWorkspaceDTO> => {
        const response = await api.put<ExecutionWorkspaceDTO>(`${API_BASE}/workspaces/${workspaceId}/closure`, data);
        return response.data;
    }
};

export interface ProjectExecutionSummary {
    overallProgress: number; totalTasks: number; completedTasks: number; blockedTasks: number; overdueTasks: number;
    totalEstimatedHours: number; totalActualHours: number; labourCostTotal: number; materialCostTotal: number;
}
