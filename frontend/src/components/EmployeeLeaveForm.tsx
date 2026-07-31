import React, { useState } from 'react';
import { Button } from './Button';
import { Input, Select } from './Forms';
import { ErrorState } from './FeedbackStates';
import { X } from 'lucide-react';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isNew ? 'Request Leave' : 'Edit Leave Request'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        
        {error && <ErrorState message={error} />}
        
        <form onSubmit={handleSubmit}>
          <Select
            label="Leave Type"
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            required
            disabled={!isNew}
          >
            <option value="ANNUAL">Annual Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
            <option value="MATERNITY">Maternity Leave</option>
            <option value="PATERNITY">Paternity Leave</option>
            <option value="OTHER">Other</option>
          </Select>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Start Date *"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            
            <Input 
              label="End Date *"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group flex items-center" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
              <label className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.partialDay}
                  onChange={(e) => setFormData({ ...formData, partialDay: e.target.checked })}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>Partial Day</span>
              </label>
            </div>
            
            {formData.partialDay && (
              <Input 
                label="Leave Hours"
                type="number"
                value={formData.leaveHours}
                onChange={(e) => setFormData({ ...formData, leaveHours: e.target.value })}
                min="0.5"
                step="0.5"
                required={formData.partialDay}
              />
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea 
              className="form-textarea"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
