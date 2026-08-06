import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ClientDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (decision: { action: string; comments?: string }) => void;
}

export const ClientDecisionModal: React.FC<ClientDecisionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [action, setAction] = useState<string>('ACCEPT');
  const [comments, setComments] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ action, comments });
    // Reset state after submit
    setAction('ACCEPT');
    setComments('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Record Client Decision</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Client Decision</label>
              <select 
                className="form-input" 
                value={action} 
                onChange={(e) => setAction(e.target.value)}
                required
              >
                <option value="ACCEPT">Client Accepted</option>
                <option value="REJECT">Client Rejected</option>
                <option value="REVISE">Request Revised Quotation</option>
                <option value="DISCOUNT">Request Discount</option>
                <option value="NEGOTIATE">Start Negotiation</option>
                <option value="DELAY">Delay Decision</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Comments {(action !== 'ACCEPT') && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className="form-input"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter client's feedback or reasons..."
                required={action !== 'ACCEPT'}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              Save Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
