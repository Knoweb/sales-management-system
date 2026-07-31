import React from 'react';
import { Button } from './Button';

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    show?: boolean;
    type?: 'button' | 'submit';
    disabled?: boolean;
  };
  actionElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps & { icon?: React.ReactNode }> = ({ title, description, actionButton, actionElement, icon }) => {
  return (
    <div className="page-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px',
      marginBottom: '24px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {icon && (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-page-title" style={{ marginBottom: '4px' }}>{title}</h1>
          {description && <p className="text-page-description" style={{ margin: 0 }}>{description}</p>}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {actionButton && actionButton.show !== false && (
          <Button
            variant="primary"
            icon={actionButton.icon}
            onClick={actionButton.onClick}
            type={actionButton.type || 'button'}
            disabled={actionButton.disabled}
          >
            {actionButton.label}
          </Button>
        )}
        {actionElement && actionElement}
      </div>
    </div>
  );
};
