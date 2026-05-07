import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

import { getDatabaseEnv } from '../lib/env.mjs';

const sampleCustomerEmails = ['angela@example.com', 'sam@example.com'];
const sampleStaffEmails = ['worker@example.com', 'admin@example.com'];
const sampleEmails = [...sampleCustomerEmails, ...sampleStaffEmails];
const samplePassword = 'BinRun-local-2026';
const localSeedHosts = new Set(['localhost', '127.0.0.1', '::1', 'db']);

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function localScheduleDate(daysFromToday, hour, minute = 0) {
  const date = addDays(new Date(), daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function assertSafeSeedTarget({ databaseUrl, nodeEnv }) {
  if (nodeEnv === 'production') {
    throw new Error('Refusing to seed while NODE_ENV=production.');
  }

  const parsedDatabaseUrl = new URL(databaseUrl);

  if (!localSeedHosts.has(parsedDatabaseUrl.hostname)) {
    throw new Error(
      `Refusing to seed non-local database host "${parsedDatabaseUrl.hostname}". Use a local/test database.`
    );
  }
}

function getPrismaClient() {
  const databaseEnv = getDatabaseEnv();

  assertSafeSeedTarget(databaseEnv);

  return new PrismaClient({
    adapter: new PrismaMariaDb(databaseEnv.databaseUrl),
    log: ['warn', 'error'],
  });
}

async function main() {
  const prisma = getPrismaClient();

  try {
    const samplePasswordHash = await hash(samplePassword);

    await prisma.user.deleteMany({
      where: {
        email: {
          in: sampleEmails,
        },
      },
    });

    const whangareiUrban = await prisma.serviceArea.upsert({
      where: {
        name: 'Whangarei Urban',
      },
      update: {
        active: true,
        city: 'Whangarei',
        notes: 'Sample local service area for customer dashboard development.',
      },
      create: {
        active: true,
        city: 'Whangarei',
        name: 'Whangarei Urban',
        notes: 'Sample local service area for customer dashboard development.',
      },
    });

    await prisma.collectionSchedule.deleteMany({
      where: {
        serviceAreaId: whangareiUrban.id,
      },
    });

    await prisma.collectionSchedule.createMany({
      data: [
        {
          serviceAreaId: whangareiUrban.id,
          binType: 'RECYCLING_BINS',
          collectionDay: 'TUESDAY',
          frequency: 'FORTNIGHTLY',
        },
        {
          serviceAreaId: whangareiUrban.id,
          binType: 'RUBBISH_BAGS',
          collectionDay: 'TUESDAY',
          frequency: 'WEEKLY',
        },
        {
          serviceAreaId: whangareiUrban.id,
          binType: 'RUBBISH_WHEELIE',
          collectionDay: 'TUESDAY',
          frequency: 'WEEKLY',
        },
        {
          serviceAreaId: whangareiUrban.id,
          binType: 'GREEN_WASTE_WHEELIE',
          collectionDay: 'THURSDAY',
          frequency: 'FORTNIGHTLY',
          weekOffset: 1,
        },
      ],
    });

    await prisma.user.create({
      data: {
        email: 'angela@example.com',
        emailVerified: true,
        name: 'Angela Collings',
        accounts: {
          create: {
            accountId: 'angela@example.com',
            providerId: 'credential',
            password: samplePasswordHash,
          },
        },
        role: 'CUSTOMER',
        subscriptions: {
          create: {
            status: 'ACTIVE',
            stripeCustomerId: 'cus_seed_angela',
            stripeSubscriptionId: 'sub_seed_angela',
            currentPeriodEnd: new Date('2026-06-01T00:00:00.000Z'),
          },
        },
        properties: {
          create: [
            {
              label: 'Home',
              addressLine1: '12 Riverside Road',
              serviceAreaId: whangareiUrban.id,
              suburb: 'Kensington',
              city: 'Whangarei',
              postcode: '0112',
              collectionNotes: 'Bins are beside the side gate.',
              bins: {
                create: [
                  {
                    type: 'RECYCLING_BINS',
                    label: 'Red and blue recycling bins',
                    collectionDay: 'TUESDAY',
                  },
                  {
                    type: 'RUBBISH_BAGS',
                    label: 'Council prepaid rubbish bags',
                    maxQuantity: 3,
                    collectionDay: 'TUESDAY',
                  },
                  {
                    type: 'GREEN_WASTE_WHEELIE',
                    label: 'Green waste wheelie bin',
                    collectionDay: 'THURSDAY',
                  },
                ],
              },
            },
            {
              label: 'Rental',
              addressLine1: '48 Harbour View Terrace',
              serviceAreaId: whangareiUrban.id,
              suburb: 'Onerahi',
              city: 'Whangarei',
              postcode: '0110',
              collectionNotes: 'Access via shared driveway.',
              bins: {
                create: [
                  {
                    type: 'RECYCLING_BINS',
                    label: 'Red and blue recycling bins',
                    collectionDay: 'WEDNESDAY',
                  },
                  {
                    type: 'RUBBISH_BAGS',
                    label: 'Council prepaid rubbish bags',
                    maxQuantity: 3,
                    collectionDay: 'WEDNESDAY',
                  },
                ],
              },
            },
          ],
        },
      },
    });

    await prisma.user.create({
      data: {
        email: 'sam@example.com',
        emailVerified: true,
        name: 'Sam Taylor',
        accounts: {
          create: {
            accountId: 'sam@example.com',
            providerId: 'credential',
            password: samplePasswordHash,
          },
        },
        role: 'CUSTOMER',
        subscriptions: {
          create: {
            status: 'PENDING',
          },
        },
        properties: {
          create: {
            label: 'Airbnb',
            addressLine1: '7 Puriri Street',
            serviceAreaId: whangareiUrban.id,
            suburb: 'Kamo',
            city: 'Whangarei',
            postcode: '0112',
            collectionNotes: 'Collect bins from behind the front fence.',
            bins: {
              create: [
                {
                  type: 'RECYCLING_BINS',
                  label: 'Red and blue recycling bins',
                  collectionDay: 'MONDAY',
                },
                {
                  type: 'RUBBISH_WHEELIE',
                  label: 'Rubbish wheelie bin',
                  collectionDay: 'MONDAY',
                },
              ],
            },
          },
        },
      },
    });

    const runProperties = await prisma.property.findMany({
      orderBy: {
        label: 'asc',
      },
      select: {
        bins: {
          orderBy: {
            type: 'asc',
          },
          select: {
            id: true,
            type: true,
          },
        },
        id: true,
        label: true,
      },
      where: {
        user: {
          email: {
            in: sampleCustomerEmails,
          },
        },
      },
    });

    const propertyDayOffsets = {
      Airbnb: 0,
      Home: 0,
      Rental: 1,
    };
    const propertyStartHours = {
      Airbnb: 9,
      Home: 7,
      Rental: 8,
    };
    const binStatus = {
      GREEN_WASTE_WHEELIE: 'PLANNED',
      RECYCLING_BINS: 'PLANNED',
      RUBBISH_BAGS: 'IN_PROGRESS',
      RUBBISH_WHEELIE: 'MISSED',
    };

    await prisma.serviceVisit.createMany({
      data: runProperties.flatMap((property) =>
        property.bins.map((bin, index) => ({
          binId: bin.id,
          notes:
            bin.type === 'RUBBISH_WHEELIE'
              ? 'Customer reported the wheelie bin may be behind the side fence.'
              : null,
          propertyId: property.id,
          scheduledFor: localScheduleDate(
            propertyDayOffsets[property.label] ?? 2,
            (propertyStartHours[property.label] ?? 9) + index,
            index % 2 === 0 ? 0 : 30
          ),
          status: binStatus[bin.type] ?? 'PLANNED',
        }))
      ),
    });

    await prisma.user.create({
      data: {
        email: 'worker@example.com',
        emailVerified: true,
        name: 'BinRun Worker',
        accounts: {
          create: {
            accountId: 'worker@example.com',
            providerId: 'credential',
            password: samplePasswordHash,
          },
        },
        role: 'WORKER',
      },
    });

    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        emailVerified: true,
        name: 'BinRun Admin',
        accounts: {
          create: {
            accountId: 'admin@example.com',
            providerId: 'credential',
            password: samplePasswordHash,
          },
        },
        role: 'ADMIN',
      },
    });

    console.log(
      `Seeded ${sampleCustomerEmails.length} customers and ${sampleStaffEmails.length} staff users with local password "${samplePassword}".`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
