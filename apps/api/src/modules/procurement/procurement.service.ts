import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/errors';
import type {
  CreateVendorDTO,
  UpdateVendorDTO,
  CreatePurchaseRequisitionDTO,
  UpdatePurchaseRequisitionDTO,
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
  CreateGoodsReceiptDTO,
  CreatePurchaseReturnDTO,
} from '@decorflow/shared';

export class ProcurementService {
  // ==========================================
  // VENDORS
  // ==========================================
  async findAllVendors(companyId: string) {
    return prisma.vendor.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findVendorById(id: string, companyId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id, companyId },
      include: { purchases: { take: 10, orderBy: { date: 'desc' } } },
    });
    if (!vendor) throw new ApiError(404, 'Vendor not found');
    return vendor;
  }

  async createVendor(companyId: string, data: CreateVendorDTO) {
    return prisma.vendor.create({
      data: {
        companyId,
        ...data,
      },
    });
  }

  async updateVendor(id: string, companyId: string, data: UpdateVendorDTO) {
    await this.findVendorById(id, companyId);
    return prisma.vendor.update({
      where: { id },
      data,
    });
  }

  // ==========================================
  // PURCHASE REQUISITIONS
  // ==========================================
  async findAllRequisitions(companyId: string) {
    return prisma.purchaseRequisition.findMany({
      where: { companyId },
      include: {
        requestedBy: { include: { user: true } },
        warehouse: true,
        items: { include: { variant: { include: { item: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequisition(companyId: string, data: CreatePurchaseRequisitionDTO) {
    const { items, ...rest } = data;
    return prisma.purchaseRequisition.create({
      data: {
        companyId,
        ...rest,
        status: 'PENDING',
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  async updateRequisitionStatus(id: string, companyId: string, status: string) {
    const req = await prisma.purchaseRequisition.findUnique({ where: { id, companyId } });
    if (!req) throw new ApiError(404, 'Requisition not found');

    return prisma.purchaseRequisition.update({
      where: { id },
      data: { status },
    });
  }

  // ==========================================
  // PURCHASE ORDERS
  // ==========================================
  async findAllOrders(companyId: string) {
    return prisma.purchase.findMany({
      where: { companyId },
      include: { vendor: true, items: { include: { variant: { include: { item: true } } } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOrderById(id: string, companyId: string) {
    const order = await prisma.purchase.findUnique({
      where: { id, companyId },
      include: {
        vendor: true,
        items: { include: { variant: { include: { item: true } } } },
        goodsReceipts: { include: { items: true, receivedBy: true } },
        purchaseReturns: true,
      },
    });
    if (!order) throw new ApiError(404, 'Purchase Order not found');
    return order;
  }

  async createOrder(companyId: string, data: CreatePurchaseOrderDTO) {
    const { items, ...rest } = data;
    const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const finalAmount = totalAmount + (rest.tax || 0) - (rest.discount || 0);

    return prisma.purchase.create({
      data: {
        companyId,
        ...rest,
        totalAmount: finalAmount,
        status: 'DRAFT',
        items: {
          create: items,
        },
      },
      include: { vendor: true, items: true },
    });
  }

  async updateOrderStatus(id: string, companyId: string, status: string) {
    const order = await this.findOrderById(id, companyId);
    return prisma.purchase.update({
      where: { id },
      data: { status },
    });
  }

  // ==========================================
  // GOODS RECEIPT (GRN) & INVENTORY UPDATE
  // ==========================================
  async receiveGoods(
    purchaseId: string,
    companyId: string,
    receivedById: string,
    data: CreateGoodsReceiptDTO
  ) {
    const order = await prisma.purchase.findUnique({
      where: { id: purchaseId, companyId },
      include: { items: true },
    });
    if (!order) throw new ApiError(404, 'Purchase Order not found');

    if (order.status === 'RECEIVED') {
      throw new ApiError(400, 'Purchase Order is already fully received');
    }

    // Process GRN within a transaction to ensure inventory accuracy
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create GRN
      const grn = await tx.goodsReceipt.create({
        data: {
          companyId,
          purchaseId,
          warehouseId: data.warehouseId,
          receivedById,
          notes: data.notes,
          status: 'COMPLETED',
          items: {
            create: data.items,
          },
        },
        include: { items: true },
      });

      // 2. Update Inventory Stock for each GRN item
      for (const grnItem of data.items) {
        if (!grnItem.passedQualityCheck || grnItem.receivedQuantity === 0) continue;

        // Find the PO item to get the variantId
        const poItem = order.items.find((i) => i.id === grnItem.purchaseItemId);
        if (!poItem) continue;

        // Find the variant to get the itemId
        const variant = await tx.inventoryVariant.findUnique({ where: { id: poItem.variantId } });
        if (variant) {
          await tx.inventoryItem.update({
            where: { id: variant.itemId },
            data: {
              availableQuantity: { increment: grnItem.receivedQuantity },
              currentQuantity: { increment: grnItem.receivedQuantity },
            },
          });
        }
      }

      // 3. Update PO Status to RECEIVED (assuming full receipt for simplicity, can be expanded to PARTIAL)
      await tx.purchase.update({
        where: { id: purchaseId },
        data: { status: 'RECEIVED' },
      });

      return grn;
    });

    return result;
  }

  // ==========================================
  // LOW STOCK REPORT
  // ==========================================
  async getLowStockItems(companyId: string) {
    // This is a naive implementation. In a real system, we'd check item reorderPoint
    const items = await prisma.inventoryItem.findMany({
      where: {
        companyId,
        availableQuantity: { lte: 10 }, // Hardcoded threshold for demo
      },
      include: { variants: true },
    });

    return items;
  }
}
