import React, { useState } from 'react';
import { Button } from '../Button';
import { FormField, Input, Textarea, Checkbox } from '../Forms';
import { Modal } from '../Modal';
import { Alert } from '../Alert';

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
    <Modal 
      isOpen={true} 
      onClose={() => !loading && onClose()} 
      title={isEdit ? 'Edit Qualification' : 'Add Qualification'}
    >
      {error && (
        <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <FormField label="Qualification Name" required id="qualificationName">
            <Input 
              id="qualificationName"
              value={qualificationName}
              onChange={(e) => setQualificationName(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <FormField label="Institution" id="institution">
            <Input 
              id="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              disabled={loading}
            />
          </FormField>
          
          <FormField label="Field of Study" id="fieldOfStudy">
            <Input 
              id="fieldOfStudy"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <FormField label="Level (e.g. BSc, MSc)" id="qualificationLevel">
            <Input 
              id="qualificationLevel"
              value={qualificationLevel}
              onChange={(e) => setQualificationLevel(e.target.value)}
              disabled={loading}
            />
          </FormField>
          
          <FormField label="Credential Number" id="credentialNumber">
            <Input 
              id="credentialNumber"
              value={credentialNumber}
              onChange={(e) => setCredentialNumber(e.target.value)}
              disabled={loading}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <FormField label="Issue Date" id="issueDate">
            <Input 
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              disabled={loading}
            />
          </FormField>
          
          <FormField label="Expiry Date" id="expiryDate">
            <Input 
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={loading}
            />
          </FormField>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <Checkbox 
            id="verified"
            label="Verified"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <FormField label="Notes" id="notes">
            <Textarea 
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </FormField>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            style={{
              minWidth: '110px',
              height: '42px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEdit ? 'Save Changes' : 'Add Qualification'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
