import { prisma } from '../../lib/prisma';
import type { CreateNotificationDTO, UpdateNotificationPreferenceDTO } from '@decorflow/shared';
import { ApiError } from '../../utils/errors';

export class NotificationService {
  async getNotifications(userId: string, companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, items, unreadCount] = await Promise.all([
      prisma.notification.count({ where: { userId, companyId } }),
      prisma.notification.findMany({
        where: { userId, companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId, companyId, isRead: false } }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async create(companyId: string, data: CreateNotificationDTO) {
    return prisma.notification.create({
      data: {
        companyId,
        ...data,
      },
    });
  }

  async createCompanyWide(companyId: string, data: Omit<CreateNotificationDTO, 'userId'>) {
    // Find all users in company
    const users = await prisma.user.findMany({ where: { companyId, isActive: true } });

    // In a real app we'd bulk insert or use a job queue, but this works for now.
    await prisma.notification.createMany({
      data: users.map((u) => ({
        companyId,
        userId: u.id,
        ...data,
      })),
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string, companyId: string) {
    return prisma.notification.updateMany({
      where: { userId, companyId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(userId: string, notificationId: string) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  // Preferences
  async getPreferences(userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId },
      });
    }
    return prefs;
  }

  async updatePreferences(userId: string, data: UpdateNotificationPreferenceDTO) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}

export const notificationService = new NotificationService();
