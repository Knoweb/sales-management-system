export interface Department {
    id: string;
    code: string;
    name: string;
    description?: string;
    active: boolean;
    systemSeeded: boolean;
    activeHod?: {
        id: string;
        employeeNumber: string;
        firstName: string;
        lastName: string;
        jobTitle: string;
        workEmail: string;
    };
    employeeCount: number;
    activeEmployeeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDepartmentRequest {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateDepartmentRequest {
    name: string;
    description?: string;
}

export interface AssignDepartmentHeadRequest {
    employeeId: string;
}
