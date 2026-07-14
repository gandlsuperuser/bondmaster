import { PrismaClient, UserRoleEnum } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-bonds' },
    update: {},
    create: {
      name: 'Demo Bonds LLC',
      slug: 'demo-bonds',
    },
  });

  // 2. Create Admin User
  const passwordHash = await hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo-bonds.com' },
    update: {},
    create: {
      email: 'admin@demo-bonds.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash,
      role: UserRoleEnum.administrator,
      orgId: org.id,
      isActive: true,
    },
  });

  // 3. Create Defendants
  const def1 = await prisma.defendant.create({
    data: {
      orgId: org.id,
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1990-01-01'),
    }
  });

  const def2 = await prisma.defendant.create({
    data: {
      orgId: org.id,
      firstName: 'Sarah',
      lastName: 'Smith',
      dob: new Date('1985-05-15'),
    }
  });

  // 4. Create Bonds
  const bond1 = await prisma.bond.create({
    data: {
      orgId: org.id,
      defendantId: def1.id,
      amount: 10000,
      status: 'Active',
      charges: {
        create: [
          { description: 'Theft', degree: 'Misdemeanor' }
        ]
      }
    }
  });

  const bond2 = await prisma.bond.create({
    data: {
      orgId: org.id,
      defendantId: def2.id,
      amount: 25000,
      status: 'Active',
      charges: {
        create: [
          { description: 'Assault', degree: 'Felony' }
        ]
      }
    }
  });

  // 5. Create Payments (Revenue)
  await prisma.payment.create({
    data: {
      bondId: bond1.id,
      amount: 1000, // 10% premium
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    }
  });

  await prisma.payment.create({
    data: {
      bondId: bond2.id,
      amount: 2500, // 10% premium
      date: new Date(),
    }
  });

  // 6. Court Data
  const court = await prisma.court.create({
    data: { name: 'Dallas County Court' }
  });

  const case1 = await prisma.courtCase.create({
    data: { courtId: court.id, caseNumber: 'CR-2026-001' }
  });

  await prisma.courtDate.create({
    data: {
      courtCaseId: case1.id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      appearances: {
        create: [
          { defendantId: def1.id, status: 'Scheduled' }
        ]
      }
    }
  });

  // 7. Check-Ins
  await prisma.checkIn.create({
    data: {
      defendantId: def1.id,
      status: 'Verified',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
      location: {
        create: { lat: 32.7767, lng: -96.7970 } // Dallas
      }
    }
  });

  await prisma.checkIn.create({
    data: {
      defendantId: def2.id,
      status: 'Verified',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      location: {
        create: { lat: 30.2672, lng: -97.7431 } // Austin
      }
    }
  });

  console.log('Seeding complete! You can log in with:');
  console.log('Email: admin@demo-bonds.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
