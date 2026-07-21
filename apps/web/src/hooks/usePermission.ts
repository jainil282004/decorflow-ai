import { useAuthStore } from '../stores/authStore';

export const usePermission = (requiredPermission: string): boolean => {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  if (!requiredPermission) return true;
  if (user?.isSuperAdmin) return true;
  if (permissions.includes('*')) return true;
  return permissions.includes(requiredPermission);
};

export const usePermissions = (requiredPermissions: string[]): boolean => {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  if (user?.isSuperAdmin || permissions.includes('*')) return true;
  return requiredPermissions.every((perm) => permissions.includes(perm));
};

export const useAnyPermission = (requiredPermissions: string[]): boolean => {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  if (!requiredPermissions.length) return true;
  if (user?.isSuperAdmin || permissions.includes('*')) return true;
  return requiredPermissions.some((perm) => permissions.includes(perm));
};
