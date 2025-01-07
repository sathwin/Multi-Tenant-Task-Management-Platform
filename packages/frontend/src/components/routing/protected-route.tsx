import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useWorkspaceStore } from '@/store/workspace';
import { WorkspaceRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: WorkspaceRole[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedWorkspace } = useWorkspaceStore();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check workspace access if workspace is required
  if (location.pathname.includes('/w/') && !selectedWorkspace) {
    return <Navigate to="/workspaces" replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && selectedWorkspace) {
    const hasRequiredRole = requiredRoles.includes(selectedWorkspace.role);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0 && selectedWorkspace) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      selectedWorkspace.permissions.includes(permission)
    );
    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
} 