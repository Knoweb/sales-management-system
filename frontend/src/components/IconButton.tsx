import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  'aria-label'?: string;
  title?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`icon-btn ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {icon || children}
    </button>
  );
};
