import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/errors';
import type {
  UpdateOrganizationDTO,
  InviteUserDTO,
  SuspendUserDTO,
  SubscriptionUpgradeDTO,
} from '@decorflow/shared';

export class SaasService {
  // ==========================================
  // ORGANIZATION MANAGEMENT
  // ==========================================
  async getOrganization(companyId: string) {
    return prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: { include: { plan: true } },
        users: {
          select: { id: true, name: true, email: true, isLocked: true, isSuperAdmin: true },
        },
      },
    });
  }

  async updateOrganization(companyId: string, data: UpdateOrganizationDTO) {
    return prisma.company.update({
      where: { id: companyId },
      data,
    });
  }

  // ==========================================
  // USER INVITATIONS
  // ==========================================
  async inviteUser(companyId: string, data: InviteUserDTO) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ApiError(400, 'User already exists in the system.');
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    // In a real app, send email with SendGrid/AWS SES here

    return prisma.userInvitation.create({
      data: {
        companyId,
        email: data.email,
        roleId: data.roleId,
        token,
        expiresAt,
      },
    });
  }

  async getInvitations(companyId: string) {
    return prisma.userInvitation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async suspendUser(companyId: string, data: SuspendUserDTO) {
    // Ensure the user actually belongs to this company before suspending
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user || user.companyId !== companyId) {
      throw new ApiError(404, 'User not found in this organization.');
    }
    if (user.isSuperAdmin) {
      throw new ApiError(403, 'Cannot suspend a super admin.');
    }

    return prisma.user.update({
      where: { id: data.userId },
      data: { isLocked: data.isLocked },
    });
  }

  // ==========================================
  // SUBSCRIPTION MANAGEMENT
  // ==========================================
  async upgradeSubscription(companyId: string, data: SubscriptionUpgradeDTO) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new ApiError(404, 'Plan not found.');

    const renewalDate = new Date();
    if (plan.billingCycle === 'MONTHLY') renewalDate.setMonth(renewalDate.getMonth() + 1);
    else renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    return prisma.companySubscription.upsert({
      where: { companyId },
      create: {
        companyId,
        planId: data.planId,
        status: 'ACTIVE',
        renewalDate,
      },
      update: {
        planId: data.planId,
        status: 'ACTIVE',
        renewalDate,
      },
    });
  }

  async getSubscriptionPlans() {
    return prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  // ==========================================
  // SUPER ADMIN PORTAL
  // ==========================================
  async getPlatformStats() {
    const totalCompanies = await prisma.company.count();
    const activeSubscriptions = await prisma.companySubscription.count({
      where: { status: 'ACTIVE' },
    });
    const totalUsers = await prisma.user.count();

    const subscriptions = await prisma.companySubscription.findMany({
      include: { plan: true },
      where: { status: 'ACTIVE' },
    });
    const monthlyRecurringRevenue = subscriptions.reduce(
      (acc, sub) =>
        acc + (sub.plan.billingCycle === 'MONTHLY' ? sub.plan.price : sub.plan.price / 12),
      0
    );

    return {
      totalCompanies,
      activeSubscriptions,
      totalUsers,
      monthlyRecurringRevenue,
    };
  }
}
