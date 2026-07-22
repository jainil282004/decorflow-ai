const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  // Customers (legacy colon keys used by customers routes)
  'customers:read',
  'customers:create',
  'customers:update',
  'customers:archive',
  'customers:restore',
  // Events
  'event.view',
  'event.create',
  'event.update',
  'event.delete',
  'event.restore',
  'event.duplicate',
  // Inventory
  'inventory.view',
  'inventory.create',
  'inventory.update',
  'inventory.archive',
  'inventory.restore',
  'inventory.edit',
  // Packing / dispatch
  'packing.view',
  'packing.create',
  'packing.update',
  'packing.verify',
  'dispatch.create',
  'return.receive',
  'cleaning.update',
  // Logistics
  'vehicle.view',
  'vehicle.create',
  'vehicle.update',
  'driver.view',
  'driver.create',
  'driver.update',
  'trip.view',
  'trip.create',
  'trip.update',
  'trip.dispatch',
  'trip.complete',
  'fleet.view',
  'fleet.trip.view',
  'fleet.trip.update',
  // Workforce
  'employee.view',
  'employee.create',
  'employee.update',
  'team.manage',
  'task.assign',
  'task.create',
  'attendance.manage',
  // Procurement
  'vendor.view',
  'vendor.create',
  'vendor.update',
  'purchase.create',
  'purchase.approve',
  'grn.receive',
  // Finance
  'invoice.view',
  'invoice.create',
  'invoice.update',
  'invoice.edit',
  'quotation.view',
  'customer.view',
  'payment.record',
  'finance.view',
  'expense.manage',
  // Analytics / reports
  'dashboard.view',
  'analytics.view',
  'reports.view',
  // Activity / notifications
  'activity.view',
  'timeline.view',
  'notification.view',
  'notification.manage',
  // SaaS / org
  'organization.settings',
  'organization.manage',
  'user.invite',
  'user.remove',
  'subscription.manage',
  'platform.admin',
];

async function main() {
  console.log('Starting seed...');

  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'DecorFlow HQ', timeZone: 'UTC', currency: 'USD', language: 'en' },
    });
  }

  for (const p of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p },
    });
  }

  const rolesData = [
    { name: 'Admin', permissions: ALL_PERMISSIONS },
    {
      name: 'Driver',
      permissions: [
        'fleet.view',
        'fleet.trip.view',
        'fleet.trip.update',
        'trip.view',
        'trip.update',
        'vehicle.view',
        'driver.view',
      ],
    },
    {
      name: 'Inventory Manager',
      permissions: [
        'inventory.view',
        'inventory.create',
        'inventory.update',
        'inventory.edit',
        'packing.view',
        'packing.create',
        'packing.update',
        'packing.verify',
        'dispatch.create',
        'return.receive',
        'cleaning.update',
      ],
    },
  ];

  const roleMap: Record<string, { id: string; name: string }> = {};
  for (const r of rolesData) {
    let role = await prisma.role.findFirst({ where: { name: r.name } });
    if (!role) {
      role = await prisma.role.create({ data: { name: r.name, companyId: company.id } });
    }
    roleMap[r.name] = role;

    for (const pName of r.permissions) {
      const perm = await prisma.permission.findUnique({ where: { name: pName } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
    console.log('Upserted Role & Permissions:', role.name);
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const usersData = [
    { email: 'owner@decorflow.com', name: 'Owner', isSuperAdmin: true, roleName: null },
    { email: 'admin@decorflow.com', name: 'System Admin', isSuperAdmin: false, roleName: 'Admin' },
    {
      email: 'driver@decorflow.com',
      name: 'Logistics Driver',
      isSuperAdmin: false,
      roleName: 'Driver',
    },
    {
      email: 'inventory@decorflow.com',
      name: 'Inventory Manager',
      isSuperAdmin: false,
      roleName: 'Inventory Manager',
    },
  ];

  for (const u of usersData) {
    let user = await prisma.user.upsert({
      where: { email: u.email },
      update: { companyId: company.id, isSuperAdmin: u.isSuperAdmin, passwordHash: passwordHash },
      create: {
        email: u.email,
        passwordHash: passwordHash,
        name: u.name,
        companyId: company.id,
        isSuperAdmin: u.isSuperAdmin,
        isActive: true,
      },
    });

    if (u.roleName) {
      const roleId = roleMap[u.roleName].id;
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: roleId } },
        update: {},
        create: { userId: user.id, roleId: roleId },
      });
    }
    console.log('Upserted User & Reset Password:', u.email);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
