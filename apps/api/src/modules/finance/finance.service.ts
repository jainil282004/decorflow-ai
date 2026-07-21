import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/errors';
import type {
  CreateQuotationDTO,
  UpdateQuotationStatusDTO,
  CreateInvoiceDTO,
  UpdateInvoiceStatusDTO,
  RecordPaymentDTO,
  CreateVendorBillDTO,
  UpdateVendorBillStatusDTO,
  RecordVendorPaymentDTO,
  CreateExpenseDTO,
  UpdateExpenseStatusDTO,
} from '@decorflow/shared';

export class FinanceService {
  // ==========================================
  // QUOTATIONS
  // ==========================================
  async findAllQuotations(companyId: string) {
    return prisma.quotation.findMany({
      where: { companyId },
      include: { customer: true, event: true, items: true },
      orderBy: { date: 'desc' },
    });
  }

  async findQuotationById(id: string, companyId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true, event: true, items: true },
    });

    if (!quotation || quotation.companyId !== companyId) {
      throw new ApiError(404, 'Quotation not found');
    }

    return quotation;
  }

  async createQuotation(companyId: string, data: CreateQuotationDTO) {
    const { items, ...rest } = data;

    // Auto-generate number
    const count = await prisma.quotation.count({ where: { companyId } });
    const number = `QT-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    let subTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subTotal += lineTotal;
      taxTotal += lineTotal * (item.taxRate / 100);
    });

    const totalAmount = subTotal + taxTotal - (rest.discountTotal || 0);

    return prisma.quotation.create({
      data: {
        companyId,
        ...rest,
        number,
        subTotal,
        taxTotal,
        totalAmount,
        status: 'DRAFT',
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  async updateQuotationStatus(id: string, companyId: string, status: string) {
    if (status === 'APPROVED') {
      return this.approveQuotation(id, companyId);
    }
    return prisma.quotation.update({
      where: { id, companyId },
      data: { status },
    });
  }

  async approveQuotation(id: string, companyId: string) {
    return prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id, companyId },
        include: { items: true },
      });

      if (!quotation) throw new ApiError(404, 'Quotation not found');
      if (quotation.status === 'APPROVED') throw new ApiError(400, 'Quotation is already approved');

      const updatedQuotation = await tx.quotation.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      const count = await tx.invoice.count({ where: { companyId } });
      const number = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

      const invoice = await tx.invoice.create({
        data: {
          companyId,
          customerId: quotation.customerId,
          eventId: quotation.eventId,
          quotationId: quotation.id,
          number,
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
          subTotal: quotation.subTotal,
          taxTotal: quotation.taxTotal,
          discountTotal: quotation.discountTotal,
          totalAmount: quotation.totalAmount,
          status: 'DRAFT',
          items: {
            create: quotation.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
            })),
          },
        },
        include: { items: true },
      });

      return { quotation: updatedQuotation, invoice };
    });
  }

  // ==========================================
  // INVOICES
  // ==========================================
  async findAllInvoices(companyId: string) {
    return prisma.invoice.findMany({
      where: { companyId },
      include: { customer: true, event: true, items: true, payments: true },
      orderBy: { date: 'desc' },
    });
  }

  async findInvoiceById(id: string, companyId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, event: true, items: true, payments: true },
    });

    if (!invoice || invoice.companyId !== companyId) {
      throw new ApiError(404, 'Invoice not found');
    }

    return invoice;
  }

  async createInvoice(companyId: string, data: CreateInvoiceDTO) {
    const { items, ...rest } = data;

    const count = await prisma.invoice.count({ where: { companyId } });
    const number = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    let subTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subTotal += lineTotal;
      taxTotal += lineTotal * (item.taxRate / 100);
    });

    const totalAmount = subTotal + taxTotal - (rest.discountTotal || 0);

    return prisma.invoice.create({
      data: {
        companyId,
        ...rest,
        number,
        subTotal,
        taxTotal,
        totalAmount,
        status: 'DRAFT',
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  async updateInvoiceStatus(id: string, companyId: string, status: string) {
    return prisma.invoice.update({
      where: { id, companyId },
      data: { status },
    });
  }

  async recordPayment(companyId: string, data: RecordPaymentDTO) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoiceId, companyId },
        include: { payments: true },
      });
      if (!invoice) throw new ApiError(404, 'Invoice not found');

      const payment = await tx.payment.create({
        data: {
          companyId,
          ...data,
        },
      });

      const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0) + data.amount;

      let newStatus = invoice.status;
      if (totalPaid >= invoice.totalAmount) {
        newStatus = 'PAID';
      } else if (totalPaid > 0) {
        newStatus = 'PARTIAL';
      }

      if (newStatus !== invoice.status) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: newStatus },
        });
      }

      return payment;
    });
  }

  // ==========================================
  // VENDOR BILLS
  // ==========================================
  async findAllVendorBills(companyId: string) {
    return prisma.vendorBill.findMany({
      where: { companyId },
      include: { vendor: true, purchase: true, payments: true },
      orderBy: { date: 'desc' },
    });
  }

  async createVendorBill(companyId: string, data: CreateVendorBillDTO) {
    return prisma.vendorBill.create({
      data: {
        companyId,
        ...data,
        status: 'PENDING',
      },
    });
  }

  async recordVendorPayment(companyId: string, data: RecordVendorPaymentDTO) {
    return prisma.$transaction(async (tx) => {
      const bill = await tx.vendorBill.findUnique({
        where: { id: data.vendorBillId, companyId },
        include: { payments: true },
      });
      if (!bill) throw new ApiError(404, 'Vendor Bill not found');

      const payment = await tx.vendorPayment.create({
        data: {
          companyId,
          ...data,
        },
      });

      const totalPaid = bill.payments.reduce((acc, p) => acc + p.amount, 0) + data.amount;

      let newStatus = bill.status;
      if (totalPaid >= bill.totalAmount) {
        newStatus = 'PAID';
      } else if (totalPaid > 0) {
        newStatus = 'PARTIAL';
      }

      if (newStatus !== bill.status) {
        await tx.vendorBill.update({
          where: { id: bill.id },
          data: { status: newStatus },
        });
      }

      return payment;
    });
  }

  // ==========================================
  // EXPENSES
  // ==========================================
  async findAllExpenses(companyId: string) {
    return prisma.expense.findMany({
      where: { companyId },
      include: { approvedBy: true },
      orderBy: { date: 'desc' },
    });
  }

  async createExpense(companyId: string, data: CreateExpenseDTO) {
    return prisma.expense.create({
      data: {
        companyId,
        ...data,
        status: 'PENDING',
      },
    });
  }

  async updateExpenseStatus(id: string, companyId: string, status: string, userId: string) {
    return prisma.expense.update({
      where: { id, companyId },
      data: {
        status,
        approvedById: status === 'APPROVED' || status === 'PAID' ? userId : undefined,
      },
    });
  }

  // ==========================================
  // ANALYTICS
  // ==========================================
  async getCashFlow(companyId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { companyId, status: { not: 'CANCELLED' } },
      include: { payments: true },
    });
    const bills = await prisma.vendorBill.findMany({
      where: { companyId, status: { not: 'CANCELLED' } },
      include: { payments: true },
    });
    const expenses = await prisma.expense.findMany({
      where: { companyId, status: { in: ['APPROVED', 'PAID'] } },
    });

    let totalReceivables = 0;
    let totalReceived = 0;

    invoices.forEach((inv) => {
      totalReceivables += inv.totalAmount;
      totalReceived += inv.payments.reduce((acc, p) => acc + p.amount, 0);
    });

    let totalPayables = 0;
    let totalPaidBills = 0;

    bills.forEach((bill) => {
      totalPayables += bill.totalAmount;
      totalPaidBills += bill.payments.reduce((acc, p) => acc + p.amount, 0);
    });

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const totalOutgoing = totalPaidBills + totalExpenses;

    return {
      totalReceivables,
      totalReceived,
      pendingReceivables: totalReceivables - totalReceived,
      totalPayables,
      totalOutgoing,
      pendingPayables: totalPayables - totalPaidBills,
      netCash: totalReceived - totalOutgoing,
    };
  }
}
