import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/errors';

/**
 * Ensures the requesting user belongs to the target company,
 * UNLESS they are a super admin.
 */
export const requireTenantIsolation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    // Super Admins bypass tenant isolation
    if (user.isSuperAdmin) {
      return next();
    }

    // Check query params, params, or body for companyId explicitly if provided
    const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;

    if (requestedCompanyId && requestedCompanyId !== user.companyId) {
      throw new ApiError(403, 'Forbidden: Tenant Isolation Violation');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Checks if the company's subscription allows access to a specific feature.
 */
export const requireFeature = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (user.isSuperAdmin) {
        return next();
      }

      const subscription = await prisma.companySubscription.findUnique({
        where: { companyId: user.companyId },
        include: { plan: true },
      });

      if (!subscription || subscription.status !== 'ACTIVE') {
        throw new ApiError(403, 'Active subscription required.');
      }

      const features: string[] = JSON.parse(subscription.plan.features || '[]');
      if (!features.includes(feature)) {
        throw new ApiError(403, `Your plan does not include access to: ${feature}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
