import React from 'react';

export interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`card card-secondary ${className}`.trim()}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px', 
        padding: '16px 24px', 
        marginBottom: '24px',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      {children}
    </div>
  );
};
