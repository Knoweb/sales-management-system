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
  color?: 'blue' | 'purple' | 'orange' | 'indigo' | 'green' | 'red';
  breakdown?: Record<string, number>;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, className = '', color, breakdown }) => {
  return (
    <div className={`card ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-body-small" style={{ margin: 0 }}>{title}</h3>
        {icon && <div style={{ color: color ? `var(--color-${color})` : 'var(--color-text-muted)' }}>{icon}</div>}
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
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {Object.entries(breakdown).map(([status, count]) => {
            // Format status: e.g., PENDING_TOP_MANAGEMENT_APPROVAL -> Pending Management Approval
            let formattedStatus = status.replace(/_/g, ' ').toLowerCase();
            formattedStatus = formattedStatus.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            // Shorten some long statuses
            if (formattedStatus === 'Pending Top Management Approval') formattedStatus = 'Pending Management Approval';
            if (formattedStatus === 'Approved By Top Management') formattedStatus = 'Management Approved';
            if (formattedStatus === 'Client Requested Revision') formattedStatus = 'Client Requested Changes';
            
            return (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{formattedStatus}:</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
