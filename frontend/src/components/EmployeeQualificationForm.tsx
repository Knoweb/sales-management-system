import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ErrorState } from './FeedbackStates';
import { Button } from './Button';
import { Input } from './Forms';

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Qualification' : 'Add Qualification'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        
        {error && <ErrorState message={error} />}
        
        <form onSubmit={handleSubmit}>
          <Input 
            label="Qualification Name *"
            value={qualificationName}
            onChange={(e) => setQualificationName(e.target.value)}
            required
          />

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
            
            <Input 
              label="Field of Study"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
            />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Level (e.g. BSc, MSc)"
              value={qualificationLevel}
              onChange={(e) => setQualificationLevel(e.target.value)}
            />
            
            <Input 
              label="Credential Number"
              value={credentialNumber}
              onChange={(e) => setCredentialNumber(e.target.value)}
            />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            
            <Input 
              label="Expiry Date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
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
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Qualification'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
