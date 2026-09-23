/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectEmployeeAllocationDTO } from '../../../api/projectExecutionApi';

interface Props { workspaceId: string; }

const formatPeriod = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    try {
        const d1 = new Date(start);
        const d2 = new Date(end);
        const y1 = d1.getFullYear();
        const y2 = d2.getFullYear();
        const m1 = d1.toLocaleDateString('en-US', { month: 'short' });
        const m2 = d2.toLocaleDateString('en-US', { month: 'short' });
        const day1 = d1.getDate();
        const day2 = d2.getDate();
        
        if (y1 === y2) {
            return `${m1} ${day1} – ${m2} ${day2}, ${y1}`;
        }
        return `${m1} ${day1}, ${y1} – ${m2} ${day2}, ${y2}`;
    } catch {
        return `${start} – ${end}`;
    }
};

const getStatusInfo = (start?: string, end?: string) => {
    if (!start || !end) return { label: 'Unknown', colorClass: 'bg-gray-100 text-gray-800' };
    const today = new Date();
    today.setHours(0,0,0,0);
    const d1 = new Date(start);
    d1.setHours(0,0,0,0);
    const d2 = new Date(end);
    d2.setHours(23,59,59,999);
    
    if (today < d1) return { label: 'Upcoming', colorClass: 'bg-blue-100 text-blue-800' };
    if (today > d2) return { label: 'Ended', colorClass: 'bg-gray-100 text-gray-600' };
    return { label: 'Active', colorClass: 'bg-green-100 text-green-800' };
};

const AllocationsTab: React.FC<Props> = ({ workspaceId }) => {
    const [allocations, setAllocations] = useState<ProjectEmployeeAllocationDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await projectExecutionApi.resources.getAllocations(workspaceId);
            setAllocations(res.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    return (
        <div>
        <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Employee Allocation</h2>
                    <p className="execution-tab-subtitle">View team members allocated to this project.</p>
                </div>
            </div>
            {loading ? <p>Loading...</p> : allocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                    <p className="text-gray-500 font-medium">Project team has not been confirmed yet or has no members.</p>
                    <p className="text-gray-400 text-sm mt-2">Team members must be added and marked ready through the HOD Project Team Builder.</p>
                </div>
            ) : (
                <div className="execution-table-container">
                    <table className="execution-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Project Role</th>
                            <th>Assigned Hours</th>
                            <th>Allocation Period</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocations.map((a: any) => {
                            const status = getStatusInfo(a.allocationStartDate, a.allocationEndDate);
                            return (
                                <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td>{a.employeeName || a.employeeId}</td>
                                    <td>{a.roleDescription?.replace(/_/g, ' ')}</td>
                                    <td>{a.allocatedHours != null ? `${a.allocatedHours} hrs` : '-'}</td>
                                    <td>{formatPeriod(a.allocationStartDate, a.allocationEndDate)}</td>
                                    <td>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.colorClass}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};
export default AllocationsTab;


