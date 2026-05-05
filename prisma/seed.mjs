import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

import { getDatabaseEnv } from '../lib/env.mjs';

const sampleEmails = ['angela@example.com', 'sam@example.com'];
const localSeedHosts = new Set(['localhost', '127.0.0.1', '::1', 'db']);

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
    await prisma.user.deleteMany({
      where: {
        email: {
          in: sampleEmails,
        },
      },
    });

    await prisma.user.create({
      data: {
        email: 'angela@example.com',
        emailVerified: new Date(),
        name: 'Angela Collings',
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
                    type: 'RUBBISH_WHEELIE',
                    label: 'Rubbish wheelie bin',
                    collectionDay: 'TUESDAY',
                  },
                  {
                    type: 'GREEN_WASTE_WHEELIE',
                    label: 'Green waste wheelie bin',
                    collectionDay: 'TUESDAY',
                  },
                ],
              },
            },
            {
              label: 'Rental',
              addressLine1: '48 Harbour View Terrace',
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
                    type: 'RUBBISH_WHEELIE',
                    label: 'Rubbish wheelie bin',
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
        emailVerified: new Date(),
        name: 'Sam Taylor',
        subscriptions: {
          create: {
            status: 'PENDING',
          },
        },
        properties: {
          create: {
            label: 'Airbnb',
            addressLine1: '7 Puriri Street',
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

    console.log(`Seeded ${sampleEmails.length} users with properties, bins, and subscriptions.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
