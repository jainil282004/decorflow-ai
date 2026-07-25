import { navigationConfig } from './navigation';

/** Routes that aren't in the sidebar (or are hidden) but still need the same UX guard. */
const extraRoutePermissions: { path: string; permissions: string[] }[] = [
  { path: '/admin/platform', permissions: ['platform.admin'] },
  { path: '/tasks', permissions: ['employee.view'] },
  { path: '/warehouse', permissions: ['inventory.view'] },
  { path: '/inventory/reservations', permissions: ['inventory.view'] },
];

/**
 * Longest-prefix match against nav + extras.
 * Returns required permissions, or null when any authenticated user may open the path.
 */
export function getRequiredPermissionsForPath(pathname: string): string[] | null {
  const rules = [...navigationConfig.flatMap((group) => group.items), ...extraRoutePermissions]
    .filter((item) => item.permissions && item.permissions.length > 0)
    .map((item) => ({ path: item.path, permissions: item.permissions as string[] }))
    .sort((a, b) => b.path.length - a.path.length);

  const match = rules.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`)
  );

  return match?.permissions ?? null;
}
