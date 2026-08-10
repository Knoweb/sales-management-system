/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectTaskDTO } from '../../../api/projectExecutionApi';
import { Plus, Edit2 } from 'lucide-react';
import { EmployeeSelector } from '../selectors/EmployeeSelector';

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

const TasksTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [tasks, setTasks] = useState<ProjectTaskDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<ProjectTaskDTO | null>(null);
    const [form, setForm] = useState<any>({});

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await projectExecutionApi.tasks.getByWorkspace(workspaceId);
            setTasks(res.data);
        } catch (error: any) {
            if (error?.response?.status === 403) {
                alert("You have read-only access. Only the Project Manager can make changes.");
            } else {
                alert('Failed to load tasks');
            }
        }
        setLoading(false);
    };

    useEffect(() => { fetchTasks(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                workspaceId,
                title: form.title,
                description: form.description,
                priority: form.priority || 'MEDIUM',
                status: form.status || 'TODO',
                estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
                plannedStartDate: form.plannedStartDate,
                plannedEndDate: form.plannedEndDate,
                assigneeId: form.assigneeId
            };
            if (editingTask) {
                await projectExecutionApi.tasks.update(editingTask.id, payload);
            } else {
                await projectExecutionApi.tasks.create(workspaceId, payload);
            }
            setIsModalVisible(false);
            fetchTasks();
            if (onRefreshSummary) onRefreshSummary();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                alert("You have read-only access. Only the Project Manager can make changes.");
            } else {
                const msg = error?.response?.data?.message || 'Failed to save task';
                alert(msg);
            }
        }
    };

    return (
        <div>
            <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Tasks</h2>
                    <p className="execution-tab-subtitle">Manage project tasks, progress, priorities and due dates.</p>
                </div>
                <div className="execution-tab-actions">
                    {canEdit && (
                        <button 
                            onClick={() => { setEditingTask(null); setForm({}); setIsModalVisible(true); }} 
                            className="execution-secondary-button"
                        >
                            <Plus size={16} /> Create Task
                        </button>
                    )}
                </div>
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="execution-table-container">
                    <table className="execution-table">
                        <thead>
                            <tr>
                                <th>Title</th><th>Status</th><th>Execution</th><th>Due Date</th><th>Priority</th><th>Progress</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((t: any) => (
                                <tr key={t.id}>
                                    <td>{t.title}</td><td>{t.status}</td>
                                    <td>
                                        {t.executionStatus === 'DELAYED' && <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>DELAYED ({t.delayDays} days)</span>}
                                        {t.executionStatus === 'NO_UPDATE' && <span style={{ color: '#ed6c02', fontWeight: 'bold' }}>NO UPDATE</span>}
                                        {t.executionStatus === 'ON_TRACK' && <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>ON TRACK</span>}
                                        {t.status === 'COMPLETED' && <span style={{ color: '#64748b' }}>Completed</span>}
                                        {t.status === 'CANCELLED' && <span style={{ color: '#64748b' }}>Cancelled</span>}
                                    </td>
                                    <td>{t.plannedEndDate || 'N/A'}</td>
                                    <td>{t.priority}</td><td>{t.completionPercentage || 0}%</td>
                                    <td>{canEdit && <button onClick={() => { setEditingTask(t); setForm(t); setIsModalVisible(true); }}><Edit2 size={14}/></button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                        <form onSubmit={handleSave}>
                            <label>Title</label>
                            <input required style={inputStyle} value={form.title || ''} onChange={(e: any) => setForm({...form, title: e.target.value})} />
                            
                            <label>Due Date</label>
                            <input type="date" required style={inputStyle} value={form.plannedEndDate || ''} onChange={(e: any) => setForm({...form, plannedEndDate: e.target.value})} />
                            
                            <label>Priority</label>
                            <select style={inputStyle} value={form.priority || 'MEDIUM'} onChange={(e: any) => setForm({...form, priority: e.target.value})}>
                                <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                            </select>
                            
                            <label>Estimated Hours</label>
                            <input type="number" style={inputStyle} value={form.estimatedHours || ''} onChange={(e: any) => setForm({...form, estimatedHours: e.target.value})} />
                            
                            <label>Assignee (Optional)</label>
                            <EmployeeSelector value={form.assigneeId} onChange={(val: any) => setForm({...form, assigneeId: val})} />
                            
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
export default TasksTab;
