import { PrismaClient, UserRoleEnum } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('123123', 10);

  // Ensure org exists
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-bonds' },
    update: {},
    create: {
      name: 'Country Boy Bail Bonds',
      slug: 'demo-bonds',
    },
  });

  // Upsert admin user
  const admin = await prisma.user.upsert({
    where: { email: 'countryboybailbond@gmail.com' },
    update: { passwordHash, role: UserRoleEnum.administrator, isActive: true },
    create: {
      email: 'countryboybailbond@gmail.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash,
      role: UserRoleEnum.administrator,
      orgId: org.id,
      isActive: true,
    },
  });

  console.log('Admin user created/updated:');
  console.log('  Email: countryboybailbond@gmail.com');
  console.log('  Password: 123123');
  console.log('  ID:', admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
