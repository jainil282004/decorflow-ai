import { prisma } from '../../lib/prisma';
import type { CreateEventDTO, UpdateEventDTO } from '@decorflow/shared';
import { ApiError } from '../../utils/errors';

export class EventsService {
  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    statusId?: string,
    typeId?: string,
    startDate?: string,
    endDate?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [{ title: { contains: search } }, { customer: { name: { contains: search } } }];
    }

    if (statusId) where.statusId = statusId;
    if (typeId) where.typeId = typeId;

    if (startDate && endDate) {
      where.startDate = { gte: new Date(startDate) };
      where.endDate = { lte: new Date(endDate) };
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          status: true,
          type: true,
          venue: true,
        },
        orderBy: { startDate: 'asc' },
      }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(companyId: string, id: string) {
    const event = await prisma.event.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        customer: true,
        status: true,
        type: true,
        venue: true,
      },
    });

    if (!event) throw new ApiError(404, 'Event not found');
    return event;
  }

  async getTypes(companyId: string) {
    return prisma.eventType.findMany({ where: { companyId } });
  }

  async getStatuses(companyId: string) {
    return prisma.eventStatus.findMany({ where: { companyId } });
  }

  async create(companyId: string, data: CreateEventDTO) {
    return prisma.event.create({
      data: {
        companyId,
        customerId: data.customerId,
        title: data.title,
        typeId: data.typeId,
        statusId: data.statusId,
        theme: data.theme,
        priority: data.priority,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        setupDate: data.setupDate ? new Date(data.setupDate) : undefined,
        dismantleDate: data.dismantleDate ? new Date(data.dismantleDate) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        guestCount: data.guestCount,
        budget: data.budget,
        expectedRevenue: data.expectedRevenue,
        venueId: data.venueId,
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount,
      },
      include: {
        customer: true,
        status: true,
        type: true,
        venue: true,
      },
    });
  }

  async update(companyId: string, id: string, data: UpdateEventDTO) {
    const existing = await prisma.event.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) throw new ApiError(404, 'Event not found');

    return prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        customerId: data.customerId,
        typeId: data.typeId,
        statusId: data.statusId,
        theme: data.theme,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        setupDate: data.setupDate ? new Date(data.setupDate) : undefined,
        dismantleDate: data.dismantleDate ? new Date(data.dismantleDate) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        guestCount: data.guestCount,
        budget: data.budget,
        expectedRevenue: data.expectedRevenue,
        venueId: data.venueId,
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount,
      },
      include: {
        customer: true,
        status: true,
        type: true,
        venue: true,
      },
    });
  }

  async remove(companyId: string, id: string) {
    const existing = await prisma.event.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) throw new ApiError(404, 'Event not found');

    return prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(companyId: string, id: string) {
    const existing = await prisma.event.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });

    if (!existing) throw new ApiError(404, 'Archived event not found');

    return prisma.event.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async duplicate(companyId: string, id: string) {
    const existing = await prisma.event.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) throw new ApiError(404, 'Event not found');

    const { id: _, createdAt: __, updatedAt: ___, deletedAt: ____, ...cloneData } = existing;

    return prisma.event.create({
      data: {
        ...cloneData,
        title: `${cloneData.title} (Copy)`,
      },
    });
  }
}

export const eventsService = new EventsService();
