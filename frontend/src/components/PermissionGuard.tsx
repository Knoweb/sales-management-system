import React from 'react';
import { useAuth } from '../context/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permission, 
  requireAll = false,
  fallback = null 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
  const hasPermission = requireAll 
    ? permissionsToCheck.every(p => user.permissions.includes(p))
    : permissionsToCheck.some(p => user.permissions.includes(p));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
