/* eslint-disable react-refresh/only-export-components */
import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'neutral', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export const getStatusVariant = (status: string): StatusBadgeProps['variant'] => {
  const s = status.toUpperCase();
  if (['ACTIVE', 'WON', 'COMPLETED', 'APPROVED', 'FULL_TIME'].includes(s)) return 'success';
  if (['OPPORTUNITY', 'NEGOTIATION', 'BRIEF_IN_PROGRESS', 'PENDING', 'PART_TIME'].includes(s)) return 'warning';
  if (['LOST', 'INACTIVE', 'TERMINATED', 'CANCELLED', 'REJECTED'].includes(s)) return 'error';
  if (['PROPOSAL', 'BRIEF_SUBMITTED', 'CONTRACT'].includes(s)) return 'info';
  return 'neutral';
};
