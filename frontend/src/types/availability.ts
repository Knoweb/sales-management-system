import type { EmploymentStatus } from "./employee";

export interface AvailabilityResponse {
    employeeId: string;
    employeeNumber: string;
    employeeName: string;
    department: string;
    employmentStatus: EmploymentStatus;
    weeklyCapacityHours: number;
    requestedStartDate: string;
    requestedEndDate: string;
    estimatedCapacityHours: number;
    approvedLeaveHours: number;
    estimatedAvailableHours: number;
    availabilityPercentage: number;
    availabilityStatus: string;
}
