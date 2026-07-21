import { prisma } from '../../lib/prisma';
import type { SaveReportDTO, ScheduleReportDTO } from '@decorflow/shared';

// Simple In-Memory Cache
const analyticsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class AnalyticsService {
  private async getCachedData(key: string, fetchFn: () => Promise<any>) {
    const cached = analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    const data = await fetchFn();
    analyticsCache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // ==========================================
  // EXECUTIVE DASHBOARD
  // ==========================================
  async getExecutiveSummary(companyId: string) {
    const cacheKey = `executive_${companyId}`;
    return this.getCachedData(cacheKey, async () => {
      // Get Invoices
      const invoices = await prisma.invoice.findMany({
        where: { companyId, status: { not: 'CANCELLED' } },
        include: { payments: true },
      });

      let totalRevenue = 0;
      let pendingReceivables = 0;
      invoices.forEach((inv) => {
        totalRevenue += inv.totalAmount;
        const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
        pendingReceivables += inv.totalAmount - paid;
      });

      // Get Expenses & Bills
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

      // Active Events
      const activeEvents = await prisma.event.count({
        where: { companyId, status: { isTerminal: false } },
      });

      // Inventory Value
      const inventory = await prisma.inventoryItem.findMany({
        where: { companyId, isActive: true },
      });
      const inventoryValue = inventory.reduce(
        (acc, item) => acc + item.currentQuantity * item.purchasePrice,
        0
      );

      // Customers
      const customerCount = await prisma.customer.count({ where: { companyId } });

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
    });
  }

  // ==========================================
  // FINANCIAL ANALYTICS
  // ==========================================
  async getFinancialAnalytics(companyId: string) {
    const cacheKey = `financial_${companyId}`;
    return this.getCachedData(cacheKey, async () => {
      // Group Revenue by month (last 6 months approximation)
      // Since SQLite doesn't have good grouping by month natively without raw queries,
      // we fetch all recent and group in JS.
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const invoices = await prisma.invoice.findMany({
        where: { companyId, date: { gte: sixMonthsAgo }, status: { not: 'CANCELLED' } },
      });

      const expenses = await prisma.expense.findMany({
        where: { companyId, date: { gte: sixMonthsAgo }, status: { in: ['APPROVED', 'PAID'] } },
      });

      const bills = await prisma.vendorBill.findMany({
        where: { companyId, date: { gte: sixMonthsAgo }, status: { not: 'CANCELLED' } },
      });

      const monthlyData: Record<string, { month: string; revenue: number; expenses: number }> = {};

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyData[monthStr] = { month: monthStr, revenue: 0, expenses: 0 };
      }

      invoices.forEach((inv) => {
        const monthStr = inv.date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyData[monthStr]) monthlyData[monthStr].revenue += inv.totalAmount;
      });

      expenses.forEach((exp) => {
        const monthStr = exp.date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyData[monthStr]) monthlyData[monthStr].expenses += exp.amount;
      });

      bills.forEach((bill) => {
        const monthStr = bill.date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyData[monthStr]) monthlyData[monthStr].expenses += bill.totalAmount;
      });

      return {
        trends: Object.values(monthlyData),
      };
    });
  }

  // ==========================================
  // INVENTORY ANALYTICS
  // ==========================================
  async getInventoryAnalytics(companyId: string) {
    const cacheKey = `inventory_analytics_${companyId}`;
    return this.getCachedData(cacheKey, async () => {
      const items = await prisma.inventoryItem.findMany({
        where: { companyId, isActive: true },
        select: {
          name: true,
          currentQuantity: true,
          availableQuantity: true,
          reservedQuantity: true,
          damagedQuantity: true,
        },
        orderBy: { currentQuantity: 'desc' },
        take: 10,
      });

      return { items };
    });
  }

  // ==========================================
  // CUSTOMER ANALYTICS
  // ==========================================
  async getCustomerAnalytics(companyId: string) {
    const cacheKey = `customer_analytics_${companyId}`;
    return this.getCachedData(cacheKey, async () => {
      const customers = await prisma.customer.findMany({
        where: { companyId, isActive: true },
        include: { invoices: true },
      });

      const customerLTV = customers
        .map((c) => {
          const totalRevenue = c.invoices.reduce(
            (acc, inv) => acc + (inv.status !== 'CANCELLED' ? inv.totalAmount : 0),
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
    });
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
