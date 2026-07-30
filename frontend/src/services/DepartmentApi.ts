import { apiClient } from './Api';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest, AssignDepartmentHeadRequest } from '../types/department';

export const DepartmentApi = {
    search: async (search?: string, active?: boolean, page: number = 0, size: number = 20) => {
        const response = await apiClient.get<{ content: Department[] }>('/departments', {
            params: { search, active, page, size }
        });
        return response.data;
    },
    
    getById: async (id: string) => {
        const response = await apiClient.get<Department>(`/departments/${id}`);
        return response.data;
    },
    
    create: async (data: CreateDepartmentRequest) => {
        const response = await apiClient.post<Department>('/departments', data);
        return response.data;
    },
    
    update: async (id: string, data: UpdateDepartmentRequest) => {
        const response = await apiClient.put<Department>(`/departments/${id}`, data);
        return response.data;
    },
    
    toggleStatus: async (id: string) => {
        await apiClient.patch(`/departments/${id}/status`);
    },

    assignHead: async (id: string, data: AssignDepartmentHeadRequest) => {
        await apiClient.post(`/departments/${id}/head`, data);
    }
};
