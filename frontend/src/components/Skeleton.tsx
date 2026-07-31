import React from 'react';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  borderRadius,
  variant = 'text' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return { borderRadius: '50%', height: height || '40px', width: width || '40px' };
      case 'rectangular':
        return { borderRadius: borderRadius || 'var(--radius-md)', height: height || '100px', width: width || '100%' };
      case 'text':
      default:
        return { borderRadius: borderRadius || 'var(--radius-sm)', height: height || '20px', width: width || '100%' };
    }
  };

  return (
    <div 
      className={`skeleton-loader ${className}`.trim()}
      style={{
        backgroundColor: 'var(--color-surface-secondary)',
        animation: 'pulse 1.5s infinite ease-in-out',
        ...getVariantStyles()
      }}
      aria-hidden="true"
    />
  );
};

// Add this style to the document via a quick inline style for the animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
