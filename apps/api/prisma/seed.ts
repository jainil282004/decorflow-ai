import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed...');

  // 1. Define Granular Permissions
  const permissions = [
    // Dashboard
    'dashboard.view',
    // Customer
    'customer.create',
    'customer.update',
    'customer.delete',
    'customer.view',
    // Inventory
    'inventory.create',
    'inventory.update',
    'inventory.delete',
    'inventory.view',
    // Warehouse
    'warehouse.view',
    'warehouse.transfer',
    // Event
    'event.create',
    'event.update',
    'event.delete',
    'event.view',
    // Vehicle
    'vehicle.assign',
    'vehicle.view',
    // Employee
    'employee.view',
    'employee.manage',
    // Finance
    'finance.view',
    'finance.edit',
    // Reports
    'reports.view',
    // Settings
    'settings.manage',
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm, description: `Allows ${perm.replace('.', ' ')}` },
    });
  }
  console.log(`Created ${permissions.length} permissions.`);

  const allPerms = await prisma.permission.findMany();
  const permMap = allPerms.reduce(
    (acc, p) => ({ ...acc, [p.name]: p.id }),
    {} as Record<string, string>
  );

  // 2. Define Roles and their Permissions
  const roleDefinitions = [
    { name: 'Super Admin', isSystem: true, permissions: permissions }, // All permissions
    { name: 'Owner', isSystem: true, permissions: permissions },
    {
      name: 'Manager',
      isSystem: true,
      permissions: permissions.filter((p) => !p.includes('settings.manage')),
    },
    {
      name: 'Sales Executive',
      isSystem: true,
      permissions: [
        'dashboard.view',
        'customer.create',
        'customer.view',
        'event.create',
        'event.view',
      ],
    },
    {
      name: 'Warehouse Manager',
      isSystem: true,
      permissions: [
        'dashboard.view',
        'inventory.view',
        'inventory.create',
        'inventory.update',
        'warehouse.view',
        'warehouse.transfer',
      ],
    },
    {
      name: 'Viewer',
      isSystem: true,
      permissions: permissions.filter((p) => p.includes('.view')),
    },
  ];

  for (const roleDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { isSystem: roleDef.isSystem },
      create: { name: roleDef.name, isSystem: roleDef.isSystem },
    });

    // Assign permissions
    for (const permName of roleDef.permissions) {
      const permId = permMap[permName];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }

  // 3. Create Default Company & Seed Event Statuses
  const company = await prisma.company.upsert({
    where: { id: 'default-company' },
    update: {},
    create: {
      id: 'default-company',
      name: 'DecorFlow HQ',
    },
  });

  const eventStatuses = [
    'Inquiry',
    'Quotation',
    'Confirmed',
    'Planning',
    'Inventory Reserved',
    'Ready for Dispatch',
    'In Progress',
    'Completed',
    'Cancelled',
    'Archived',
  ];

  for (const statusName of eventStatuses) {
    const isTerminal = ['Completed', 'Cancelled', 'Archived'].includes(statusName);

    // Check if status exists for company
    const existingStatus = await prisma.eventStatus.findFirst({
      where: { companyId: company.id, name: statusName },
    });

    if (!existingStatus) {
      await prisma.eventStatus.create({
        data: {
          companyId: company.id,
          name: statusName,
          isTerminal,
        },
      });
    }
  }

  const eventTypes = ['Wedding', 'Corporate', 'Birthday', 'Exhibition'];
  for (const typeName of eventTypes) {
    const existingType = await prisma.eventType.findFirst({
      where: { companyId: company.id, name: typeName },
    });

    if (!existingType) {
      await prisma.eventType.create({
        data: {
          companyId: company.id,
          name: typeName,
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
