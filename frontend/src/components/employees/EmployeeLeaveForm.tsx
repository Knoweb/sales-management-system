import React, { useState } from 'react';
import { Button } from '../Button';
import { FormField, Input, Select, Textarea, Checkbox } from '../Forms';
import { Modal } from '../Modal';
import { Alert } from '../Alert';

interface EmployeeLeaveFormProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export const EmployeeLeaveForm: React.FC<EmployeeLeaveFormProps> = ({ onClose, onSubmit, initialData }) => {
  const isNew = !initialData;
  const [formData, setFormData] = useState(initialData || {
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    partialDay: false,
    leaveHours: '',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.startDate || !formData.endDate) {
      setError('Start and End dates are required');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after or equal to start date');
      return;
    }
    
    if (formData.partialDay && !formData.leaveHours) {
      setError('Leave hours are required for partial day leaves');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        leaveHours: formData.leaveHours === '' ? undefined : Number(formData.leaveHours),
      });
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={() => !loading && onClose()} 
      title={isNew ? 'Request Leave' : 'Edit Leave Request'}
    >
      {error && (
        <Alert variant="error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <FormField label="Leave Type" required id="leaveType">
            <Select
              id="leaveType"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              required
              disabled={!isNew || loading}
            >
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
              <option value="OTHER">Other</option>
            </Select>
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <FormField label="Start Date" required id="startDate">
            <Input 
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              disabled={loading}
            />
          </FormField>
          
          <FormField label="End Date" required id="endDate">
            <Input 
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              disabled={loading}
            />
          </FormField>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ marginTop: formData.partialDay ? '28px' : '0' }}>
            <Checkbox 
              id="partialDay"
              label="Partial Day"
              checked={formData.partialDay}
              onChange={(e) => setFormData({ ...formData, partialDay: e.target.checked })}
              disabled={loading}
            />
          </div>
          
          {formData.partialDay && (
            <FormField label="Leave Hours" required={formData.partialDay} id="leaveHours">
              <Input 
                id="leaveHours"
                type="number"
                value={formData.leaveHours}
                onChange={(e) => setFormData({ ...formData, leaveHours: e.target.value })}
                min="0.5"
                step="0.5"
                required={formData.partialDay}
                disabled={loading}
              />
            </FormField>
          )}
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <FormField label="Reason" id="reason">
            <Textarea 
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
