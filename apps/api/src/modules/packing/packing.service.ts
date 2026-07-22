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

  /** Open the packing session without marking any quantities as picked. */
  async startPacking(id: string, companyId: string, userId: string) {
    const job = await this.findById(id, companyId);

    if (job.status === 'PACKING') {
      return job;
    }

    if (job.status !== 'PENDING') {
      throw new ApiError(
        400,
        `Cannot start packing for job in status ${job.status}. Expected PENDING.`
      );
    }

    return prisma.packingJob.update({
      where: { id },
      data: {
        status: 'PACKING',
        packedById: userId,
        // packedAt is set only when every line is explicitly confirmed (→ PACKED)
      },
      include: {
        event: { include: { customer: true, venue: true } },
        warehouse: true,
        items: { include: { variant: { include: { item: true } } } },
      },
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
    if (!['PENDING', 'PACKING', 'PACKED'].includes(job.status)) {
      throw new ApiError(400, `Cannot update packing items for job in status ${job.status}`);
    }
    if (job.status === 'PACKED') {
      throw new ApiError(400, 'Packing is already complete. Verify the job to proceed.');
    }
    if (!data.items.length) {
      throw new ApiError(400, 'At least one packing line must be updated');
    }

    // Every submitted line must include an explicit picked quantity (not inferred).
    for (const item of data.items) {
      if (item.pickedQuantity === undefined || item.pickedQuantity === null) {
        throw new ApiError(400, 'Each line requires an explicit pickedQuantity');
      }
      const line = job.items.find((i) => i.id === item.id);
      if (!line) {
        throw new ApiError(404, `Packing line ${item.id} not found on this job`);
      }
      if (item.pickedQuantity > line.expectedQuantity) {
        throw new ApiError(
          400,
          `Picked quantity (${item.pickedQuantity}) cannot exceed expected (${line.expectedQuantity})`
        );
      }
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
        },
      });

      const refreshed = await tx.packingJob.findFirst({
        where: { id },
        include: {
          event: { include: { customer: true, venue: true } },
          warehouse: true,
          items: { include: { variant: { include: { item: true } } } },
        },
      });

      // Complete only when every line has been explicitly picked in full — never
      // just because the packing session was opened.
      const allPacked = refreshed!.items.every((i) => i.pickedQuantity === i.expectedQuantity);
      if (allPacked && refreshed!.items.length > 0) {
        return tx.packingJob.update({
          where: { id },
          data: {
            status: 'PACKED',
            packedById: userId,
            packedAt: new Date(),
          },
          include: {
            event: { include: { customer: true, venue: true } },
            warehouse: true,
            items: { include: { variant: { include: { item: true } } } },
          },
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
      const cleaningEntries: Array<{
        packingJobItemId: string;
        variantId: string;
        dirtyQuantity: number;
        returnNotes?: string;
        bufferHours: number;
      }> = [];

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
          const dbItem = await tx.packingJobItem.findUnique({
            where: { id: item.id },
            include: {
              variant: {
                include: {
                  item: { include: { category: true } },
                },
              },
            },
          });
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

              const bufferHours =
                dbItem.variant?.item?.bufferHours ??
                dbItem.variant?.item?.category?.bufferHours ??
                0;
              cleaningEntries.push({
                packingJobItemId: dbItem.id,
                variantId: dbItem.variantId,
                dirtyQuantity: item.needsCleaningQuantity,
                returnNotes: item.returnNotes,
                bufferHours,
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

      if (cleaningEntries.length > 0) {
        const inspection = await tx.returnInspection.create({
          data: {
            companyId,
            eventId: job.eventId,
            packingJobId: id,
            inspectorId: userId,
            status: 'COMPLETED',
            inspectionNotes: data.returnNotes || 'Auto-created from packing return',
          },
        });

        for (const entry of cleaningEntries) {
          const inspectionItem = await tx.returnInspectionItem.create({
            data: {
              returnInspectionId: inspection.id,
              packingJobItemId: entry.packingJobItemId,
              returnedQuantity: entry.dirtyQuantity,
              dirtyQuantity: entry.dirtyQuantity,
              inspectionNotes: entry.returnNotes,
            },
          });

          const dueDate = new Date();
          if (entry.bufferHours > 0) {
            dueDate.setTime(dueDate.getTime() + entry.bufferHours * 60 * 60 * 1000);
          } else {
            dueDate.setDate(dueDate.getDate() + 1);
            dueDate.setHours(18, 0, 0, 0);
          }

          await tx.cleaningJob.create({
            data: {
              companyId,
              inspectionItemId: inspectionItem.id,
              variantId: entry.variantId,
              priority: 'NORMAL',
              status: 'PENDING',
              quantity: entry.dirtyQuantity,
              dueDate,
              cleaningNotes: entry.returnNotes,
            },
          });
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
