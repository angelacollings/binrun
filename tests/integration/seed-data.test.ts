import 'dotenv/config';

import { afterAll, describe, expect, it } from 'vitest';

import { auth } from '../../auth';
import { createPrismaTestClient } from './prisma-test-client';

const prisma = createPrismaTestClient();
const sampleCustomerEmails = ['angela@example.com', 'sam@example.com'];
const sampleStaffEmails = ['worker@example.com', 'admin@example.com'];
const sampleEmails = [...sampleCustomerEmails, ...sampleStaffEmails];
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
    const [
      users,
      properties,
      bins,
      subscriptions,
      serviceAreas,
      collectionSchedules,
      serviceVisits,
      servicePackages,
      propertyServices,
      propertyServiceItems,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          email: {
            in: sampleCustomerEmails,
          },
        },
      }),
      prisma.property.count({
        where: {
          user: {
            email: {
              in: sampleCustomerEmails,
            },
          },
        },
      }),
      prisma.bin.count({
        where: {
          property: {
            user: {
              email: {
                in: sampleCustomerEmails,
              },
            },
          },
        },
      }),
      prisma.subscription.count({
        where: {
          user: {
            email: {
              in: sampleCustomerEmails,
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
      prisma.serviceVisit.count({
        where: {
          property: {
            user: {
              email: {
                in: sampleCustomerEmails,
              },
            },
          },
        },
      }),
      prisma.servicePackage.count(),
      prisma.propertyService.count({
        where: {
          property: {
            user: {
              email: {
                in: sampleCustomerEmails,
              },
            },
          },
        },
      }),
      prisma.propertyServiceItem.count({
        where: {
          propertyService: {
            property: {
              user: {
                email: {
                  in: sampleCustomerEmails,
                },
              },
            },
          },
        },
      }),
    ]);

    expect({
      users,
      properties,
      bins,
      subscriptions,
      serviceAreas,
      collectionSchedules,
      serviceVisits,
      servicePackages,
      propertyServices,
      propertyServiceItems,
    }).toEqual({
      users: 2,
      properties: 3,
      bins: 7,
      subscriptions: 2,
      serviceAreas: 1,
      collectionSchedules: 4,
      serviceVisits: 7,
      servicePackages: 5,
      propertyServices: 3,
      propertyServiceItems: 7,
    });
  });

  it('creates customer, worker, and admin role examples', async () => {
    const users = await prisma.user.findMany({
      orderBy: {
        email: 'asc',
      },
      select: {
        email: true,
        role: true,
      },
      where: {
        email: {
          in: sampleEmails,
        },
      },
    });

    expect(users).toEqual([
      {
        email: 'admin@example.com',
        role: 'ADMIN',
      },
      {
        email: 'angela@example.com',
        role: 'CUSTOMER',
      },
      {
        email: 'sam@example.com',
        role: 'CUSTOMER',
      },
      {
        email: 'worker@example.com',
        role: 'WORKER',
      },
    ]);
  });

  it('stores credential account password hashes for local sample logins', async () => {
    const credentials = await prisma.account.findMany({
      orderBy: {
        user: {
          email: 'asc',
        },
      },
      select: {
        password: true,
        providerId: true,
        user: {
          select: {
            email: true,
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

    expect(credentials).toHaveLength(4);
    expect(credentials).toEqual(
      expect.arrayContaining(
        sampleEmails.map((email) =>
          expect.objectContaining({
            password: expect.not.stringContaining('BinRun-local-2026'),
            providerId: 'credential',
            user: {
              email,
            },
          })
        )
      )
    );
  });

  it('allows a seeded customer to sign in through Better Auth', async () => {
    const result = await auth.api.signInEmail({
      body: {
        email: 'angela@example.com',
        password: 'BinRun-local-2026',
      },
      headers: new Headers({
        host: 'localhost:3000',
      }),
    });

    expect(result.user).toMatchObject({
      email: 'angela@example.com',
      role: 'CUSTOMER',
    });
    expect(result.token).toEqual(expect.any(String));
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
              in: sampleCustomerEmails,
            },
          },
        },
      },
    });

    expect(binTypes.map((bin) => bin.type).sort()).toEqual(expectedBinTypes);
  });

  it('seeds package-backed property services', async () => {
    const services = await prisma.propertyService.findMany({
      orderBy: [
        {
          property: {
            label: 'asc',
          },
        },
      ],
      select: {
        frequency: true,
        items: {
          orderBy: [
            {
              type: 'asc',
            },
            {
              binType: 'asc',
            },
          ],
          select: {
            binType: true,
            quantity: true,
            type: true,
          },
        },
        package: {
          select: {
            name: true,
          },
        },
        property: {
          select: {
            label: true,
          },
        },
        status: true,
      },
      where: {
        property: {
          user: {
            email: {
              in: sampleCustomerEmails,
            },
          },
        },
      },
    });

    expect(services).toEqual([
      expect.objectContaining({
        frequency: 'ON_DEMAND',
        package: {
          name: 'One-Off Clean',
        },
        property: {
          label: 'Airbnb',
        },
        status: 'PENDING',
      }),
      expect.objectContaining({
        frequency: 'WEEKLY',
        package: {
          name: 'Regular Run',
        },
        property: {
          label: 'Home',
        },
        status: 'ACTIVE',
      }),
      expect.objectContaining({
        frequency: 'WEEKLY',
        package: {
          name: 'Regular Run + Wash',
        },
        property: {
          label: 'Rental',
        },
        status: 'ACTIVE',
      }),
    ]);
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
              in: sampleCustomerEmails,
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
            in: sampleCustomerEmails,
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
