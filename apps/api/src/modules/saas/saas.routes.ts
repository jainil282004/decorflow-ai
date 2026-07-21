import { Router } from 'express';
import { SaasController } from './saas.controller';
import { BranchController } from './branch.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();
const saasController = new SaasController();
const branchController = new BranchController();

router.use(requireAuth);

// Organization Settings
router.get(
  '/organization',
  requirePermission('organization.settings'),
  saasController.getOrganization.bind(saasController)
);
router.patch(
  '/organization',
  requirePermission('organization.manage'),
  saasController.updateOrganization.bind(saasController)
);

// Branches
router.get(
  '/branches',
  requirePermission('organization.settings'),
  branchController.getBranches.bind(branchController)
);
router.post(
  '/branches',
  requirePermission('organization.manage'),
  branchController.createBranch.bind(branchController)
);
router.get(
  '/branches/:id',
  requirePermission('organization.settings'),
  branchController.getBranch.bind(branchController)
);
router.patch(
  '/branches/:id',
  requirePermission('organization.manage'),
  branchController.updateBranch.bind(branchController)
);

// User Invitations
router.get(
  '/invites',
  requirePermission('organization.settings'),
  saasController.getInvitations.bind(saasController)
);
router.post(
  '/invites',
  requirePermission('user.invite'),
  saasController.inviteUser.bind(saasController)
);
router.patch(
  '/users/suspend',
  requirePermission('user.remove'),
  saasController.suspendUser.bind(saasController)
);

// Subscriptions
router.get(
  '/subscription/plans',
  requirePermission('organization.settings'),
  saasController.getSubscriptionPlans.bind(saasController)
);
router.post(
  '/subscription/upgrade',
  requirePermission('subscription.manage'),
  saasController.upgradeSubscription.bind(saasController)
);

// Super Admin
router.get(
  '/admin/stats',
  requirePermission('platform.admin'),
  saasController.getPlatformStats.bind(saasController)
);

export const saasRouter = router;
