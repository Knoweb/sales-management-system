/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { EmployeeSelector } from '../selectors/EmployeeSelector';
import { DepartmentSelector } from '../selectors/DepartmentSelector';


import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectEmployeeAllocationDTO } from '../../../api/projectExecutionApi';
import { Plus, XCircle } from 'lucide-react';

interface Props { workspaceId: string; onRefreshSummary?: () => void;  canEdit?: boolean; }

const modalStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#fff', padding: '24px', borderRadius: '8px',
    width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '4px'
};

const AllocationsTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [allocations, setAllocations] = useState<ProjectEmployeeAllocationDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await projectExecutionApi.resources.getAllocations(workspaceId);
            setAllocations(res.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                workspaceId,
                employeeId: form.employeeId,
                departmentId: form.departmentId,
                roleDescription: form.roleDescription,
                allocationPercentage: Number(form.allocationPercentage || 100),
                allocationStartDate: form.allocationStartDate,
                allocationEndDate: form.allocationEndDate
            };
            await projectExecutionApi.resources.allocateEmployee(workspaceId, payload);
            setIsModalVisible(false);
            fetchData();
            if (onRefreshSummary) onRefreshSummary();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                alert("You have read-only access. Only the Project Manager can make changes.");
            } else {
                alert('Failed to add allocation');
            }
        }
    };
    
    const deactivate = async (id: string) => {
        try {
            await projectExecutionApi.resources.deactivateAllocation(id);
            fetchData();
        } catch { alert('Failed'); }
    };

    return (
        <div>
        <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Employee Allocation</h2>
                    <p className="execution-tab-subtitle">Manage team members and their allocated hours for this project.</p>
                </div>
                <div className="execution-tab-actions">
            {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button">
                <Plus size={16} /> Add Employee
            </button>}
        </div>
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="execution-table-container">
                    <table className="execution-table">
                    <thead>
                        <tr>
                            <th>Employee</th><th>Role</th><th>Alloc %</th><th>Active</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocations.map((a: any) => (
                            <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{a.employeeName || a.employeeId}</td><td>{a.roleDescription}</td><td>{a.allocationPercentage}%</td>
                                <td>{a.isActive ? 'Yes' : 'No'}</td>
                                <td>{a.isActive && canEdit && <button onClick={() => deactivate(a.id!)}><XCircle size={14}/></button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
            
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Add Allocation</h3>
                        <form onSubmit={handleSave}>
                            <label>Department ID</label>
                            <DepartmentSelector value={form.departmentId} onChange={(val: any) => setForm({...form, departmentId: val})} disabled={!!form.employeeId} />
                            <label>Employee ID</label>
                            <EmployeeSelector value={form.employeeId} onChange={(val, opt) => setForm({...form, employeeId: val, departmentId: (opt?.originalData as any)?.departmentId || form.departmentId})} />
                            <label>Role</label>
                            <input required style={inputStyle} onChange={(e: any) => setForm({...form, roleDescription: e.target.value})} />
                            <label>Allocation %</label>
                            <input type="number" style={inputStyle} defaultValue={100} onChange={(e: any) => setForm({...form, allocationPercentage: e.target.value})} />
                            <label>Start Date</label>
                            <input type="date" required style={inputStyle} onChange={(e: any) => setForm({...form, allocationStartDate: e.target.value})} />
                            <label>End Date</label>
                            <input type="date" required style={inputStyle} onChange={(e: any) => setForm({...form, allocationEndDate: e.target.value})} />
                            
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsModalVisible(false)}>Cancel</button>
                                <button type="submit">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AllocationsTab;
