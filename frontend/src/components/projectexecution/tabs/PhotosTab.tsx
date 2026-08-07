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

const PhotosTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [photos, setPhotos] = useState<ProjectExecutionAttachmentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const photoRes = await projectExecutionApi.attachments.getByWorkspace(workspaceId, 'PHOTO');
            setPhotos(photoRes.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [workspaceId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const fileInput = document.getElementById('photoUpload') as HTMLInputElement;
            if (!fileInput.files || fileInput.files.length === 0) return alert('Select an image');
            const file = fileInput.files[0];
            
            const payload: any = { 
                workspaceId, attachmentType: 'PHOTO', taskId: form.taskId,
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
                {canEdit && <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button"><Plus size={16} /> Upload Photo</button>}
            </div>
            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {photos.map((p: any) => (
                        <div key={p.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ height: '100px', backgroundColor: '#eee', marginBottom: '8px' }}>No Preview Available</div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{p.originalFileName}</p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>{p.description || 'No description'}</p>
                            <button onClick={() => projectExecutionApi.attachments.delete(p.id!).then(fetchData)}><Trash size={14}/></button>
                        </div>
                    ))}
                </div>
            )}
            
            {isModalVisible && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>Upload Photo</h3>
                        <form onSubmit={handleSave}>
                            <label>Task</label>
                            <TaskSelector workspaceId={workspaceId} value={form.taskId} onChange={(val: any) => setForm({...form, taskId: val})} />
                            <label>Photo</label>
                            <input type="file" accept="image/*" id="photoUpload" required style={inputStyle} />
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
export default PhotosTab;
