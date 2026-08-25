import { prisma } from '../../lib/prisma';
import type { SaveReportDTO } from '@decorflow/shared';

/** Stable YYYY-MM key — avoids locale/`toLocaleString` bucket mismatches. */
function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * Rental catalogs often leave purchasePrice at 0 and only set rentalPrice /
 * replacementCost. Asset value must not silently collapse to $0.
 */
function unitInventoryValue(item: {
  purchasePrice: number;
  replacementCost: number;
  rentalPrice: number;
}): number {
  if (item.purchasePrice > 0) return item.purchasePrice;
  if (item.replacementCost > 0) return item.replacementCost;
  return item.rentalPrice;
}

/** Booked revenue: exclude drafts and cancelled invoices. */
const REVENUE_INVOICE_STATUSES = { notIn: ['CANCELLED', 'DRAFT'] as string[] };

export class AnalyticsService {
  // ==========================================
  // EXECUTIVE DASHBOARD
  // ==========================================
  async getExecutiveSummary(companyId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { companyId, status: REVENUE_INVOICE_STATUSES },
      include: { payments: true },
    });

    let totalRevenue = 0;
    let pendingReceivables = 0;
    invoices.forEach((inv) => {
      totalRevenue += inv.totalAmount;
      const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
      pendingReceivables += inv.totalAmount - paid;
    });

    const expenses = await prisma.expense.findMany({
      where: { companyId, status: { in: ['APPROVED', 'PAID'] } },
    });
    const bills = await prisma.vendorBill.findMany({
      where: { companyId, status: { not: 'CANCELLED' } },
      include: { payments: true },
    });

    let totalCosts = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    let pendingPayables = 0;
    bills.forEach((bill) => {
      totalCosts += bill.totalAmount;
      const paid = bill.payments.reduce((acc, p) => acc + p.amount, 0);
      pendingPayables += bill.totalAmount - paid;
    });

    // Non-terminal + not soft-deleted (pipeline / in-flight events)
    const activeEvents = await prisma.event.count({
      where: {
        companyId,
        deletedAt: null,
        status: { isTerminal: false },
      },
    });

    const inventory = await prisma.inventoryItem.findMany({
      where: { companyId, isActive: true, deletedAt: null },
      select: {
        currentQuantity: true,
        purchasePrice: true,
        replacementCost: true,
        rentalPrice: true,
      },
    });
    const inventoryValue = inventory.reduce(
      (acc, item) => acc + item.currentQuantity * unitInventoryValue(item),
      0
    );

    const customerCount = await prisma.customer.count({
      where: { companyId, deletedAt: null },
    });

    return {
      totalRevenue,
      totalCosts,
      netProfit: totalRevenue - totalCosts,
      pendingReceivables,
      pendingPayables,
      activeEvents,
      inventoryValue,
      customerCount,
    };
  }

  // ==========================================
  // FINANCIAL ANALYTICS
  // ==========================================
  async getFinancialAnalytics(companyId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        date: { gte: sixMonthsAgo },
        status: REVENUE_INVOICE_STATUSES,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: { companyId, date: { gte: sixMonthsAgo }, status: { in: ['APPROVED', 'PAID'] } },
    });

    const bills = await prisma.vendorBill.findMany({
      where: { companyId, date: { gte: sixMonthsAgo }, status: { not: 'CANCELLED' } },
    });

    const monthlyData: Record<string, { month: string; revenue: number; expenses: number }> = {};

    // Initialize last 6 calendar months (day=1 avoids setMonth overflow)
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      d.setMonth(d.getMonth() - i);
      const key = monthKey(d);
      monthlyData[key] = { month: monthLabel(d), revenue: 0, expenses: 0 };
    }

    invoices.forEach((inv) => {
      const key = monthKey(inv.date);
      if (monthlyData[key]) monthlyData[key].revenue += inv.totalAmount;
    });

    expenses.forEach((exp) => {
      const key = monthKey(exp.date);
      if (monthlyData[key]) monthlyData[key].expenses += exp.amount;
    });

    bills.forEach((bill) => {
      const key = monthKey(bill.date);
      if (monthlyData[key]) monthlyData[key].expenses += bill.totalAmount;
    });

    return {
      trends: Object.values(monthlyData),
    };
  }

  // ==========================================
  // INVENTORY ANALYTICS
  // ==========================================
  async getInventoryAnalytics(companyId: string) {
    const allItems = await prisma.inventoryItem.findMany({
      where: { companyId, isActive: true, deletedAt: null },
      select: {
        name: true,
        currentQuantity: true,
        availableQuantity: true,
        reservedQuantity: true,
        damagedQuantity: true,
        minStock: true,
        purchasePrice: true,
        replacementCost: true,
        rentalPrice: true,
      },
      orderBy: { currentQuantity: 'desc' },
    });

    const inventoryValue = allItems.reduce(
      (acc, item) => acc + item.currentQuantity * unitInventoryValue(item),
      0
    );
    const lowStockCount = allItems.filter((i) => i.availableQuantity <= i.minStock).length;

    return {
      items: allItems.slice(0, 10),
      inventoryValue,
      lowStockCount,
    };
  }

  // ==========================================
  // CUSTOMER ANALYTICS
  // ==========================================
  async getCustomerAnalytics(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, isActive: true, deletedAt: null },
      include: { invoices: true },
    });

    const customerLTV = customers
      .map((c) => {
        const totalRevenue = c.invoices.reduce(
          (acc, inv) =>
            acc + (inv.status !== 'CANCELLED' && inv.status !== 'DRAFT' ? inv.totalAmount : 0),
          0
        );
        return {
          id: c.id,
          name: c.name,
          totalRevenue,
          eventCount: c.invoices.length,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return { topCustomers: customerLTV };
  }

  // ==========================================
  // REPORT BUILDER
  // ==========================================
  async saveReport(companyId: string, data: SaveReportDTO) {
    return prisma.savedReport.create({
      data: {
        companyId,
        name: data.name,
        type: data.type,
        config: JSON.stringify(data.config),
      },
    });
  }

  async getSavedReports(companyId: string) {
    return prisma.savedReport.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
