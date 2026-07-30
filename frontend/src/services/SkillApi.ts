import { apiClient } from './Api';
import type { Skill, CreateSkillRequest, UpdateSkillRequest } from '../types/skill';

export const SkillApi = {
    search: async (search?: string, active?: boolean, page: number = 0, size: number = 20) => {
        const response = await apiClient.get<{ content: Skill[] }>('/skills', {
            params: { search, active, page, size }
        });
        return response.data;
    },
    
    getById: async (id: string) => {
        const response = await apiClient.get<Skill>(`/skills/${id}`);
        return response.data;
    },
    
    create: async (data: CreateSkillRequest) => {
        const response = await apiClient.post<Skill>('/skills', data);
        return response.data;
    },
    
    update: async (id: string, data: UpdateSkillRequest) => {
        const response = await apiClient.put<Skill>(`/skills/${id}`, data);
        return response.data;
    },
    
    toggleStatus: async (id: string) => {
        await apiClient.patch(`/skills/${id}/status`);
    }
};
