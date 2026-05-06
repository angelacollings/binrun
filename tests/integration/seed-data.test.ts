import { afterAll, describe, expect, it } from 'vitest';

import { createPrismaTestClient } from './prisma-test-client';

const prisma = createPrismaTestClient();
const sampleEmails = ['angela@example.com', 'sam@example.com'];
const expectedBinTypes = [
  'GREEN_WASTE_WHEELIE',
  'RECYCLING_BINS',
  'RUBBISH_BAGS',
  'RUBBISH_WHEELIE',
];

afterAll(async () => {
  await prisma.$disconnect();
});

describe('seed data contract', () => {
  it('creates the expected sample customer records', async () => {
    const [users, properties, bins, subscriptions, serviceAreas, collectionSchedules] =
      await Promise.all([
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
        prisma.serviceArea.count({
          where: {
            name: 'Whangarei Urban',
          },
        }),
        prisma.collectionSchedule.count({
          where: {
            serviceArea: {
              name: 'Whangarei Urban',
            },
          },
        }),
      ]);

    expect({ users, properties, bins, subscriptions, serviceAreas, collectionSchedules }).toEqual({
      users: 2,
      properties: 3,
      bins: 7,
      subscriptions: 2,
      serviceAreas: 1,
      collectionSchedules: 4,
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

  it('caps prepaid rubbish bag service at three bags per collection', async () => {
    const rubbishBags = await prisma.bin.findMany({
      orderBy: [
        {
          property: {
            label: 'asc',
          },
        },
      ],
      select: {
        label: true,
        maxQuantity: true,
        property: {
          select: {
            label: true,
          },
        },
        type: true,
      },
      where: {
        type: 'RUBBISH_BAGS',
        property: {
          user: {
            email: {
              in: sampleEmails,
            },
          },
        },
      },
    });

    expect(rubbishBags).toEqual([
      {
        label: 'Council prepaid rubbish bags',
        maxQuantity: 3,
        property: {
          label: 'Home',
        },
        type: 'RUBBISH_BAGS',
      },
      {
        label: 'Council prepaid rubbish bags',
        maxQuantity: 3,
        property: {
          label: 'Rental',
        },
        type: 'RUBBISH_BAGS',
      },
    ]);
  });

  it('connects sample properties to a service area with collection schedules', async () => {
    const properties = await prisma.property.findMany({
      orderBy: {
        label: 'asc',
      },
      select: {
        label: true,
        serviceArea: {
          select: {
            name: true,
            schedules: {
              orderBy: {
                binType: 'asc',
              },
              select: {
                binType: true,
                collectionDay: true,
                frequency: true,
              },
            },
          },
        },
      },
      where: {
        user: {
          email: {
            in: sampleEmails,
          },
        },
      },
    });

    expect(properties).toEqual([
      {
        label: 'Airbnb',
        serviceArea: expect.objectContaining({
          name: 'Whangarei Urban',
        }),
      },
      {
        label: 'Home',
        serviceArea: expect.objectContaining({
          name: 'Whangarei Urban',
        }),
      },
      {
        label: 'Rental',
        serviceArea: expect.objectContaining({
          name: 'Whangarei Urban',
        }),
      },
    ]);

    expect(properties[0]?.serviceArea?.schedules).toEqual([
      {
        binType: 'RECYCLING_BINS',
        collectionDay: 'TUESDAY',
        frequency: 'FORTNIGHTLY',
      },
      {
        binType: 'RUBBISH_BAGS',
        collectionDay: 'TUESDAY',
        frequency: 'WEEKLY',
      },
      {
        binType: 'RUBBISH_WHEELIE',
        collectionDay: 'TUESDAY',
        frequency: 'WEEKLY',
      },
      {
        binType: 'GREEN_WASTE_WHEELIE',
        collectionDay: 'THURSDAY',
        frequency: 'FORTNIGHTLY',
      },
    ]);
  });
});
