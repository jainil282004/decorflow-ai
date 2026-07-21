import { prisma } from '../../lib/prisma';
import type {
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  AdjustStockDTO,
} from '@decorflow/shared';
import { ApiError } from '../../utils/errors';

export class InventoryService {
  async findAll(companyId: string, page = 1, limit = 10, search = '', categoryId?: string) {
    const skip = (page - 1) * limit;

    const where: any = { companyId, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;

    const [total, items] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, subcategory: true, variants: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(companyId: string, id: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { category: true, subcategory: true, variants: true, images: true },
    });

    if (!item) throw new ApiError(404, 'Item not found');
    return item;
  }

  async getCategories(companyId: string) {
    return prisma.inventoryCategory.findMany({ where: { companyId } });
  }

  async create(companyId: string, data: CreateInventoryItemDTO) {
    return prisma.inventoryItem.create({
      data: {
        companyId,
        ...data,
      },
      include: { category: true, subcategory: true },
    });
  }

  async update(companyId: string, id: string, data: UpdateInventoryItemDTO) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) throw new ApiError(404, 'Item not found');

    return prisma.inventoryItem.update({
      where: { id },
      data,
      include: { category: true, subcategory: true },
    });
  }

  async archive(companyId: string, id: string) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) throw new ApiError(404, 'Item not found');

    return prisma.inventoryItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(companyId: string, id: string) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });

    if (!existing) throw new ApiError(404, 'Archived item not found');

    return prisma.inventoryItem.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async checkVariantAvailability(
    companyId: string,
    variantId: string,
    startDate: Date,
    endDate: Date,
    requiredQuantity: number
  ) {
    const variant = await prisma.inventoryVariant.findFirst({
      where: { id: variantId, item: { companyId } },
      include: { item: { include: { category: true } } },
    });

    if (!variant) throw new ApiError(404, 'Variant not found');

    const item = variant.item;
    const bufferHours = item.bufferHours ?? item.category.bufferHours ?? 0;
    const bufferMs = bufferHours * 60 * 60 * 1000;
    const effectiveStart = new Date(new Date(startDate).getTime() - bufferMs);
    const effectiveEnd = new Date(new Date(endDate).getTime() + bufferMs);

    // Find overlapping events
    const overlappingEvents = await prisma.event.findMany({
      where: {
        companyId,
        // Assuming we only care about events that are not cancelled
        status: { isTerminal: false },
        OR: [
          {
            startDate: { lte: effectiveEnd },
            endDate: { gte: effectiveStart },
          },
        ],
      },
      select: { id: true },
    });

    const eventIds = overlappingEvents.map((e) => e.id);

    if (eventIds.length > 0) {
      // Find total reserved quantity in these events for this variant
      const reserved = await prisma.packingJobItem.aggregate({
        where: {
          variantId,
          packingJob: {
            eventId: { in: eventIds },
            status: { notIn: ['RETURNED', 'ARCHIVED'] },
          },
        },
        _sum: { expectedQuantity: true },
      });

      const currentlyReserved = reserved._sum.expectedQuantity || 0;

      // Basic available quantity formula
      const available = item.currentQuantity - item.damagedQuantity - currentlyReserved;

      if (available < requiredQuantity) {
        throw new ApiError(
          400,
          `Cannot double-book: only ${Math.max(0, available)} available due to ${bufferHours}h buffer and overlapping events.`
        );
      }
    }
    return true;
  }
}

export const inventoryService = new InventoryService();
