import { prisma } from '../../lib/prisma';
import { CreateCustomerDTO, UpdateCustomerDTO } from '@decorflow/shared';
import { ApiError } from '../../utils/errors';

export class CustomersService {
  /**
   * List Customers
   */
  async findAll(companyId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { companyId, deletedAt: null };

    if (search) {
      // SQLite does not support mode: 'insensitive'
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          addresses: true,
          contacts: true,
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get Single Customer
   */
  async findById(companyId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        addresses: true,
        contacts: true,
      },
    });

    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    return customer;
  }

  /**
   * Create Customer
   */
  async create(companyId: string, data: CreateCustomerDTO) {
    return prisma.customer.create({
      data: {
        companyId,
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        notes: data.notes,
        addresses: data.addresses
          ? {
              create: data.addresses.map((a) => ({
                type: a.type,
                line1: a.line1,
                line2: a.line2,
                city: a.city,
                state: a.state,
                zip: a.zip,
                country: a.country,
              })),
            }
          : undefined,
        contacts: data.contacts
          ? {
              create: data.contacts.map((c) => ({
                name: c.name,
                role: c.role,
                email: c.email,
                phone: c.phone,
              })),
            }
          : undefined,
      },
      include: {
        addresses: true,
        contacts: true,
      },
    });
  }

  /**
   * Update Customer
   */
  async update(companyId: string, id: string, data: UpdateCustomerDTO) {
    const existing = await prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) {
      throw new ApiError(404, 'Customer not found');
    }

    // Since updating nested arrays is complex in a single query without knowing IDs,
    // we use a transaction to delete existing and recreate them if they are provided.
    // A more robust approach would do selective upserts, but this suffices for Create/Replace.

    return prisma.$transaction(async (tx) => {
      // 1. Delete existing relations if replacements are provided
      if (data.addresses) {
        await tx.customerAddress.deleteMany({ where: { customerId: id } });
      }
      if (data.contacts) {
        await tx.customerContact.deleteMany({ where: { customerId: id } });
      }

      // 2. Update parent and recreate relations
      return tx.customer.update({
        where: { id },
        data: {
          type: data.type,
          name: data.name,
          email: data.email,
          phone: data.phone,
          taxId: data.taxId,
          notes: data.notes,
          addresses: data.addresses
            ? {
                create: data.addresses.map((a) => ({
                  type: a.type,
                  line1: a.line1,
                  line2: a.line2,
                  city: a.city,
                  state: a.state,
                  zip: a.zip,
                  country: a.country,
                })),
              }
            : undefined,
          contacts: data.contacts
            ? {
                create: data.contacts.map((c) => ({
                  name: c.name,
                  role: c.role,
                  email: c.email,
                  phone: c.phone,
                })),
              }
            : undefined,
        },
        include: {
          addresses: true,
          contacts: true,
        },
      });
    });
  }

  /**
   * Soft Delete Customer
   */
  async remove(companyId: string, id: string) {
    const existing = await prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existing) {
      throw new ApiError(404, 'Customer not found');
    }

    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  /**
   * Restore Customer
   */
  async restore(companyId: string, id: string) {
    const existing = await prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new ApiError(404, 'Customer not found');
    }

    return prisma.customer.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }
}

export const customersService = new CustomersService();
