import { prisma } from '../../lib/prisma';
import { notificationService } from '../notifications/notification.service';

export class ReminderService {
  /**
   * This would typically be called by a cron job (e.g. node-cron)
   * periodically (e.g. daily at 00:00).
   */
  async processReminders() {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 7); // Remind 7 days in advance

    // 1. Vehicles: Service Due Date
    const vehicles = await prisma.vehicle.findMany({
      where: {
        serviceDueDate: {
          lte: futureDate,
          gte: today,
        },
      },
      include: { company: true },
    });

    for (const vehicle of vehicles) {
      // Check if reminder already exists
      const existing = await prisma.reminder.findFirst({
        where: {
          type: 'VEHICLE_SERVICE',
          entityId: vehicle.id,
          status: 'PENDING',
        },
      });

      if (!existing) {
        await prisma.reminder.create({
          data: {
            companyId: vehicle.companyId,
            type: 'VEHICLE_SERVICE',
            entityId: vehicle.id,
            title: `Vehicle Service Due: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
            dueDate: vehicle.serviceDueDate!,
          },
        });

        // Notify admins
        await notificationService.createCompanyWide(vehicle.companyId, {
          title: 'Vehicle Service Reminder',
          message: `Vehicle ${vehicle.licensePlate} is due for service on ${vehicle.serviceDueDate?.toLocaleDateString()}`,
          type: 'WARNING',
          module: 'FLEET',
          entityId: vehicle.id,
          priority: 'HIGH',
        });
      }
    }

    // 2. Inventory: Low Stock
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        isTracked: true,
        isActive: true,
        // Since prisma doesn't allow field comparisons directly in where easily for SQLite,
        // we might need to filter manually or if there's a field for reorder flag
      },
    });

    // Manual filter for low stock
    const lowStockItems = inventoryItems.filter((item) => item.availableQuantity <= item.minStock);

    for (const item of lowStockItems) {
      const existing = await prisma.reminder.findFirst({
        where: {
          type: 'INVENTORY_LOW',
          entityId: item.id,
          status: 'PENDING',
        },
      });

      if (!existing) {
        await prisma.reminder.create({
          data: {
            companyId: item.companyId,
            type: 'INVENTORY_LOW',
            entityId: item.id,
            title: `Low Stock: ${item.name} (${item.sku})`,
            dueDate: today,
          },
        });

        // Notify admins
        await notificationService.createCompanyWide(item.companyId, {
          title: 'Low Inventory Alert',
          message: `${item.name} has fallen below minimum stock level (${item.availableQuantity} left)`,
          type: 'WARNING',
          module: 'INVENTORY',
          entityId: item.id,
          priority: 'NORMAL',
        });
      }
    }

    // 3. Processed status update
    // Update reminders that have passed
    await prisma.reminder.updateMany({
      where: {
        dueDate: { lt: today },
        status: 'PENDING',
      },
      data: { status: 'PROCESSED' },
    });
  }
}

export const reminderService = new ReminderService();
