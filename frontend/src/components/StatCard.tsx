import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, className = '' }) => {
  return (
    <div className={`card ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-body-small">{title}</h3>
        {icon && <div style={{ color: 'var(--color-text-muted)' }}>{icon}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '4px' }}>
        <div style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '0.875rem', 
            fontWeight: '500',
            color: trend.isPositive ? 'var(--color-success)' : 'var(--color-danger)',
            marginBottom: '4px'
          }}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
};
