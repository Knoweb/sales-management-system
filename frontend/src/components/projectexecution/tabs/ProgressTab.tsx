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
                alert('Failed');
            }
        }
    };

    return (
        <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> Add Daily Update</button>}
        </div>
            {loading ? <p>Loading...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}><th>Date</th><th>Task</th><th>Employee</th><th>Completed</th><th>%</th></tr>
                    </thead>
                    <tbody>
                        {updates.map((u: any, i: any) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{u.progressDate}</td><td>{u.taskTitle}</td><td>{u.employeeName}</td><td>{u.workCompleted}</td><td>{u.completionPercentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Submit Progress</h3>
                        <form onSubmit={handleSave}>
                            <label>Employee ID</label>
                            <EmployeeSelector value={form.employeeId} onChange={(val: any) => setForm({...form, employeeId: val})} />
                            <label>Task</label>
                            <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any) => setForm({...form, taskId: val})} />
                            <label>Date</label>
                            <input type="date" required style={inputStyle} onChange={(e: any) => setForm({...form, progressDate: e.target.value})} />
                            <label>Work Completed</label>
                            <input required style={inputStyle} onChange={(e: any) => setForm({...form, workCompleted: e.target.value})} />
                            <label>Hours Worked</label>
                            <input type="number" required style={inputStyle} onChange={(e: any) => setForm({...form, hoursWorked: e.target.value})} />
                            <label>Task Completion %</label>
                            <input type="number" required style={inputStyle} onChange={(e: any) => setForm({...form, completionPercentage: e.target.value})} />
                            
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
export default ProgressTab;
