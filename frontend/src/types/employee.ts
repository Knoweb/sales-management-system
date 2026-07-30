import type { Department } from './department';
import type { User } from './user';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED' | 'INACTIVE';

export interface Employee {
    id: string;
    employeeNumber: string;
    user?: User;
    department?: Department;
    firstName: string;
    lastName: string;
    workEmail?: string;
    personalEmail?: string;
    contactNumber?: string;
    jobTitle: string;
    employmentType: EmploymentType;
    employmentStatus: EmploymentStatus;
    hireDate?: string;
    weeklyCapacityHours: number;
    notes?: string;
    departmentHead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEmployeeRequest {
    employeeNumber: string;
    departmentId: string;
    firstName: string;
    lastName: string;
    workEmail?: string;
    personalEmail?: string;
    contactNumber?: string;
    jobTitle: string;
    employmentType: EmploymentType;
    hireDate?: string;
    weeklyCapacityHours?: number;
    userId?: string;
}

export interface UpdateEmployeeRequest {
    departmentId: string;
    firstName: string;
    lastName: string;
    workEmail?: string;
    personalEmail?: string;
    contactNumber?: string;
    jobTitle: string;
    employmentType: EmploymentType;
    hireDate?: string;
    weeklyCapacityHours?: number;
    notes?: string;
}

export interface LinkUserRequest {
    userId: string;
}
