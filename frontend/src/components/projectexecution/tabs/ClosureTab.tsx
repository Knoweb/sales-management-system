import React, { useState, useEffect } from 'react';
import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ExecutionWorkspaceDTO, ProjectClosureDTO } from '../../../api/projectExecutionApi';
import { Save, AlertCircle, CheckCircle, Truck, ClipboardCheck, Info } from 'lucide-react';
import { AxiosError } from 'axios';

interface ClosureTabProps {
    workspace: ExecutionWorkspaceDTO;
    onRefresh: () => void;
    canEdit?: boolean;
}

const ClosureTab: React.FC<ClosureTabProps> = ({ workspace, onRefresh, canEdit = false }) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [localWorkspace, setLocalWorkspace] = useState<ExecutionWorkspaceDTO>(workspace);
    const [hasActiveTasks, setHasActiveTasks] = useState<boolean>(false);
    const [checkingTasks, setCheckingTasks] = useState<boolean>(true);
    
    const [formData, setFormData] = useState<ProjectClosureDTO>({
        inspectionStatus: 'PENDING',
        inspectionDate: '',
        inspectionNotes: '',
        deliveryDate: '',
        installationCompleted: false,
        deliveryNotes: ''
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalWorkspace(workspace);
        setFormData({
            inspectionStatus: workspace.inspectionStatus || 'PENDING',
            inspectionDate: workspace.inspectionDate || '',
            inspectionNotes: workspace.inspectionNotes || '',
            deliveryDate: workspace.deliveryDate || '',
            installationCompleted: workspace.installationCompleted || false,
            deliveryNotes: workspace.deliveryNotes || ''
        });

        let mounted = true;
        setCheckingTasks(true);
        projectExecutionApi.tasks.getByWorkspace(workspace.id)
            .then(res => {
                if (mounted) {
                    const tasks = res.data;
                    const active = tasks.some(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
                    setHasActiveTasks(active);
                    setCheckingTasks(false);
                }
            })
            .catch(err => {
                if (mounted) {
                    console.error('Failed to fetch tasks', err);
                    setCheckingTasks(false);
                }
            });

        return () => { mounted = false; };
    }, [workspace]);

    const handleSave = async () => {
        if (!canEdit) return;
        if (hasActiveTasks) {
            setError("Complete or cancel all active tasks before entering project closure details.");
            return;
        }
        
        setSaving(true);
        setError(null);
        setSuccess(null);

        // Ensure null serialization if preferred by backend by forcing unknown or any locally
        // The user said: "empty date -> null".
        const payloadData = {
            ...formData,
            inspectionDate: formData.inspectionDate ? formData.inspectionDate : null,
            deliveryDate: formData.deliveryDate ? formData.deliveryDate : null
        };

        try {
            const updatedWorkspace = await projectExecutionApi.updateClosure(workspace.id, payloadData as unknown as ProjectClosureDTO);
            setLocalWorkspace(updatedWorkspace);
            setFormData({
                inspectionStatus: updatedWorkspace.inspectionStatus || 'PENDING',
                inspectionDate: updatedWorkspace.inspectionDate || '',
                inspectionNotes: updatedWorkspace.inspectionNotes || '',
                deliveryDate: updatedWorkspace.deliveryDate || '',
                installationCompleted: updatedWorkspace.installationCompleted || false,
                deliveryNotes: updatedWorkspace.deliveryNotes || ''
            });
            setSuccess('Closure details updated successfully.');
            onRefresh();
        } catch (err: unknown) {
            console.error('Failed to update closure details', err);
            
            if (err && typeof err === 'object' && 'isAxiosError' in err) {
                const axiosErr = err as AxiosError<{ message?: string }>;
                if (axiosErr.response?.data?.message) {
                    setError(axiosErr.response.data.message);
                } else if (typeof axiosErr.response?.data === 'string') {
                    setError(axiosErr.response.data);
                } else {
                    setError('Failed to update closure details');
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to update closure details');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="execution-tab-content">
            <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Project Closure & Delivery</h2>
                    <div style={{ width: '100%', maxWidth: '800px', boxSizing: 'border-box', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: 500 }}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }} />
                        <span style={{ flex: '1 1 auto', wordBreak: 'normal', overflowWrap: 'break-word' }}>Complete final inspection and delivery details before closing the project.</span>
                    </div>
                </div>
                {canEdit && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <button 
                            className="execution-primary-button" 
                            onClick={handleSave} 
                            disabled={saving || hasActiveTasks || checkingTasks}
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Details'}
                        </button>
                        {hasActiveTasks && (
                            <div style={{ color: '#b91c1c', fontSize: '12px', fontWeight: 500, maxWidth: '200px', textAlign: 'right' }}>
                                Complete or cancel all active tasks to enable saving.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="execution-error-alert" style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
            
            {success && (
                <div className="execution-success-alert" style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#ecfdf5', color: '#047857', padding: '12px 16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <CheckCircle size={18} />
                    <span>{success}</span>
                </div>
            )}

            {/* Optional Summary Area */}
            <div className="execution-stats-grid" style={{ marginBottom: '24px' }}>
                <div className="execution-stat-card">
                    <div className="execution-stat-label">Inspection Status</div>
                    <div className="execution-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        {localWorkspace.inspectionStatus === 'PASSED' && <CheckCircle size={20} color="#059669" />}
                        {localWorkspace.inspectionStatus === 'FAILED' && <AlertCircle size={20} color="#dc2626" />}
                        {(!localWorkspace.inspectionStatus || localWorkspace.inspectionStatus === 'PENDING') && <ClipboardCheck size={20} color="#64748b" />}
                        <span style={{ fontSize: '16px' }}>{localWorkspace.inspectionStatus || 'PENDING'}</span>
                    </div>
                </div>
                <div className="execution-stat-card">
                    <div className="execution-stat-label">Delivery Date</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px' }}>
                        {localWorkspace.deliveryDate ? new Date(localWorkspace.deliveryDate).toLocaleDateString() : 'Not scheduled'}
                    </div>
                </div>
                <div className="execution-stat-card">
                    <div className="execution-stat-label">Installation</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px', color: localWorkspace.installationCompleted ? '#059669' : '#64748b' }}>
                        {localWorkspace.installationCompleted ? 'Completed' : 'Pending'}
                    </div>
                </div>
            </div>

            <div className="execution-details-grid">
                
                {/* Final Inspection Card */}
                <div className="execution-detail-card">
                    <div className="execution-detail-header">
                        <h3><ClipboardCheck size={18} /> Final Inspection</h3>
                    </div>
                    
                    <div className="execution-detail-body">
                        <div className="closure-form-group">
                            <label className="closure-form-label">Inspection Status</label>
                            <select 
                                className="closure-select" 
                                value={formData.inspectionStatus}
                                onChange={(e) => setFormData({ ...formData, inspectionStatus: e.target.value as ProjectClosureDTO['inspectionStatus'] })}
                                disabled={!canEdit}
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="PASSED">PASSED</option>
                                <option value="FAILED">FAILED</option>
                            </select>
                        </div>

                        <div className="closure-form-group">
                            <label className="closure-form-label">Inspection Date</label>
                            <input 
                                type="date"
                                className="closure-input"
                                value={formData.inspectionDate}
                                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                                disabled={!canEdit}
                            />
                        </div>

                        <div className="closure-form-group">
                            <label className="closure-form-label">Inspection Notes</label>
                            <textarea 
                                className="closure-textarea"
                                rows={4}
                                value={formData.inspectionNotes}
                                onChange={(e) => setFormData({ ...formData, inspectionNotes: e.target.value })}
                                disabled={!canEdit}
                                placeholder="Enter any notes from the final inspection..."
                            />
                        </div>
                    </div>
                </div>

                {/* Delivery Card */}
                <div className="execution-detail-card">
                    <div className="execution-detail-header">
                        <h3><Truck size={18} /> Delivery & Installation</h3>
                    </div>

                    <div className="execution-detail-body">
                        <div className="closure-form-group">
                            <label className="closure-form-label">Delivery Date</label>
                            <input 
                                type="date"
                                className="closure-input"
                                value={formData.deliveryDate}
                                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                                disabled={!canEdit}
                            />
                        </div>

                        <div className="closure-form-group">
                            <label className="closure-form-label">Installation Status</label>
                            <label className={`closure-checkbox-row ${!canEdit ? 'disabled' : ''}`}>
                                <div className="closure-checkbox-label">
                                    Installation Completed
                                </div>
                                <input 
                                    type="checkbox"
                                    className="closure-checkbox-input"
                                    checked={formData.installationCompleted}
                                    onChange={(e) => setFormData({ ...formData, installationCompleted: e.target.checked })}
                                    disabled={!canEdit}
                                />
                            </label>
                        </div>

                        <div className="closure-form-group">
                            <label className="closure-form-label">Delivery Notes</label>
                            <textarea 
                                className="closure-textarea"
                                rows={4}
                                value={formData.deliveryNotes}
                                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                                disabled={!canEdit}
                                placeholder="Enter any delivery or installation notes..."
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClosureTab;
