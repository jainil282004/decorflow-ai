import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { PermissionService } from '../modules/auth/permission.service';

const permissionService = new PermissionService();

export const requirePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new ApiError(401, 'Unauthorized');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(403, 'Account is inactive');
      }

      if (user.isSuperAdmin) {
        return next();
      }

      const permissions = await permissionService.getUserPermissions(user.id);

      if (!permissions.includes(requiredPermission)) {
        throw new ApiError(403, `Forbidden: Requires permission '${requiredPermission}'`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
