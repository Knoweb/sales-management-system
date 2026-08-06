import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { QuotationApprovalDto } from '../services/QuotationApi';

interface QuotationApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuotationApprovalDto) => void;
  action: 'APPROVE' | 'REJECT' | 'RETURN' | 'REVISE' | null;
}

export const QuotationApprovalModal: React.FC<QuotationApprovalModalProps> = ({ isOpen, onClose, onSubmit, action }) => {
  const [comments, setComments] = useState('');

  if (!isOpen || !action) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ action, comments });
    setComments('');
  };

  const getTitle = () => {
    switch (action) {
      case 'APPROVE': return 'Approve Quotation';
      case 'REJECT': return 'Reject Quotation';
      case 'RETURN': return 'Return for Correction';
      case 'REVISE': return 'Request Revision';
      default: return 'Review Quotation';
    }
  };

  const getButtonText = () => {
    switch (action) {
      case 'APPROVE': return 'Approve';
      case 'REJECT': return 'Reject';
      case 'RETURN': return 'Return';
      case 'REVISE': return 'Request Revision';
      default: return 'Submit';
    }
  };

  const getButtonClass = () => {
    switch (action) {
      case 'APPROVE': return 'btn-primary bg-green-600 hover:bg-green-700';
      case 'REJECT': return 'btn-danger';
      case 'RETURN':
      case 'REVISE': return 'btn-secondary text-orange-600 border-orange-600 hover:bg-orange-50';
      default: return 'btn-primary';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{getTitle()}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Comments {action !== 'APPROVE' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className="form-input"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your comments or reasons..."
                required={action !== 'APPROVE'}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn ${getButtonClass()}`}>
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
