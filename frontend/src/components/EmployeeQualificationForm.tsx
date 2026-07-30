import React, { useState } from 'react';
import { X } from 'lucide-react';

interface EmployeeQualificationFormProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export const EmployeeQualificationForm: React.FC<EmployeeQualificationFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [qualificationName, setQualificationName] = useState(initialData?.qualificationName || '');
  const [institution, setInstitution] = useState(initialData?.institution || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(initialData?.fieldOfStudy || '');
  const [qualificationLevel, setQualificationLevel] = useState(initialData?.qualificationLevel || '');
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || '');
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || '');
  const [credentialNumber, setCredentialNumber] = useState(initialData?.credentialNumber || '');
  const [verified, setVerified] = useState<boolean>(initialData?.verified || false);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!qualificationName) {
      setError('Qualification Name is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        qualificationName,
        institution,
        fieldOfStudy,
        qualificationLevel,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        credentialNumber,
        verified,
        notes
      });
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save qualification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Qualification' : 'Add Qualification'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Qualification Name *</label>
            <input 
              type="text" 
              className="form-input" 
              value={qualificationName}
              onChange={(e) => setQualificationName(e.target.value)}
              required
            />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input 
                type="text" 
                className="form-input" 
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Field of Study</label>
              <input 
                type="text" 
                className="form-input" 
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
              />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Level (e.g. BSc, MSc)</label>
              <input 
                type="text" 
                className="form-input" 
                value={qualificationLevel}
                onChange={(e) => setQualificationLevel(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Credential Number</label>
              <input 
                type="text" 
                className="form-input" 
                value={credentialNumber}
                onChange={(e) => setCredentialNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Verified</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea 
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Qualification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
