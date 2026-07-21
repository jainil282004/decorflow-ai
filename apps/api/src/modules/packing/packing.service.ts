import { prisma } from '../../lib/prisma';
import type {
  CreatePackingJobDTO,
  UpdatePackingItemDTO,
  VerifyPackingDTO,
  DispatchJobDTO,
  ReceiveReturnDTO,
} from '@decorflow/shared';
import { ApiError } from '../../utils/errors';

export class PackingService {
  async findAll(companyId: string, page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { companyId, deletedAt: null };
    if (status) where.status = status;

    const [total, jobs] = await Promise.all([
      prisma.packingJob.count({ where }),
      prisma.packingJob.findMany({
        where,
        skip,
        take: limit,
        include: {
          event: true,
          warehouse: true,
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { data: jobs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, companyId: string) {
    const job = await prisma.packingJob.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        event: { include: { customer: true, venue: true } },
        warehouse: true,
        vehicle: true,
        driver: true,
        packedBy: true,
        verifiedBy: true,
        dispatchedBy: true,
        returnedBy: true,
        items: { include: { variant: { include: { item: true } } } },
      },
    });

    if (!job) throw new ApiError(404, 'Packing job not found');
    return job;
  }

  async create(companyId: string, userId: string, data: CreatePackingJobDTO) {
    const event = await prisma.event.findFirst({
      where: { id: data.eventId, companyId, deletedAt: null },
    });
    if (!event) throw new ApiError(404, 'Event not found for this company');

    if (data.warehouseId) {
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: data.warehouseId, companyId },
      });
      if (!warehouse) throw new ApiError(404, 'Warehouse not found for this company');
    }

    const warehouseId =
      data.warehouseId && data.warehouseId.length > 0 ? data.warehouseId : undefined;

    return prisma.$transaction(async (tx) => {
      const job = await tx.packingJob.create({
        data: {
          companyId,
          eventId: data.eventId,
          warehouseId,
          status: 'PENDING',
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              expectedQuantity: item.expectedQuantity,
            })),
          },
        },
        include: { items: true, event: true, warehouse: true },
      });

      await tx.activityLog.create({
        data: {
          companyId,
          userId,
          action: 'CREATE_PACKING_JOB',
          entityType: 'PackingJob',
          entityId: job.id,
        },
      });

      return job;
    });
  }

  async updatePackingItems(
    id: string,
    companyId: string,
    userId: string,
    data: UpdatePackingItemDTO
  ) {
    const job = await this.findById(id, companyId);
    if (['VERIFIED', 'DISPATCHED', 'RETURNED'].includes(job.status)) {
      throw new ApiError(400, 'Cannot update packing items for a verified/dispatched job');
    }

    return prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        await tx.packingJobItem.update({
          where: { id: item.id, packingJobId: id },
          data: {
            pickedQuantity: item.pickedQuantity,
            missingQuantity: item.missingQuantity,
            damagedQuantity: item.damagedQuantity,
            packingNotes: item.packingNotes,
          },
        });
      }

      await tx.packingJob.update({
        where: { id },
        data: {
          status: 'PACKING',
          packedById: userId,
          packedAt: new Date(),
        },
      });

      const refreshed = await tx.packingJob.findFirst({
        where: { id },
        include: { items: true },
      });

      const allPacked = refreshed!.items.every((i) => i.pickedQuantity === i.expectedQuantity);
      if (allPacked) {
        return tx.packingJob.update({
          where: { id },
          data: { status: 'PACKED' },
          include: { items: true },
        });
      }

      return refreshed;
    });
  }

  async verifyJob(id: string, companyId: string, userId: string, data: VerifyPackingDTO) {
    const job = await this.findById(id, companyId);
    if (job.status !== 'PACKED') {
      throw new ApiError(400, `Cannot verify job in status ${job.status}. Expected PACKED.`);
    }

    return prisma.packingJob.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedById: userId,
        verifiedAt: new Date(),
        verificationNotes: data.verificationNotes,
      },
    });
  }

  async dispatchJob(id: string, companyId: string, userId: string, data: DispatchJobDTO) {
    const job = await this.findById(id, companyId);
    if (job.status !== 'VERIFIED') {
      throw new ApiError(400, `Cannot dispatch job in status ${job.status}. Expected VERIFIED.`);
    }

    return prisma.packingJob.update({
      where: { id },
      data: {
        status: 'DISPATCHED',
        dispatchedById: userId,
        dispatchedAt: new Date(),
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        dispatchChecklist: data.dispatchChecklist,
        dispatchNotes: data.dispatchNotes,
      },
    });
  }

  async receiveReturns(id: string, companyId: string, userId: string, data: ReceiveReturnDTO) {
    const job = await this.findById(id, companyId);
    if (job.status !== 'DISPATCHED') {
      throw new ApiError(
        400,
        `Cannot process returns for job in status ${job.status}. Expected DISPATCHED.`
      );
    }

    return prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        await tx.packingJobItem.update({
          where: { id: item.id, packingJobId: id },
          data: {
            returnedQuantity: item.returnedQuantity,
            returnMissingQuantity: item.returnMissingQuantity,
            returnDamagedQuantity: item.returnDamagedQuantity,
            needsCleaningQuantity: item.needsCleaningQuantity,
            needsRepairQuantity: item.needsRepairQuantity,
            returnNotes: item.returnNotes,
          },
        });

        if (
          item.returnDamagedQuantity > 0 ||
          item.needsCleaningQuantity > 0 ||
          item.needsRepairQuantity > 0
        ) {
          const dbItem = await tx.packingJobItem.findUnique({ where: { id: item.id } });
          if (dbItem) {
            if (item.returnDamagedQuantity > 0) {
              await tx.inventoryCondition.create({
                data: {
                  variantId: dbItem.variantId,
                  condition: 'DAMAGED',
                  quantity: item.returnDamagedQuantity,
                  notes: item.returnNotes,
                },
              });
            }
            if (item.needsCleaningQuantity > 0) {
              await tx.inventoryCondition.create({
                data: {
                  variantId: dbItem.variantId,
                  condition: 'NEEDS_CLEANING',
                  quantity: item.needsCleaningQuantity,
                  notes: item.returnNotes,
                },
              });
            }
            if (item.needsRepairQuantity > 0) {
              await tx.inventoryCondition.create({
                data: {
                  variantId: dbItem.variantId,
                  condition: 'NEEDS_REPAIR',
                  quantity: item.needsRepairQuantity,
                  notes: item.returnNotes,
                },
              });
            }
          }
        }
      }

      return tx.packingJob.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnedById: userId,
          returnedAt: new Date(),
          returnNotes: data.returnNotes,
        },
      });
    });
  }
}
