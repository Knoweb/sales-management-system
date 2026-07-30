export interface EmployeeQualification {
    id: string;
    qualificationName: string;
    institution?: string;
    fieldOfStudy?: string;
    qualificationLevel?: string;
    issueDate?: string;
    expiryDate?: string;
    credentialNumber?: string;
    notes?: string;
    verified: boolean;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeQualificationRequest {
    qualificationName: string;
    institution?: string;
    fieldOfStudy?: string;
    qualificationLevel?: string;
    issueDate?: string;
    expiryDate?: string;
    credentialNumber?: string;
    notes?: string;
    verified?: boolean;
}
