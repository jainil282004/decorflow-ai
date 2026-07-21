import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@decorflow.com';
  const password = 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, isSuperAdmin: true },
    });
    console.log(`Password reset for ${email}`);
  } else {
    // Get default company
    let company = await prisma.company.findUnique({ where: { id: 'default-company' } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          id: 'default-company',
          name: 'DecorFlow HQ',
        },
      });
    }

    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: email,
        passwordHash: passwordHash,
        companyId: company.id,
        isSuperAdmin: true,
      },
    });
    console.log(`User created: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
