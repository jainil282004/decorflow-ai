import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@decorflow.com';
  const password = 'Password@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const role = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
  if (!role) throw new Error('Super Admin role not found. Did you run the seed?');

  const company = await prisma.company.findUnique({ where: { id: 'default-company' } });
  if (!company) throw new Error('Default company not found. Did you run the seed?');

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      companyId: company.id,
      isActive: true,
    },
    create: {
      email,
      name: 'Demo Admin',
      passwordHash,
      companyId: company.id,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });

  console.log(`User created successfully! Email: ${email} | Password: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
