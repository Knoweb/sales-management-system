export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
    id: string;
    code: string;
    name: string;
    description?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSkillRequest {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateSkillRequest {
    name: string;
    description?: string;
}

export interface EmployeeSkill {
    id: string;
    skill: Skill;
    proficiencyLevel: ProficiencyLevel;
    yearsOfExperience: number;
    verified: boolean;
    notes?: string;
    verifiedAt?: string;
    createdAt: string;
}

export interface AssignEmployeeSkillRequest {
    skillId: string;
    proficiencyLevel: ProficiencyLevel;
    yearsOfExperience?: number;
    notes?: string;
    verified?: boolean;
}

export interface UpdateEmployeeSkillRequest {
    proficiencyLevel: ProficiencyLevel;
    yearsOfExperience?: number;
    notes?: string;
    verified?: boolean;
}
