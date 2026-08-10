/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { TaskSelector } from '../selectors/TaskSelector';
import { EmployeeSelector } from '../selectors/EmployeeSelector';


import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { DailyProgressUpdateDTO } from '../../../api/projectExecutionApi';
import { Plus } from 'lucide-react';

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

const ProgressTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [updates, setUpdates] = useState<DailyProgressUpdateDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const progRes = await projectExecutionApi.monitoring.getProgress(workspaceId);
            setUpdates(progRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                employeeId: form.employeeId,
                ...form, workspaceId,
                hoursWorked: Number(form.hoursWorked),
                completionPercentage: Number(form.completionPercentage)
            };
            await projectExecutionApi.monitoring.submitProgress(workspaceId, payload);
            setIsModalVisible(false);
            fetchData();
            if (onRefreshSummary) onRefreshSummary();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                alert("You have read-only access. Only the Project Manager can make changes.");
            } else {
                const msg = error?.response?.data?.message || 'Failed';
                alert(msg);
            }
        }
    };

    return (
        <div>
            <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Daily Progress</h2>
                    <p className="execution-tab-subtitle">Record and review daily work progress for project tasks.</p>
                </div>
                <div className="execution-tab-actions">
                    {canEdit && (
                        <button 
                            onClick={() => { setForm({}); setIsModalVisible(true); }} 
                            className="execution-secondary-button"
                        >
                            <Plus size={16} /> Add Daily Update
                        </button>
                    )}
                </div>
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="execution-table-container">
                    <table className="execution-table">
                        <thead>
                            <tr>
                                <th>Date</th><th>Task</th><th>Employee</th><th>Work completed</th><th>Completion %</th><th>Hours</th><th>Blockers</th><th>Next-day plan</th><th>Support</th>
                            </tr>
                        </thead>
                        <tbody>
                            {updates.map((u: any, i: any) => (
                                <tr key={i}>
                                    <td className="nowrap">{u.progressDate}</td>
                                    <td className="wrap" style={{ minWidth: '150px' }}>{u.taskTitle}</td>
                                    <td className="nowrap">{u.employeeName}</td>
                                    <td className="wrap" style={{ minWidth: '200px' }}>{u.workCompleted}</td>
                                    <td className="nowrap">{u.completionPercentage}%</td>
                                    <td className="nowrap">{u.hoursWorked}</td>
                                    <td className="wrap">{u.blockers || '-'}</td>
                                    <td className="wrap">{u.workPlannedNext || '-'}</td>
                                    <td className="wrap">{u.supportRequired ? `Yes: ${u.supportDetails || ''}` : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Submit Progress</h3>
                        <form onSubmit={handleSave}>
                            <label>Employee ID</label>
                            <EmployeeSelector value={form.employeeId} onChange={(val: any) => setForm({...form, employeeId: val})} />
                            <label>Task</label>
                            <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any, option?: any) => {
                                const currentPct = option?.originalData?.completionPercentage ?? 0;
                                setForm({...form, taskId: val, completionPercentage: currentPct, _currentTaskPercentage: currentPct});
                            }} />
                            <label>Date</label>
                            <input type="date" required style={inputStyle} onChange={(e: any) => setForm({...form, progressDate: e.target.value})} />
                            <label>Work Completed</label>
                            <input required style={inputStyle} onChange={(e: any) => setForm({...form, workCompleted: e.target.value})} />
                            <label>Hours Worked</label>
                            <input type="number" required style={inputStyle} onChange={(e: any) => setForm({...form, hoursWorked: e.target.value})} />
                            <label>Task Completion %</label>
                            <input type="number" min="0" max="100" required style={inputStyle} value={form.completionPercentage ?? ''} onChange={(e: any) => setForm({...form, completionPercentage: e.target.value})} />
                            
                            {form.completionPercentage !== undefined && form._currentTaskPercentage !== undefined && Number(form.completionPercentage) < Number(form._currentTaskPercentage) && (
                                <div style={{ color: '#ed6c02', fontSize: '12px', marginTop: '-12px', marginBottom: '16px' }}>
                                    Completion is lower than the current progress.
                                </div>
                            )}
                            
                            <label>Problems / Blockers</label>
                            <input style={inputStyle} onChange={(e: any) => setForm({...form, blockers: e.target.value})} />

                            <label>Next-day plan</label>
                            <input style={inputStyle} onChange={(e: any) => setForm({...form, workPlannedNext: e.target.value})} />
                            
                            <label>Support Required</label>
                            <select style={inputStyle} value={form.supportRequired ? 'yes' : 'no'} onChange={(e: any) => setForm({...form, supportRequired: e.target.value === 'yes'})}>
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                            
                            {form.supportRequired && (
                                <>
                                    <label>Support Details</label>
                                    <textarea required style={{ ...inputStyle, minHeight: '60px' }} onChange={(e: any) => setForm({...form, supportDetails: e.target.value})} />
                                </>
                            )}
                            
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
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
export default ProgressTab;
