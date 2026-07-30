import { apiClient } from './Api';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest, LinkUserRequest } from '../types/employee';
import type { AssignEmployeeSkillRequest, EmployeeSkill, UpdateEmployeeSkillRequest } from '../types/skill';
import type { EmployeeQualification, EmployeeQualificationRequest } from '../types/qualification';
import type { EmployeeLeave, EmployeeLeaveRequest, LeaveStatus } from '../types/leave';
import type { AvailabilityResponse } from '../types/availability';

export const EmployeeApi = {
    search: async (search?: string, departmentId?: string, employmentStatus?: string, employmentType?: string, skillId?: string, page: number = 0, size: number = 20) => {
        const response = await apiClient.get<{ content: Employee[] }>('/employees', {
            params: { search, departmentId, employmentStatus, employmentType, skillId, page, size }
        });
        return response.data;
    },

    create: async (data: CreateEmployeeRequest) => {
        const response = await apiClient.post<Employee>('/employees', data);
        return response.data;
    },

    getMyProfile: async () => {
        const response = await apiClient.get<Employee>('/employees/me');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<Employee>(`/employees/${id}`);
        return response.data;
    },

    update: async (id: string, data: UpdateEmployeeRequest) => {
        const response = await apiClient.put<Employee>(`/employees/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        await apiClient.patch(`/employees/${id}/status`, null, { params: { status } });
    },

    linkUser: async (id: string, data: LinkUserRequest) => {
        await apiClient.post(`/employees/${id}/user-link`, data);
    },

    unlinkUser: async (id: string) => {
        await apiClient.delete(`/employees/${id}/user-link`);
    },

    // Skills
    getSkills: async (id: string) => {
        const response = await apiClient.get<EmployeeSkill[]>(`/employees/${id}/skills`);
        return response.data;
    },

    assignSkill: async (id: string, data: AssignEmployeeSkillRequest) => {
        const response = await apiClient.post<EmployeeSkill>(`/employees/${id}/skills`, data);
        return response.data;
    },

    updateSkill: async (id: string, skillId: string, data: UpdateEmployeeSkillRequest) => {
        const response = await apiClient.put<EmployeeSkill>(`/employees/${id}/skills/${skillId}`, data);
        return response.data;
    },

    removeSkill: async (id: string, skillId: string) => {
        await apiClient.delete(`/employees/${id}/skills/${skillId}`);
    },

    // Qualifications
    getQualifications: async (id: string) => {
        const response = await apiClient.get<EmployeeQualification[]>(`/employees/${id}/qualifications`);
        return response.data;
    },

    addQualification: async (id: string, data: EmployeeQualificationRequest) => {
        const response = await apiClient.post<EmployeeQualification>(`/employees/${id}/qualifications`, data);
        return response.data;
    },

    updateQualification: async (id: string, qualificationId: string, data: EmployeeQualificationRequest) => {
        const response = await apiClient.put<EmployeeQualification>(`/employees/${id}/qualifications/${qualificationId}`, data);
        return response.data;
    },

    removeQualification: async (id: string, qualificationId: string) => {
        await apiClient.delete(`/employees/${id}/qualifications/${qualificationId}`);
    },

    // Leaves
    getLeaves: async (id: string) => {
        const response = await apiClient.get<EmployeeLeave[]>(`/employees/${id}/leaves`);
        return response.data;
    },

    requestLeave: async (id: string, data: EmployeeLeaveRequest) => {
        const response = await apiClient.post<EmployeeLeave>(`/employees/${id}/leaves`, data);
        return response.data;
    },

    updateLeaveStatus: async (id: string, leaveId: string, status: LeaveStatus) => {
        const response = await apiClient.put<EmployeeLeave>(`/employees/${id}/leaves/${leaveId}/status`, null, { params: { status } });
        return response.data;
    },

    cancelLeave: async (id: string, leaveId: string) => {
        await apiClient.delete(`/employees/${id}/leaves/${leaveId}`);
    },

    // Availability
    checkAvailability: async (id: string, startDate: string, endDate: string) => {
        const response = await apiClient.get<AvailabilityResponse>(`/employees/${id}/availability`, {
            params: { startDate, endDate }
        });
        return response.data;
    }
};
