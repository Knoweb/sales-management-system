import React from 'react';
import { Button } from './Button';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
      case 'warning':
        return <AlertCircle style={{ color: `var(--color-${variant})`, width: 24, height: 24 }} />;
      case 'success':
        return <CheckCircle2 style={{ color: 'var(--color-success)', width: 24, height: 24 }} />;
      case 'info':
      default:
        return <Info style={{ color: 'var(--color-info)', width: 24, height: 24 }} />;
    }
  };

  const getButtonVariant = () => {
    if (variant === 'danger') return 'danger';
    return 'primary';
  };

  return (
    <div className="modal-overlay" onClick={!isLoading ? onCancel : undefined}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          <div style={{ 
            backgroundColor: `var(--color-${variant === 'danger' ? 'danger-bg' : variant === 'warning' ? 'warning-bg' : variant === 'success' ? 'success-bg' : 'info-bg'})`,
            padding: '12px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getIcon()}
          </div>
          <div>
            <h3 id="dialog-title" className="modal-title" style={{ fontSize: '1.125rem', marginBottom: '8px' }}>{title}</h3>
            <p className="text-body-small">{message}</p>
          </div>
          <button 
            onClick={!isLoading ? onCancel : undefined} 
            className="modal-close" 
            style={{ marginLeft: 'auto' }}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={getButtonVariant()} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
