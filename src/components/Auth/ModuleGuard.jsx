'use client';

import { useAuth } from '@/src/context/AuthContext';

/**
 * ModuleGuard - High-order component / Wrapper to protect UI sections based on permissions.
 * 
 * @param {string} module - The name of the module to check (e.g., 'Finance', 'Tasks')
 * @param {React.ReactNode} children - Content to show if permitted
 * @param {React.ReactNode} fallback - Content to show if NOT permitted (optional)
 * @param {boolean} adminOnly - If true, only admins can see this even if they have the permission (optional)
 */
export default function ModuleGuard({ module, children, fallback = null, adminOnly = false }) {
  const { hasPermission, isAdmin, loading } = useAuth();

  if (loading) return null;

  const isPermitted = adminOnly ? isAdmin : hasPermission(module);

  if (!isPermitted) {
    return fallback;
  }

  return <>{children}</>;
}
