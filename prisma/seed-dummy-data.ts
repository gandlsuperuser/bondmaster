import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "Terry", "Sarah", "John", "Rhonda", "Ashan", "Elinita", "Gary", "James", "Rhonda", "Janet", 
  "Tyrone", "Doreen", "Nicolas", "Ahsan", "Steve"
];

const LAST_NAMES = [
  "Anderson", "Smith", "Doe", "Franks", "Warsi", "Vigil", "Reemer", "Aldene", "Casson", "Janet", 
  "Black", "Aldeen", "Casso", "Smith", "Baldwin"
];

const MONTHS = [0, 1, 2, 3, 4, 5, 6]; // Jan (0) to Jul (6)

async function main() {
  console.log('Seeding 15 dummy bonds and payments...');

  // Get Organization
  const org = await prisma.organization.findUnique({
    where: { slug: 'demo-bonds' },
  });

  if (!org) {
    console.error('Error: Organization with slug "demo-bonds" not found. Please run create-admin first.');
    process.exit(1);
  }

  // Clear existing records in correct order to prevent FK violations
  await prisma.payment.deleteMany({ where: { bond: { orgId: org.id } } });
  await prisma.courtAppearance.deleteMany({ where: { defendant: { orgId: org.id } } });
  await prisma.checkInLocation.deleteMany({ where: { checkIn: { defendant: { orgId: org.id } } } });
  await prisma.checkIn.deleteMany({ where: { defendant: { orgId: org.id } } });
  await prisma.bond.deleteMany({ where: { orgId: org.id } });
  await prisma.defendant.deleteMany({ where: { orgId: org.id } });

  // Create Court and Cases
  const court = await prisma.court.create({
    data: { name: 'Dallas County Criminal Court' }
  });

  const courtCase = await prisma.courtCase.create({
    data: { courtId: court.id, caseNumber: 'F-2026-9938' }
  });

  const now = new Date();

  // Create 15 Defendants, Bonds, and Payments
  for (let i = 0; i < 15; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    
    // Distribute across months (Jan to Jul)
    const month = MONTHS[i % MONTHS.length];
    const date = new Date(now.getFullYear(), month, 10 + (i * 2), 10, 0, 0);

    const defendant = await prisma.defendant.create({
      data: {
        orgId: org.id,
        firstName,
        lastName,
        dob: new Date(1980 + i, i % 12, 15),
        createdAt: date,
        updatedAt: date,
      }
    });

    // Random bond amounts: 5k, 10k, 15k, 25k, 50k
    const bondAmounts = [5000, 10000, 15000, 25000, 50000];
    const amount = bondAmounts[i % bondAmounts.length];

    // Arrest date is 2 days before release
    const arrestDate = new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000);
    const releasedDate = date;

    const bond = await prisma.bond.create({
      data: {
        orgId: org.id,
        defendantId: defendant.id,
        amount,
        status: 'Active',
        arrestDate,
        releasedDate,
        createdAt: date,
        updatedAt: date,
      }
    });

    // Create 10% premium payment
    await prisma.payment.create({
      data: {
        bondId: bond.id,
        amount: amount * 0.10,
        date: date,
      }
    });

    // Create one future court appearance if it's recent (June/July)
    if (month >= 5) {
      const courtDate = await prisma.courtDate.create({
        data: {
          courtCaseId: courtCase.id,
          date: new Date(now.getFullYear(), month, 20 + i, 9, 30, 0),
        }
      });

      await prisma.courtAppearance.create({
        data: {
          courtDateId: courtDate.id,
          defendantId: defendant.id,
          status: i % 2 === 0 ? 'Scheduled' : 'Pending',
        }
      });
    }

    // Create a CheckIn
    await prisma.checkIn.create({
      data: {
        defendantId: defendant.id,
        status: 'Verified',
        timestamp: new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after bond
        location: {
          create: {
            lat: 32.7767 + (Math.random() * 0.1 - 0.05),
            lng: -96.7970 + (Math.random() * 0.1 - 0.05),
          }
        }
      }
    });
  }

  console.log('Seeded 15 Defendants, Bonds, and Payments successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
