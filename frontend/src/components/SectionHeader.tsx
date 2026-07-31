import React from 'react';

export interface SectionHeaderProps {
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, action, className = '' }) => {
  return (
    <div className={`flex justify-between items-start mb-4 ${className}`.trim()}>
      <div>
        <h2 className="text-section-title" style={{ marginBottom: description ? '4px' : '0' }}>{title}</h2>
        {description && <p className="text-body-small">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
