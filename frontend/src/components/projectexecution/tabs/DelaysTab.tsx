/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { TaskSelector } from '../selectors/TaskSelector';


import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectDelayReportDTO } from '../../../api/projectExecutionApi';
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

const DelaysTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [delays, setDelays] = useState<ProjectDelayReportDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const delRes = await projectExecutionApi.delays.getByWorkspace(workspaceId);
            setDelays(delRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = { ...form, workspaceId, expectedDelayDays: Number(form.expectedDelayDays) };
            await projectExecutionApi.delays.report(workspaceId, payload);
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
                {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> Report Delay</button>}
            </div>
            {loading ? <p>Loading...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}><th>Reason</th><th>Expected Delay (Days)</th><th>Revised Date</th><th>Task</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {delays.map((r: any) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{r.reason}</td><td>{r.expectedDelayDays}</td><td>{r.revisedExpectedDate}</td><td>{r.taskTitle}</td><td>{r.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Report Delay</h3>
                        <form onSubmit={handleSave}>
                            <label>Task</label>
                            <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any) => setForm({...form, taskId: val})} />
                            <label>Reason</label>
                            <input required style={inputStyle} onChange={(e: any) => setForm({...form, reason: e.target.value})} />
                            <label>Expected Delay (Days)</label>
                            <input type="number" required style={inputStyle} onChange={(e: any) => setForm({...form, expectedDelayDays: e.target.value})} />
                            <label>Revised Expected Date</label>
                            <input type="date" required style={inputStyle} onChange={(e: any) => setForm({...form, revisedExpectedDate: e.target.value})} />
                            
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
export default DelaysTab;
