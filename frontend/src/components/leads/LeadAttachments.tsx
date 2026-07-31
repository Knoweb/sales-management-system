import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AttachmentApi } from '../../services/AttachmentApi';
import type { Attachment } from '../../types/attachment';
import { Button } from '../Button';
import { File, Download, Trash2, Upload, AlertCircle } from 'lucide-react';

interface LeadAttachmentsProps {
  entityId: string;
  entityType: string;
}

export const LeadAttachments: React.FC<LeadAttachmentsProps> = ({ entityId, entityType }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAttachments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AttachmentApi.getAttachments(entityType, entityId);
      setAttachments(data);
    } catch {
      setError('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAttachments();
  }, [loadAttachments]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);
      await AttachmentApi.uploadFile(entityId, entityType, file);
      if (fileInputRef.current) fileInputRef.current.value = '';
      void loadAttachments();
    } catch {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      await AttachmentApi.deleteAttachment(id);
      void loadAttachments();
    } catch {
      alert('Failed to delete attachment');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <div className="card-header flex-between">
        <h3 className="card-title">Attachments</h3>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button variant="primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : <><Upload size={16} /> Upload File</>}
          </Button>
        </div>
      </div>
      <div className="card-body">
        {error && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <p>Loading attachments...</p>
        ) : attachments.length === 0 ? (
          <p>No attachments found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {attachments.map(att => (
              <div key={att.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--text-light)' }}>
                    <File size={24} />
                  </div>
                  <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }} title={att.fileName}>
                      {att.fileName}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {formatFileSize(att.fileSize)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <a
                    href={AttachmentApi.downloadUrl(att.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                  >
                    <Download size={14} /> Download
                  </a>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(att.id)}
                    style={{ padding: '0.25rem 0.5rem', color: 'var(--color-danger)' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
