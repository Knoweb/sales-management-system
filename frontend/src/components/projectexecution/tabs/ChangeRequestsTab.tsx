/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectChangeRequestDTO } from '../../../api/projectExecutionApi';
import { Plus, Edit2 } from 'lucide-react';

interface Props { workspaceId: string; onRefreshSummary?: () => void; }

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

const ChangeRequestsTab: React.FC<Props> = ({ workspaceId, onRefreshSummary }) => {
    const [requests, setRequests] = useState<ProjectChangeRequestDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await projectExecutionApi.changeRequests.getByWorkspace(workspaceId);
            setRequests(res.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (form.isUpdate) {
                await projectExecutionApi.changeRequests.review(form.id, form.status, form.comment);
                if (onRefreshSummary) onRefreshSummary();
            } else {
                const payload = { ...form, workspaceId, estimatedCostImpact: Number(form.estimatedCostImpact), estimatedScheduleImpactDays: Number(form.estimatedScheduleImpactDays) };
                await projectExecutionApi.changeRequests.create(workspaceId, payload);
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
            <div style={{ marginBottom: 16 }}>
                <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> New Change</button>
            </div>
            {loading ? <p>Loading...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}><th>Title</th><th>Reason</th><th>Cost</th><th>Schedule Impact</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {requests.map((r: any) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{r.title}</td><td>{r.reason}</td><td>${r.estimatedCostImpact}</td><td>{r.estimatedScheduleImpactDays} days</td><td>{r.status}</td>
                                <td>
                                    {(r.status === 'SUBMITTED') && (
                                        <button onClick={() => { setForm({ isUpdate: true, id: r.id, status: 'APPROVED' }); setIsModalVisible(true); }}><Edit2 size={14}/></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>{form.isUpdate ? 'Review Change Request' : 'New Change Request'}</h3>
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
                                    <label>Title</label>
                                    <input required style={inputStyle} onChange={(e: any) => setForm({...form, title: e.target.value})} />
                                    <label>Description</label>
                                    <input required style={inputStyle} onChange={(e: any) => setForm({...form, description: e.target.value})} />
                                    <label>Reason</label>
                                    <input required style={inputStyle} onChange={(e: any) => setForm({...form, reason: e.target.value})} />
                                    <label>Cost Impact</label>
                                    <input type="number" style={inputStyle} onChange={(e: any) => setForm({...form, estimatedCostImpact: e.target.value})} />
                                    <label>Schedule Impact (Days)</label>
                                    <input type="number" style={inputStyle} onChange={(e: any) => setForm({...form, estimatedScheduleImpactDays: e.target.value})} />
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
export default ChangeRequestsTab;
