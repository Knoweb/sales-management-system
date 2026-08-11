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
    const [closing, setClosing] = useState<boolean>(false);

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
            await projectExecutionApi.attachments.upload(workspace.id, 'FINAL_DOCUMENT', file, 'Final Handover Document');
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

    const handleDownloadDoc = async (docId: string, originalFileName: string) => {
        try {
            const response = await projectExecutionApi.attachments.download(docId);
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = originalFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download document', err);
            setError('Failed to download document. It may have been removed or you may lack permissions.');
        }
    };

    const handleCloseProject = async () => {
        if (!window.confirm('Are you sure you want to permanently close this project? This action cannot be undone.')) return;
        setClosing(true);
        setError(null);
        try {
            const updatedWorkspace = await projectExecutionApi.workspaces.close(workspace.id);
            setLocalWorkspace(updatedWorkspace);
            setSuccess('Project closed successfully.');
            onRefresh();
        } catch (err: any) {
            console.error('Failed to close project', err);
            setError(err.response?.data?.message || err.response?.data || 'Failed to close project.');
        } finally {
            setClosing(false);
        }
    };

    const isClosed = localWorkspace.status === 'CLOSED';
    const isClientAccepted = localWorkspace.clientAccepted === true;
    const upstreamLocked = !canEdit || isClientAccepted || isClosed;

    const clientAcceptanceDisabled = !canEdit || formData.inspectionStatus !== 'PASSED' || !formData.deliveryDate || !formData.installationCompleted || isClosed;
    const clientAcceptanceIncomplete = !formData.clientAccepted || !formData.clientAcceptanceDate;
    const warrantyDocsDisabled = !canEdit || clientAcceptanceIncomplete || isClosed;

    const chkNoActiveTasks = !hasActiveTasks && !checkingTasks;
    const chkInspectionPassed = localWorkspace.inspectionStatus === 'PASSED';
    const chkDeliveryCompleted = !!localWorkspace.deliveryDate && localWorkspace.installationCompleted === true;
    const chkClientAccepted = localWorkspace.clientAccepted === true && !!localWorkspace.clientAcceptanceDate;
    const chkFinalDocAvailable = finalDocs.length > 0;

    const canClose = chkNoActiveTasks && chkInspectionPassed && chkDeliveryCompleted && chkClientAccepted && chkFinalDocAvailable;

    return (
        <div className="execution-tab-content">
            <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Project Closure & Delivery</h2>
                    <div style={{ width: '100%', maxWidth: '800px', boxSizing: 'border-box', backgroundColor: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: 500 }}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-text-muted)' }} />
                        <span style={{ flex: '1 1 auto', wordBreak: 'normal', overflowWrap: 'break-word' }}>Complete final inspection and delivery details before closing the project.</span>
                    </div>
                </div>
                {canEdit && !isClosed && (
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
                            <div style={{ color: 'var(--color-danger)', fontSize: '12px', fontWeight: 500, maxWidth: '200px', textAlign: 'right' }}>
                                Complete or cancel all active tasks to enable saving.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isClosed && (
                <div style={{ marginBottom: '24px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-bg)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <ShieldCheck size={32} color="var(--color-success)" />
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-success)', marginBottom: '4px' }}>Project Closed</div>
                        <div style={{ fontSize: '14px', color: 'var(--color-success)' }}>
                            Closed Date: {localWorkspace.closedAt ? new Date(localWorkspace.closedAt).toLocaleString() : 'N/A'}<br/>
                            Closed By: {localWorkspace.closedByName || 'Unknown'}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="execution-error-alert" style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-danger-bg)' }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
            
            {success && (
                <div className="execution-success-alert" style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-success-bg)' }}>
                    <CheckCircle size={18} />
                    <span>{success}</span>
                </div>
            )}

            {/* Optional Summary Area */}
            <div className="execution-stats-grid" style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Inspection Status</div>
                    <div className="execution-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        {localWorkspace.inspectionStatus === 'PASSED' && <CheckCircle size={20} color="var(--color-success)" />}
                        {localWorkspace.inspectionStatus === 'FAILED' && <AlertCircle size={20} color="var(--color-danger)" />}
                        {(!localWorkspace.inspectionStatus || localWorkspace.inspectionStatus === 'PENDING') && <ClipboardCheck size={20} color="var(--color-text-muted)" />}
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
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px', color: localWorkspace.installationCompleted ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {localWorkspace.installationCompleted ? 'Completed' : 'Pending'}
                    </div>
                </div>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Client Acceptance</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px', color: localWorkspace.clientAccepted ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {localWorkspace.clientAccepted ? (
                            <>
                                <CheckCircle size={18} color="var(--color-success)" />
                                <span>Accepted</span>
                            </>
                        ) : (
                            <span>Pending</span>
                        )}
                    </div>
                </div>
                <div className="execution-stat-card" style={{ flex: '1 1 180px' }}>
                    <div className="execution-stat-label">Warranty</div>
                    <div className="execution-stat-value" style={{ fontSize: '16px', marginTop: '4px', color: (localWorkspace.warrantyStartDate && localWorkspace.warrantyEndDate) ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
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
                                disabled={upstreamLocked}
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
                                disabled={upstreamLocked}
                            />
                        </div>

                        <div className="closure-form-group">
                            <label className="closure-form-label">Inspection Notes</label>
                            <textarea 
                                className="closure-textarea"
                                rows={4}
                                value={formData.inspectionNotes}
                                onChange={(e) => setFormData({ ...formData, inspectionNotes: e.target.value })}
                                disabled={!canEdit || isClosed}
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
                                disabled={upstreamLocked}
                            />
                        </div>

                        <div className="closure-form-group">
                            <label className="closure-form-label">Installation Status</label>
                            <label className={`closure-checkbox-row ${upstreamLocked ? 'disabled' : ''}`}>
                                <div className="closure-checkbox-label">
                                    Installation Completed
                                </div>
                                <input 
                                    type="checkbox"
                                    className="closure-checkbox-input"
                                    checked={formData.installationCompleted}
                                    onChange={(e) => setFormData({ ...formData, installationCompleted: e.target.checked })}
                                    disabled={upstreamLocked}
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
                                disabled={!canEdit || isClosed}
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
                            <label className={`closure-checkbox-row ${isClientAccepted ? 'disabled' : clientAcceptanceDisabled ? 'disabled' : ''}`}>
                                <div className="closure-checkbox-label">
                                    Yes, Client Accepted
                                </div>
                                <input 
                                    type="checkbox"
                                    className="closure-checkbox-input"
                                    checked={formData.clientAccepted}
                                    onChange={(e) => setFormData({ ...formData, clientAccepted: e.target.checked })}
                                    disabled={isClientAccepted ? true : clientAcceptanceDisabled}
                                />
                            </label>
                            {clientAcceptanceDisabled && (
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
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
                                    disabled={upstreamLocked}
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
                        {clientAcceptanceIncomplete && (
                            <div style={{ padding: '0 0 16px 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
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
                                disabled={warrantyDocsDisabled || isClosed}
                                placeholder="Enter any warranty details..."
                            />
                        </div>
                    </div>
                </div>

                {/* Final Documents Card */}
                <div className="execution-detail-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="execution-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3><FileText size={18} /> Final Documents</h3>
                        {!clientAcceptanceIncomplete && !isClosed && canEdit && (
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
                        {clientAcceptanceIncomplete ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-secondary)' }}>
                                Client acceptance is required before warranty and final documents.
                            </div>
                        ) : docsLoading ? (
                            <div style={{ padding: '16px', color: 'var(--color-text-muted)' }}>Loading documents...</div>
                        ) : finalDocs.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-secondary)' }}>
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
                                            <th style={{ width: canEdit && !isClosed ? '120px' : '80px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {finalDocs.map(doc => (
                                            <tr key={doc.id}>
                                                <td>{doc.originalFileName}</td>
                                                <td>{((doc.fileSize || 0) / 1024).toFixed(1)} KB</td>
                                                <td>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                                                <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button 
                                                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px', fontSize: '13px', fontWeight: 500 }}
                                                        onClick={() => handleDownloadDoc(doc.id!, doc.originalFileName || 'document')}
                                                        title="Download / View"
                                                    >
                                                        Download
                                                    </button>
                                                    {canEdit && !isClosed && (
                                                        <button 
                                                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                                                            onClick={() => handleDeleteDoc(doc.id!)}
                                                            title="Delete"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Checklist and Close Project */}
            {canEdit && !isClosed && (
                <div style={{ marginTop: '32px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: 'var(--color-surface-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={18} color="var(--color-text-primary)" />
                            Closure Checklist
                        </h3>
                    </div>
                    <div style={{ padding: '20px' }}>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: chkNoActiveTasks ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {chkNoActiveTasks ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span style={{ fontWeight: chkNoActiveTasks ? 600 : 400 }}>No Active Tasks</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: chkInspectionPassed ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {chkInspectionPassed ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span style={{ fontWeight: chkInspectionPassed ? 600 : 400 }}>Final Inspection Passed</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: chkDeliveryCompleted ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {chkDeliveryCompleted ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span style={{ fontWeight: chkDeliveryCompleted ? 600 : 400 }}>Delivery Completed</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: chkClientAccepted ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {chkClientAccepted ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span style={{ fontWeight: chkClientAccepted ? 600 : 400 }}>Client Accepted</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: chkFinalDocAvailable ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {chkFinalDocAvailable ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span style={{ fontWeight: chkFinalDocAvailable ? 600 : 400 }}>Final Document Available</span>
                            </li>
                        </ul>

                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                            <button
                                type="button"
                                className="execution-primary-button"
                                style={{ backgroundColor: canClose ? 'var(--color-success)' : 'var(--color-text-muted)', borderColor: canClose ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                                onClick={handleCloseProject}
                                disabled={!canClose || closing}
                            >
                                <ShieldCheck size={16} />
                                {closing ? 'Closing Project...' : 'Close Project'}
                            </button>
                            {!canClose && (
                                <div style={{ fontSize: '13px', color: 'var(--color-danger)' }}>
                                    All closure requirements must be completed before the project can be closed.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClosureTab;


