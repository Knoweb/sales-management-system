import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';

export const ErrorState: React.FC<{ title?: string; message: string; onRetry?: () => void }> = ({ 
  title = 'An error occurred', 
  message, 
  onRetry 
}) => (
  <div className="card text-center" style={{ padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--color-surface-secondary)', borderStyle: 'dashed' }}>
    <div style={{ padding: '16px', backgroundColor: 'var(--color-danger-bg)', borderRadius: '50%', marginBottom: '16px' }}>
      <AlertCircle style={{ height: 32, width: 32, color: 'var(--color-danger)' }} />
    </div>
    <h3 className="text-card-title" style={{ marginBottom: '0.5rem' }}>{title}</h3>
    <p className="text-body-small" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    )}
  </div>
);

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; message: string; action?: React.ReactNode }> = ({
  icon,
  title,
  message,
  action
}) => (
  <div className="card text-center" style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--color-surface-secondary)', borderStyle: 'dashed' }}>
    {icon && (
      <div style={{ padding: '20px', backgroundColor: 'var(--color-surface)', borderRadius: '50%', marginBottom: '16px', boxShadow: 'var(--shadow-sm)', color: 'var(--color-text-muted)' }}>
        {icon}
      </div>
    )}
    <h3 className="text-card-title" style={{ marginBottom: '0.5rem' }}>{title}</h3>
    <p className="text-body-small" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>{message}</p>
    {action}
  </div>
);

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="card text-center" style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>
    <Loader2 className="animate-spin" style={{ height: 40, width: 40, marginBottom: '1rem', color: 'var(--color-primary)' }} />
    <p className="text-body-small">{message}</p>
  </div>
);
