/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { TaskSelector } from '../selectors/TaskSelector';


import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectExecutionAttachmentDTO } from '../../../api/projectExecutionApi';
import { Plus, Trash } from 'lucide-react';

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

const DocumentsTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [docs, setDocs] = useState<ProjectExecutionAttachmentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const docRes = await projectExecutionApi.attachments.getByWorkspace(workspaceId, 'DOCUMENT');
            setDocs(docRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
            if (!fileInput.files || fileInput.files.length === 0) return alert('Select a file');
            const file = fileInput.files[0];
            
            // Mock upload directly
            const payload: any = { 
                workspaceId, attachmentType: 'DOCUMENT', taskId: form.taskId,
                originalFileName: file.name, mimeType: file.type, fileSize: file.size,
                description: form.description, storageReference: 'mock-url' 
            };
            await projectExecutionApi.attachments.save(workspaceId, payload);
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
                {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> Upload Document</button>}
            </div>
            {loading ? <p>Loading...</p> : (
                <div className="execution-table-container">
                    <table className="execution-table">
                    <thead>
                        <tr><th>File</th><th>Description</th><th>Size</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {docs.map((r: any) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{r.originalFileName}</td><td>{r.description}</td><td>{((r.fileSize||0)/1024).toFixed(1)} KB</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={() => projectExecutionApi.attachments.delete(r.id!).then(fetchData)}><Trash size={14}/></button>
                                    </div>
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
                        <h3>Upload Document</h3>
                        <form onSubmit={handleSave}>
                            <label>Task</label>
                            <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any) => setForm({...form, taskId: val})} />
                            <label>File</label>
                            <input type="file" id="fileUpload" required style={inputStyle} />
                            <label>Description</label>
                            <input style={inputStyle} onChange={(e: any) => setForm({...form, description: e.target.value})} />
                            
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsModalVisible(false)}>Cancel</button>
                                <button type="submit">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DocumentsTab;
