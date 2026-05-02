import { afterAll, describe, expect, it } from 'vitest';

import { createPrismaTestClient } from './prisma-test-client';

const prisma = createPrismaTestClient();
const sampleEmails = ['angela@example.com', 'sam@example.com'];
const expectedBinTypes = ['GREEN_WASTE_WHEELIE', 'RECYCLING_BINS', 'RUBBISH_WHEELIE'];

afterAll(async () => {
  await prisma.$disconnect();
});

describe('seed data contract', () => {
  it('creates the expected sample customer records', async () => {
    const [users, properties, bins, subscriptions] = await Promise.all([
      prisma.user.count({
        where: {
          email: {
            in: sampleEmails,
          },
        },
      }),
      prisma.property.count({
        where: {
          user: {
            email: {
              in: sampleEmails,
            },
          },
        },
      }),
      prisma.bin.count({
        where: {
          property: {
            user: {
              email: {
                in: sampleEmails,
              },
            },
          },
        },
      }),
      prisma.subscription.count({
        where: {
          user: {
            email: {
              in: sampleEmails,
            },
          },
        },
      }),
    ]);

    expect({ users, properties, bins, subscriptions }).toEqual({
      users: 2,
      properties: 3,
      bins: 7,
      subscriptions: 2,
    });
  });

  it('uses only the service-facing bin options', async () => {
    const binTypes = await prisma.bin.findMany({
      distinct: ['type'],
      orderBy: {
        type: 'asc',
      },
      select: {
        type: true,
      },
      where: {
        property: {
          user: {
            email: {
              in: sampleEmails,
            },
          },
        },
      },
    });

    expect(binTypes.map((bin) => bin.type).sort()).toEqual(expectedBinTypes);
  });

  it('models red and blue recycling bins as one service item per property', async () => {
    const recyclingBins = await prisma.bin.findMany({
      orderBy: [
        {
          property: {
            label: 'asc',
          },
        },
      ],
      select: {
        label: true,
        property: {
          select: {
            label: true,
          },
        },
        type: true,
      },
      where: {
        type: 'RECYCLING_BINS',
        property: {
          user: {
            email: {
              in: sampleEmails,
            },
          },
        },
      },
    });

    expect(recyclingBins).toEqual([
      {
        label: 'Red and blue recycling bins',
        property: {
          label: 'Airbnb',
        },
        type: 'RECYCLING_BINS',
      },
      {
        label: 'Red and blue recycling bins',
        property: {
          label: 'Home',
        },
        type: 'RECYCLING_BINS',
      },
      {
        label: 'Red and blue recycling bins',
        property: {
          label: 'Rental',
        },
        type: 'RECYCLING_BINS',
      },
    ]);
  });
});
