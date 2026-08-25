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
      data: { name: 'Ruturaj Farm', timeZone: 'Asia/Kolkata', currency: 'INR', language: 'en' },
    });
  } else {
    // Refresh org identity without clearing logoUrl
    company = await prisma.company.update({
      where: { id: company.id },
      data: { name: 'Ruturaj Farm', timeZone: 'Asia/Kolkata', currency: 'INR' },
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

  const demoPasswordHash = await bcrypt.hash('Password123!', 10);
  // Permanent Ruturaj Farm owner credentials (always synced on seed)
  const OWNER_EMAIL = 'ruturaj@decorflow.com';
  const OWNER_PASSWORD = 'Ruturaj@123';
  const ownerPasswordHash = await bcrypt.hash(OWNER_PASSWORD, 10);

  const resetDemoPasswords = process.argv.includes('--reset-demo-passwords');
  if (resetDemoPasswords) {
    console.log('SEED MODE: --reset-demo-passwords (will overwrite known demo user passwords)');
  } else {
    console.log('SEED MODE: create-if-missing for staff; always sync Ruturaj owner password');
  }

  // Primary owner — always ensure exists with permanent password + super admin
  {
    let owner = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
    if (!owner) {
      owner = await prisma.user.create({
        data: {
          email: OWNER_EMAIL,
          passwordHash: ownerPasswordHash,
          name: 'Ruturaj',
          companyId: company.id,
          isSuperAdmin: true,
          isActive: true,
          isLocked: false,
        },
      });
      console.log('Created permanent owner:', OWNER_EMAIL);
    } else {
      await prisma.user.update({
        where: { id: owner.id },
        data: {
          passwordHash: ownerPasswordHash,
          name: 'Ruturaj',
          companyId: company.id,
          isSuperAdmin: true,
          isActive: true,
          isLocked: false,
        },
      });
      console.log('Synced permanent owner credentials:', OWNER_EMAIL);
    }
  }

  const usersData = [
    { email: 'owner@decorflow.com', name: 'Ruturaj', isSuperAdmin: true, roleName: null },
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
    let user = await prisma.user.findUnique({ where: { email: u.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: u.email,
          passwordHash: demoPasswordHash,
          name: u.name,
          companyId: company.id,
          isSuperAdmin: u.isSuperAdmin,
          isActive: true,
        },
      });
      console.log('Created user:', u.email);
    } else if (resetDemoPasswords) {
      // Explicit manual demo reset only — never runs on normal deploy seed
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: demoPasswordHash },
      });
      console.log('Reset demo password:', u.email);
    } else {
      console.log('User already exists (password unchanged):', u.email);
    }

    if (u.roleName) {
      const roleId = roleMap[u.roleName].id;
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: roleId } },
        update: {},
        create: { userId: user.id, roleId: roleId },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
