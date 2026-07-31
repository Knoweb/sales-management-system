import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const ErrorState: React.FC<{ title?: string; message: string; onRetry?: () => void }> = ({ 
  title = 'An error occurred', 
  message, 
  onRetry 
}) => (
  <div className="card text-center py-12">
    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-outline">
        Try Again
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; message: string; action?: React.ReactNode }> = ({
  icon,
  title,
  message,
  action
}) => (
  <div className="card text-center py-12">
    {icon && <div className="mx-auto flex justify-center mb-4 text-gray-400">{icon}</div>}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    {action}
  </div>
);

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="card text-center py-12 flex flex-col items-center justify-center">
    <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
    <p className="text-gray-500">{message}</p>
  </div>
);
