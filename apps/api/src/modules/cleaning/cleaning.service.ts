import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/errors';
import type { UpdateCleaningJobDTO } from '@decorflow/shared';

const cleaningJobInclude = {
  variant: {
    include: {
      item: {
        include: { category: true },
      },
    },
  },
  assignedStaff: {
    select: { id: true, name: true, email: true },
  },
  inspectionItem: {
    include: {
      returnInspection: {
        include: {
          event: {
            select: { id: true, title: true, startDate: true, endDate: true },
          },
          packingJob: {
            select: { id: true, status: true },
          },
        },
      },
      packingJobItem: {
        select: { id: true, expectedQuantity: true, pickedQuantity: true },
      },
    },
  },
} as const;

export class CleaningService {
  async findAll(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      overdue?: boolean;
      recentlyWashed?: boolean;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const where: any = { companyId };

    if (options.recentlyWashed) {
      where.status = 'DONE';
    } else if (options.status) {
      where.status = options.status;
    }

    if (options.overdue) {
      where.status = { in: ['PENDING', 'CLEANING'] };
      where.OR = [{ dueDate: { lte: now } }, { dueDate: null }];
    }

    const [total, jobs] = await Promise.all([
      prisma.cleaningJob.count({ where }),
      prisma.cleaningJob.findMany({
        where,
        skip,
        take: limit,
        include: cleaningJobInclude,
        orderBy: options.recentlyWashed
          ? [{ lastWashDate: 'desc' }, { updatedAt: 'desc' }]
          : [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      data: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findReminders(companyId: string) {
    const now = new Date();
    const jobs = await prisma.cleaningJob.findMany({
      where: {
        companyId,
        status: { in: ['PENDING', 'CLEANING'] },
      },
      include: cleaningJobInclude,
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }, { createdAt: 'asc' }],
    });

    return jobs.map((job) => ({
      ...job,
      isOverdue: !job.dueDate || job.dueDate <= now,
      isDueToday: job.dueDate ? job.dueDate.toDateString() === now.toDateString() : true,
    }));
  }

  async findById(id: string, companyId: string) {
    const job = await prisma.cleaningJob.findFirst({
      where: { id, companyId },
      include: cleaningJobInclude,
    });
    if (!job) throw new ApiError(404, 'Cleaning job not found');
    return job;
  }

  async update(id: string, companyId: string, userId: string, data: UpdateCleaningJobDTO) {
    const existing = await this.findById(id, companyId);

    const updateData: any = {
      ...data,
      dueDate:
        data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null,
    };

    const completingWash = data.status === 'DONE' && existing.status !== 'DONE';

    if (completingWash) {
      updateData.lastWashDate = new Date();
      updateData.washCount = (existing.washCount || 0) + 1;
      if (!updateData.assignedStaffId) {
        updateData.assignedStaffId = userId;
      }
    }

    if (data.status === 'CLEANING' && existing.status === 'PENDING' && !existing.assignedStaffId) {
      updateData.assignedStaffId = data.assignedStaffId || userId;
    }

    if (!completingWash) {
      return prisma.cleaningJob.update({
        where: { id },
        data: updateData,
        include: cleaningJobInclude,
      });
    }

    // Mark washed: clear NEEDS_CLEANING condition qty so stock is free for booking again.
    // Do not bump InventoryItem.availableQuantity — packing never decremented it on dirty return;
    // availability is derived via InventoryCondition + packing reservations.
    return prisma.$transaction(async (tx) => {
      let remaining = existing.quantity;
      const dirtyConditions = await tx.inventoryCondition.findMany({
        where: {
          variantId: existing.variantId,
          condition: 'NEEDS_CLEANING',
        },
        orderBy: { createdAt: 'asc' },
      });

      for (const cond of dirtyConditions) {
        if (remaining <= 0) break;

        if (cond.quantity <= remaining) {
          await tx.inventoryCondition.delete({ where: { id: cond.id } });
          remaining -= cond.quantity;
        } else {
          await tx.inventoryCondition.update({
            where: { id: cond.id },
            data: { quantity: cond.quantity - remaining },
          });
          remaining = 0;
        }
      }

      return tx.cleaningJob.update({
        where: { id },
        data: updateData,
        include: cleaningJobInclude,
      });
    });
  }
}
