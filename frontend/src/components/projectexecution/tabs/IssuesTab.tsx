/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { TaskSelector } from '../selectors/TaskSelector';


import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectIssueDTO } from '../../../api/projectExecutionApi';
import { Plus, Edit2 } from 'lucide-react';

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

const IssuesTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [issues, setIssues] = useState<ProjectIssueDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const issRes = await projectExecutionApi.issues.getByWorkspace(workspaceId);
            setIssues(issRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (form.isUpdate) {
                await projectExecutionApi.issues.updateStatus(form.id, form.status, form.resolutionNote);
            } else {
                await projectExecutionApi.issues.report(workspaceId, { ...form });
            }
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
                {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> Report Issue</button>}
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="execution-table-container">
                    <table className="execution-table">
                    <thead>
                        <tr><th>Title</th><th>Severity</th><th>Status</th><th>Task</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {issues.map((r: any) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{r.title}</td><td>{r.severity}</td><td>{r.status}</td><td>{r.taskTitle}</td>
                                <td>
                                    {canEdit && <button onClick={() => { setForm({ isUpdate: true, id: r.id, status: r.status }); setIsModalVisible(true); }}><Edit2 size={14}/></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
            
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>{form.isUpdate ? 'Update Issue' : 'Report Issue'}</h3>
                        <form onSubmit={handleSave}>
                            {form.isUpdate ? (
                                <>
                                    <label>Status</label>
                                    <select style={inputStyle} onChange={(e: any) => setForm({...form, status: e.target.value})}>
                                        <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
                                    </select>
                                    <label>Resolution Note</label>
                                    <input style={inputStyle} onChange={(e: any) => setForm({...form, resolutionNote: e.target.value})} />
                                </>
                            ) : (
                                <>
                                    <label>Task</label>
                                    <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any) => setForm({...form, taskId: val})} />
                                    <label>Title</label>
                                    <input required style={inputStyle} onChange={(e: any) => setForm({...form, title: e.target.value})} />
                                    <label>Description</label>
                                    <input required style={inputStyle} onChange={(e: any) => setForm({...form, description: e.target.value})} />
                                    <label>Severity</label>
                                    <select required style={inputStyle} onChange={(e: any) => setForm({...form, severity: e.target.value})}>
                                        <option value="">Select</option>
                                        <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                                    </select>
                                </>
                            )}
                            
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
export default IssuesTab;
