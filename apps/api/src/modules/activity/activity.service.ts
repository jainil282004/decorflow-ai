import { prisma } from '../../lib/prisma';
import type { CreateActivityLogDTO } from '@decorflow/shared';

export class ActivityService {
  async logActivity(companyId: string, userId: string, data: CreateActivityLogDTO) {
    return prisma.activityLog.create({
      data: {
        companyId,
        userId,
        ...data,
      },
    });
  }

  async getTimeline(companyId: string, entityType: string, entityId: string) {
    return prisma.activityLog.findMany({
      where: {
        companyId,
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        company: false, // Don't need company data here
      },
    });
  }

  async getGlobalFeed(companyId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.activityLog.count({ where: { companyId } }),
      prisma.activityLog.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Enhance activity logs with user names
    // This is a naive implementation; in production we'd use JOINs or include.
    // However, ActivityLog schema doesn't have a direct relation to User right now.
    const userIds = items.map((item) => item.userId).filter((id) => id !== null) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedItems = items.map((item) => ({
      ...item,
      user: item.userId ? userMap.get(item.userId) || null : null,
    }));

    return {
      data: enrichedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const activityService = new ActivityService();
