export type LeaveType = 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface EmployeeLeave {
    id: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    partialDay: boolean;
    leaveHours?: number;
    status: LeaveStatus;
    reason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeLeaveRequest {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    partialDay?: boolean;
    leaveHours?: number;
    reason?: string;
}
