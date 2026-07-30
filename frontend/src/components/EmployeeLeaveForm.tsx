import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { LeaveType } from '../types/leave';

interface EmployeeLeaveFormProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
}

export const EmployeeLeaveForm: React.FC<EmployeeLeaveFormProps> = ({ onClose, onSubmit }) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [partialDay, setPartialDay] = useState(false);
  const [leaveHours, setLeaveHours] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!startDate || !endDate) {
      setError('Start and End dates are required');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after or equal to start date');
      return;
    }

    if (partialDay && !leaveHours) {
      setError('Leave hours are required for partial day leaves');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        leaveType,
        startDate,
        endDate,
        partialDay,
        leaveHours: leaveHours === '' ? undefined : Number(leaveHours),
        reason
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
        <div className="modal-header">
          <h2 className="modal-title">Request Leave</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select 
              className="form-select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            >
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
              <option value="MATERNITY">Maternity</option>
              <option value="PATERNITY">Paternity</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group flex items-center" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
              <label className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={partialDay}
                  onChange={(e) => setPartialDay(e.target.checked)}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>Partial Day</span>
              </label>
            </div>
            
            {partialDay && (
              <div className="form-group">
                <label className="form-label">Leave Hours</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={leaveHours}
                  onChange={(e) => setLeaveHours(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0.5"
                  step="0.5"
                  required={partialDay}
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea 
              className="form-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
