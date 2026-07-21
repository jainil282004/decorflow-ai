import type { ReactNode } from 'react';
import { usePermission, useAnyPermission } from '../hooks/usePermission';

interface GuardProps {
  require?: string;
  requireAny?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const Guard = ({ require, requireAny, children, fallback = null }: GuardProps) => {
  let hasAccess = false;

  const hasSinglePerm = usePermission(require || '');
  const hasAnyPerm = useAnyPermission(requireAny || []);

  if (require && hasSinglePerm) {
    hasAccess = true;
  }

  if (requireAny && hasAnyPerm) {
    hasAccess = true;
  }

  if (!require && !requireAny) {
    hasAccess = true; // Fallback to allowed if no permissions specified
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
