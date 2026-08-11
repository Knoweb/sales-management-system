/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { TaskSelector } from '../selectors/TaskSelector';


import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectMaterialUsageDTO } from '../../../api/projectExecutionApi';
import { Plus, Check, X } from 'lucide-react';

interface Props { workspaceId: string; onRefreshSummary?: () => void;  canEdit?: boolean; }

const modalStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '8px',
    width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px', marginBottom: '16px', border: '1px solid var(--color-border-strong)', borderRadius: '4px'
};

const MaterialsTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [materials, setMaterials] = useState<ProjectMaterialUsageDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const matRes = await projectExecutionApi.materials.getByWorkspace(workspaceId);
            setMaterials(matRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = { 
                ...form, workspaceId, 
                quantity: Number(form.quantity), 
                unitCost: Number(form.unitCost)
            };
            await projectExecutionApi.materials.record(workspaceId, payload);
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
            <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Materials</h2>
                    <p className="execution-tab-subtitle">Track and manage materials usage and costs for this project.</p>
                </div>
                <div className="execution-tab-actions">
                {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> Record Material</button>}
            </div>
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="execution-table-container">
                    <table className="execution-table">
                    <thead>
                        <tr><th>Date</th><th>Material</th><th>Qty</th><th>Total</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {materials.map((r: any) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td>{r.usageDate}</td><td>{r.materialName}</td><td>{r.quantity} {r.unit}</td><td>${r.totalCost}</td>
                                <td>{r.approvedById ? 'Approved' : 'Pending'}</td>
                                <td>
                                    {!r.approvedById && (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => projectExecutionApi.materials.approve(r.id!).then(fetchData)}><Check size={14}/></button>
                                            <button onClick={() => projectExecutionApi.materials.reject(r.id!).then(fetchData)}><X size={14}/></button>
                                        </div>
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
                        <h3>Record Material Usage</h3>
                        <form onSubmit={handleSave}>
                            <label>Task</label>
                            <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any) => setForm({...form, taskId: val})} />
                            <label>Code</label>
                            <input required style={inputStyle} onChange={(e: any) => setForm({...form, materialCode: e.target.value})} />
                            <label>Name</label>
                            <input required style={inputStyle} onChange={(e: any) => setForm({...form, materialName: e.target.value})} />
                            <label>Quantity</label>
                            <input type="number" required style={inputStyle} onChange={(e: any) => setForm({...form, quantity: e.target.value})} />
                            <label>Unit</label>
                            <input required style={inputStyle} onChange={(e: any) => setForm({...form, unit: e.target.value})} />
                            <label>Unit Cost</label>
                            <input type="number" required style={inputStyle} onChange={(e: any) => setForm({...form, unitCost: e.target.value})} />
                            <label>Date</label>
                            <input type="date" required style={inputStyle} onChange={(e: any) => setForm({...form, usageDate: e.target.value})} />
                            
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
export default MaterialsTab;


