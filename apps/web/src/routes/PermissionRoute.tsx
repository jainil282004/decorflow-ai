import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermission';
import { getRequiredPermissionsForPath } from '../config/routePermissions';

/**
 * UX / defense-in-depth: block deep-linking to pages the nav would hide.
 * API 403 remains the real data boundary.
 */
export function PermissionRoute() {
  const { pathname } = useLocation();
  const required = getRequiredPermissionsForPath(pathname);
  const allowed = usePermissions(required ?? []);

  // No mapped permission → any logged-in user (dashboard, profile, etc.)
  if (!required || required.length === 0) {
    return <Outlet />;
  }

  if (!allowed) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
