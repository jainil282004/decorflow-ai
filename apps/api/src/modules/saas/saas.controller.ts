import { Request, Response, NextFunction } from 'express';
import { SaasService } from './saas.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { ApiError } from '../../utils/errors';
import {
  updateOrganizationSchema,
  inviteUserSchema,
  suspendUserSchema,
  subscriptionUpgradeSchema,
} from '@decorflow/shared';

const saasService = new SaasService();

export class SaasController {
  // Organization
  async getOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await saasService.getOrganization(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateOrganizationSchema.parse(req.body);
      const data = await saasService.updateOrganization(req.user!.companyId!, parsed);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  // Invitations
  async inviteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = inviteUserSchema.parse(req.body);
      const data = await saasService.inviteUser(req.user!.companyId!, parsed);
      return sendCreated(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await saasService.getInvitations(req.user!.companyId!);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = suspendUserSchema.parse(req.body);
      const data = await saasService.suspendUser(req.user!.companyId!, parsed);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  // Subscriptions
  async upgradeSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = subscriptionUpgradeSchema.parse(req.body);
      const data = await saasService.upgradeSubscription(req.user!.companyId!, parsed);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptionPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await saasService.getSubscriptionPlans();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  // Super Admin
  async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Security check
      if (!(req as any).user.isSuperAdmin) {
        throw new ApiError(403, 'Super Admin access required.', 'FORBIDDEN');
      }
      const data = await saasService.getPlatformStats();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}
