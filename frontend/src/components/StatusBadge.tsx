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
  if (!status) return 'neutral';
  const s = status.toUpperCase().replace(/\s+/g, '_'); // Handle spaces like 'Brief In Progress' -> 'BRIEF_IN_PROGRESS'
  
  // Success states
  if (['ACTIVE', 'WON', 'COMPLETED', 'APPROVED', 'VERIFIED', 'EXPERT', 'BRIEF_SUBMITTED', 'SUBMITTED', 'SUBMITTED_ON_TIME'].includes(s)) return 'success';
  
  // Warning states
  if (['OPPORTUNITY', 'NEGOTIATION', 'BRIEF_IN_PROGRESS', 'PENDING', 'UNVERIFIED', 'INTERMEDIATE', 'TEMPORARY', 'PART_TIME', 'PART-TIME', 'ON_HOLD', 'DUE_SOON', 'SUBMITTED_LATE'].includes(s)) return 'warning';
  
  // Info states (Neutral/Blueish depending on theme)
  if (['PROPOSAL', 'CONTRACT', 'FULL_TIME', 'FULL-TIME', 'ADVANCED', 'QUALIFIED'].includes(s)) return 'info';
  
  // Error states
  if (['LOST', 'INACTIVE', 'TERMINATED', 'CANCELLED', 'REJECTED', 'OVERDUE'].includes(s)) return 'error';
  
  // Fallback (e.g., Draft, Novice, Intern)
  if (['DRAFT'].includes(s)) return 'neutral';
  
  return 'neutral';
};
