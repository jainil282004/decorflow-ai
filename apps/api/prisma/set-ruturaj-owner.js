/**
 * One-shot: set permanent Ruturaj Farm owner login.
 * Email: ruturaj@decorflow.com
 * Password: Ruturaj@123
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const EMAIL = 'ruturaj@decorflow.com';
const PASSWORD = 'Ruturaj@123';

async function main() {
  const prisma = new PrismaClient();
  try {
    const company = await prisma.company.findFirst();
    if (!company) throw new Error('No company found');

    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    let user = await prisma.user.findUnique({ where: { email: EMAIL } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: EMAIL,
          passwordHash,
          name: 'Ruturaj',
          companyId: company.id,
          isSuperAdmin: true,
          isActive: true,
          isLocked: false,
        },
      });
      console.log('CREATED', EMAIL);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          name: 'Ruturaj',
          companyId: company.id,
          isSuperAdmin: true,
          isActive: true,
          isLocked: false,
        },
      });
      console.log('UPDATED', EMAIL);
    }

    const ok = await bcrypt.compare(PASSWORD, user.passwordHash);
    console.log(
      JSON.stringify({
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        isLocked: user.isLocked,
        passwordVerified: ok,
        company: company.name,
      })
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
