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
  };
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actionButton }) => {
  return (
    <div className="page-header flex-between mb-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actionButton && actionButton.show !== false && (
        <Button
          variant="primary"
          icon={actionButton.icon}
          onClick={actionButton.onClick}
          type={actionButton.type || 'button'}
        >
          {actionButton.label}
        </Button>
      )}
    </div>
  );
};
