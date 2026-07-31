import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'info', 
  title, 
  children, 
  className = '',
  style
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          border: 'var(--color-success)',
          text: 'var(--color-text-primary)',
          icon: <CheckCircle2 style={{ color: 'var(--color-success)' }} size={20} />
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-bg)',
          border: 'var(--color-warning)',
          text: 'var(--color-text-primary)',
          icon: <AlertCircle style={{ color: 'var(--color-warning)' }} size={20} />
        };
      case 'error':
        return {
          bg: 'var(--color-danger-bg)',
          border: 'var(--color-danger)',
          text: 'var(--color-text-primary)',
          icon: <XCircle style={{ color: 'var(--color-danger)' }} size={20} />
        };
      case 'info':
      default:
        return {
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info)',
          text: 'var(--color-text-primary)',
          icon: <Info style={{ color: 'var(--color-info)' }} size={20} />
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className={`alert ${className}`.trim()}
      style={{
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        ...style
      }}
      role="alert"
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {styles.icon}
      </div>
      <div>
        {title && <h4 className="text-label" style={{ marginBottom: '4px', color: styles.text }}>{title}</h4>}
        <div className="text-body-small" style={{ color: styles.text }}>
          {children}
        </div>
      </div>
    </div>
  );
};
