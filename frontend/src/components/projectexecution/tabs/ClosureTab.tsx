import React, { useState, useEffect } from 'react';
import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ExecutionWorkspaceDTO, ProjectClosureDTO, ProjectExecutionAttachmentDTO } from '../../../api/projectExecutionApi';
import { Save, AlertCircle, CheckCircle, Truck, ClipboardCheck, Info, ShieldCheck, FileText, Plus, Trash } from 'lucide-react';
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
    const [finalDocs, setFinalDocs] = useState<ProjectExecutionAttachmentDTO[]>([]);
    const [docsLoading, setDocsLoading] = useState<boolean>(false);
    const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

    const [formData, setFormData] = useState<ProjectClosureDTO>({
        inspectionStatus: 'PENDING',
        inspectionDate: '',
        inspectionNotes: '',
        deliveryDate: '',
        installationCompleted: false,
        deliveryNotes: '',
        clientAccepted: false,
        clientAcceptanceDate: '',
        clientAcceptanceNotes: '',
        warrantyStartDate: '',
        warrantyEndDate: '',
        warrantyNotes: ''
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
            deliveryNotes: workspace.deliveryNotes || '',
            clientAccepted: workspace.clientAccepted || false,
            clientAcceptanceDate: workspace.clientAcceptanceDate || '',
            clientAcceptanceNotes: workspace.clientAcceptanceNotes || '',
            warrantyStartDate: workspace.warrantyStartDate || '',
            warrantyEndDate: workspace.warrantyEndDate || '',
            warrantyNotes: workspace.warrantyNotes || ''
        });

        let mounted = true;
        setCheckingTasks(true);

        const fetchDocs = async () => {
            setDocsLoading(true);
            try {
                const res = await projectExecutionApi.attachments.getByWorkspace(workspace.id, 'FINAL_DOCUMENT');
                if (mounted) setFinalDocs(res.data);
            } catch (err) {
                console.error('Failed to load final docs', err);
            } finally {
                if (mounted) setDocsLoading(false);
            }
        };

        const fetchTasks = async () => {
            try {
                const res = await projectExecutionApi.tasks.getByWorkspace(workspace.id);
                if (mounted) {
                    const tasks = res.data;
                    const active = tasks.some(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
                    setHasActiveTasks(active);
                    setCheckingTasks(false);
                }
            } catch (err) {
                if (mounted) {
                    console.error('Failed to fetch tasks', err);
                    setCheckingTasks(false);
                }
            }
        };

        fetchDocs();
        fetchTasks();

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
            deliveryDate: formData.deliveryDate ? formData.deliveryDate : null,
            clientAcceptanceDate: formData.clientAcceptanceDate ? formData.clientAcceptanceDate : null,
            warrantyStartDate: formData.warrantyStartDate ? formData.warrantyStartDate : null,
            warrantyEndDate: formData.warrantyEndDate ? formData.warrantyEndDate : null
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
                deliveryNotes: updatedWorkspace.deliveryNotes || '',
                clientAccepted: updatedWorkspace.clientAccepted || false,
                clientAcceptanceDate: updatedWorkspace.clientAcceptanceDate || '',
                clientAcceptanceNotes: updatedWorkspace.clientAcceptanceNotes || '',
                warrantyStartDate: updatedWorkspace.warrantyStartDate || '',
                warrantyEndDate: updatedWorkspace.warrantyEndDate || '',
                warrantyNotes: updatedWorkspace.warrantyNotes || ''
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

    const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        setUploadingDoc(true);
        try {
            const payload: any = { 
                workspaceId: workspace.id, 
                attachmentType: 'FINAL_DOCUMENT', 
                originalFileName: file.name, 
                mimeType: file.type, 
                fileSize: file.size,
                description: 'Final Handover Document', 
                storageReference: 'mock-url-for-now-which-is-standard' 
            };
            await projectExecutionApi.attachments.save(workspace.id, payload);
            setSuccess('Document uploaded successfully.');
            // Refetch docs
            const res = await projectExecutionApi.attachments.getByWorkspace(workspace.id, 'FINAL_DOCUMENT');
            setFinalDocs(res.data);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Failed to upload document', err);
            setError('Failed to upload document.');
        } finally {
            setUploadingDoc(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await projectExecutionApi.attachments.delete(docId);
            const res = await projectExecutionApi.attachments.getByWorkspace(workspace.id, 'FINAL_DOCUMENT');
            setFinalDocs(res.data);
            setSuccess('Document deleted.');
        } catch (err) {
            console.error('Failed to delete document', err);
            setError('Failed to delete document.');
        }
    };

    const clientAcceptanceDisabled = !canEdit || formData.inspectionStatus !== 'PASSED' || !formData.deliveryDate || !formData.installationCompleted;
    const warrantyDocsDisabled = !canEdit || !formData.clientAccepted || !formData.clientAcceptanceDate;

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
            <div className="execution-stats-grid" style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Inspection Status</div>
                    <div className="execution-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        {localWorkspace.inspectionStatus === 'PASSED' && <CheckCircle size={20} color="#059669" />}
                        {localWorkspace.inspectionStatus === 'FAILED' && <AlertCircle size={20} color="#dc2626" />}
                        {(!localWorkspace.inspectionStatus || localWorkspace.inspectionStatus === 'PENDING') && <ClipboardCheck size={20} color="#64748b" />}
                        <span style={{ fontSize: '16px' }}>{localWorkspace.inspectionStatus || 'PENDING'}</span>
                    </div>
                </div>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Delivery Date</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px' }}>
                        {localWorkspace.deliveryDate ? new Date(localWorkspace.deliveryDate).toLocaleDateString() : 'Not scheduled'}
                    </div>
                </div>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Installation</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px', color: localWorkspace.installationCompleted ? '#059669' : '#64748b' }}>
                        {localWorkspace.installationCompleted ? 'Completed' : 'Pending'}
                    </div>
                </div>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Client Acceptance</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px', color: localWorkspace.clientAccepted ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {localWorkspace.clientAccepted ? (
                            <>
                                <CheckCircle size={18} color="#059669" />
                                <span>Accepted</span>
                            </>
                        ) : (
                            <span>Pending</span>
                        )}
                    </div>
                </div>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Warranty</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px', color: (localWorkspace.warrantyStartDate && localWorkspace.warrantyEndDate) ? '#0f172a' : '#64748b' }}>
                        {(localWorkspace.warrantyStartDate && localWorkspace.warrantyEndDate) 
                            ? `${new Date(localWorkspace.warrantyStartDate).toLocaleDateString()} - ${new Date(localWorkspace.warrantyEndDate).toLocaleDateString()}` 
                            : 'Not Set'}
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
                                value={formData.inspectionDate || ''}
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
                                value={formData.deliveryDate || ''}
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

                {/* Client Acceptance Card */}
                <div className="execution-detail-card">
                    <div className="execution-detail-header">
                        <h3><CheckCircle size={18} /> Client Acceptance</h3>
                    </div>
                    <div className="execution-detail-body">
                        <div className="closure-form-group">
                            <label className="closure-form-label">Client Accepted</label>
                            <label className={`closure-checkbox-row ${clientAcceptanceDisabled ? 'disabled' : ''}`}>
                                <div className="closure-checkbox-label">
                                    Yes, Client Accepted
                                </div>
                                <input 
                                    type="checkbox"
                                    className="closure-checkbox-input"
                                    checked={formData.clientAccepted}
                                    onChange={(e) => setFormData({ ...formData, clientAccepted: e.target.checked })}
                                    disabled={clientAcceptanceDisabled}
                                />
                            </label>
                            {clientAcceptanceDisabled && (
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                    Complete final inspection and delivery before client acceptance.
                                </div>
                            )}
                        </div>
                        
                        {formData.clientAccepted && (
                            <div className="closure-form-group">
                                <label className="closure-form-label">Acceptance Date</label>
                                <input 
                                    type="date"
                                    className="closure-input"
                                    value={formData.clientAcceptanceDate || ''}
                                    onChange={(e) => setFormData({ ...formData, clientAcceptanceDate: e.target.value })}
                                    disabled={clientAcceptanceDisabled}
                                />
                            </div>
                        )}

                        <div className="closure-form-group">
                            <label className="closure-form-label">Acceptance Notes</label>
                            <textarea 
                                className="closure-textarea"
                                rows={4}
                                value={formData.clientAcceptanceNotes}
                                onChange={(e) => setFormData({ ...formData, clientAcceptanceNotes: e.target.value })}
                                disabled={clientAcceptanceDisabled}
                                placeholder="Enter any notes regarding client acceptance..."
                            />
                        </div>
                    </div>
                </div>

                {/* Warranty Card */}
                <div className="execution-detail-card">
                    <div className="execution-detail-header">
                        <h3><ShieldCheck size={18} /> Warranty</h3>
                    </div>
                    <div className="execution-detail-body">
                        {warrantyDocsDisabled && (
                            <div style={{ padding: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                                Client acceptance is required before warranty and final documents.
                            </div>
                        )}
                        <div className="closure-form-group">
                            <label className="closure-form-label">Warranty Start Date</label>
                            <input 
                                type="date"
                                className="closure-input"
                                value={formData.warrantyStartDate || ''}
                                onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                                disabled={warrantyDocsDisabled}
                            />
                        </div>
                        <div className="closure-form-group">
                            <label className="closure-form-label">Warranty End Date</label>
                            <input 
                                type="date"
                                className="closure-input"
                                value={formData.warrantyEndDate || ''}
                                onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
                                disabled={warrantyDocsDisabled}
                            />
                        </div>
                        <div className="closure-form-group">
                            <label className="closure-form-label">Warranty Notes</label>
                            <textarea 
                                className="closure-textarea"
                                rows={4}
                                value={formData.warrantyNotes}
                                onChange={(e) => setFormData({ ...formData, warrantyNotes: e.target.value })}
                                disabled={warrantyDocsDisabled}
                                placeholder="Enter any warranty details..."
                            />
                        </div>
                    </div>
                </div>

                {/* Final Documents Card */}
                <div className="execution-detail-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="execution-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3><FileText size={18} /> Final Documents</h3>
                        {!warrantyDocsDisabled && (
                            <div>
                                <input 
                                    type="file" 
                                    id="finalDocUpload" 
                                    style={{ display: 'none' }} 
                                    onChange={handleUploadDoc} 
                                />
                                <button 
                                    className="execution-secondary-button" 
                                    onClick={() => document.getElementById('finalDocUpload')?.click()}
                                    disabled={uploadingDoc}
                                >
                                    <Plus size={14} /> {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="execution-detail-body" style={{ padding: '0' }}>
                        {warrantyDocsDisabled ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc' }}>
                                Client acceptance is required before warranty and final documents.
                            </div>
                        ) : docsLoading ? (
                            <div style={{ padding: '16px', color: '#64748b' }}>Loading documents...</div>
                        ) : finalDocs.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc' }}>
                                No final documents uploaded yet.
                            </div>
                        ) : (
                            <div className="execution-table-container" style={{ border: 'none', borderRadius: '0 0 12px 12px' }}>
                                <table className="execution-table">
                                    <thead>
                                        <tr>
                                            <th>File Name</th>
                                            <th>Size</th>
                                            <th>Uploaded At</th>
                                            {canEdit && <th style={{ width: '60px' }}>Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {finalDocs.map(doc => (
                                            <tr key={doc.id}>
                                                <td>{doc.originalFileName}</td>
                                                <td>{((doc.fileSize || 0) / 1024).toFixed(1)} KB</td>
                                                <td>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                                                {canEdit && (
                                                    <td>
                                                        <button 
                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                            onClick={() => handleDeleteDoc(doc.id!)}
                                                            title="Delete"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClosureTab;
