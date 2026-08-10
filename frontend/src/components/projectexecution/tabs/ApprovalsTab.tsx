/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { TaskSelector } from '../selectors/TaskSelector';


import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectApprovalRequestDTO } from '../../../api/projectExecutionApi';
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

const ApprovalsTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [requests, setRequests] = useState<ProjectApprovalRequestDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const reqRes = await projectExecutionApi.approvals.getByWorkspace(workspaceId);
            setRequests(reqRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (form.isUpdate) {
                await projectExecutionApi.approvals.updateDecision(form.id, form.status, form.comment);
                if (onRefreshSummary) onRefreshSummary();
            } else {
                await projectExecutionApi.approvals.request(workspaceId, { ...form });
            }
            setIsModalVisible(false);
            fetchData();
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
        <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Approval Requests</h2>
                    <p className="execution-tab-subtitle">Manage approval requests for various project activities.</p>
                </div>
                <div className="execution-tab-actions">
            {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> New Approval Request</button>}
        </div>
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="execution-table-container">
                    <table className="execution-table">
                    <thead>
                        <tr><th>Title</th><th>Type</th><th>Task</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {requests.map((r: any) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{r.title}</td><td>{r.approvalType}</td><td>{r.taskTitle}</td><td>{r.status}</td>
                                <td>
                                    {(r.status === 'SUBMITTED') && canEdit && (
                                        <button onClick={() => { setForm({ isUpdate: true, id: r.id, status: 'APPROVED' }); setIsModalVisible(true); }}><Edit2 size={14}/></button>
                                    )}
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
                        <h3>{form.isUpdate ? 'Review Request' : 'New Approval Request'}</h3>
                        <form onSubmit={handleSave}>
                            {form.isUpdate ? (
                                <>
                                    <label>Decision</label>
                                    <select style={inputStyle} onChange={(e: any) => setForm({...form, status: e.target.value})}>
                                        <option value="APPROVED">Approve</option><option value="REJECTED">Reject</option>
                                    </select>
                                    <label>Comment</label>
                                    <input style={inputStyle} onChange={(e: any) => setForm({...form, comment: e.target.value})} />
                                </>
                            ) : (
                                <>
                                    <label>Task</label>
                                    <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any) => setForm({...form, taskId: val})} />
                                    <label>Type</label>
                                    <input required style={inputStyle} onChange={(e: any) => setForm({...form, approvalType: e.target.value})} />
                                    <label>Title</label>
                                    <input required style={inputStyle} onChange={(e: any) => setForm({...form, title: e.target.value})} />
                                    <label>Description</label>
                                    <input style={inputStyle} onChange={(e: any) => setForm({...form, description: e.target.value})} />
                                    <label>Assignee ID (UUID)</label>
                                    <input style={inputStyle} onChange={(e: any) => setForm({...form, assignedApproverId: e.target.value})} />
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
export default ApprovalsTab;
