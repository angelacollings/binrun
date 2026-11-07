import 'dotenv/config';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  ActivePropertyServiceError,
  createPropertySchema,
  createUserProperty,
  deactivateUserProperty,
  listUserProperties,
  updateUserProperty,
} from '../../lib/properties/service';
import { createPrismaTestClient } from './prisma-test-client';

const prisma = createPrismaTestClient();
const runId = `properties-${Date.now()}`;
const primaryEmail = `${runId}-primary@example.com`;
const otherEmail = `${runId}-other@example.com`;

let primaryUserId: string;
let otherUserId: string;
let primaryPropertyId: string;

beforeAll(async () => {
  const [primaryUser, otherUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: primaryEmail,
        name: 'Primary Test Customer',
      },
      select: {
        id: true,
      },
    }),
    prisma.user.create({
      data: {
        email: otherEmail,
        name: 'Other Test Customer',
      },
      select: {
        id: true,
      },
    }),
  ]);

  primaryUserId = primaryUser.id;
  otherUserId = otherUser.id;

  const property = await createUserProperty(primaryUserId, {
    addressLine1: '10 Test Lane',
    addressLine2: null,
    city: 'Whangarei',
    collectionNotes: 'Gate code is fake.',
    label: 'Home',
    postcode: '0110',
    suburb: 'Avenues',
  });

  primaryPropertyId = property.id;

  await createUserProperty(otherUserId, {
    addressLine1: '20 Other Road',
    city: 'Whangarei',
    label: 'Other home',
    suburb: 'Onerahi',
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [primaryEmail, otherEmail],
      },
    },
  });
  await prisma.$disconnect();
});

describe('properties API service contract', () => {
  it('lists only active properties owned by the current user', async () => {
    const [primaryProperties, otherProperties] = await Promise.all([
      listUserProperties(primaryUserId),
      listUserProperties(otherUserId),
    ]);

    expect(primaryProperties).toHaveLength(1);
    expect(primaryProperties[0]).toMatchObject({
      active: true,
      addressLine1: '10 Test Lane',
      id: primaryPropertyId,
      label: 'Home',
    });
    expect(otherProperties).toHaveLength(1);
    expect(otherProperties[0]?.id).not.toBe(primaryPropertyId);
  });

  it('validates and normalizes property input', () => {
    expect(
      createPropertySchema.parse({
        addressLine1: '  30 Trimmed Street  ',
        collectionNotes: '',
        label: '  Rental  ',
        postcode: '',
      })
    ).toMatchObject({
      addressLine1: '30 Trimmed Street',
      city: 'Whangarei',
      collectionNotes: null,
      label: 'Rental',
      postcode: null,
    });

    expect(() =>
      createPropertySchema.parse({
        addressLine1: '',
        label: 'x'.repeat(81),
      })
    ).toThrow();
  });

  it('updates only properties owned by the current user', async () => {
    const blockedUpdate = await updateUserProperty(otherUserId, primaryPropertyId, {
      label: 'Hijacked',
    });

    expect(blockedUpdate).toBeNull();

    const updatedProperty = await updateUserProperty(primaryUserId, primaryPropertyId, {
      label: 'Updated home',
      suburb: 'Morningside',
    });

    expect(updatedProperty).toMatchObject({
      id: primaryPropertyId,
      label: 'Updated home',
      suburb: 'Morningside',
    });
  });

  it('deactivates owned properties without deleting dependent rows', async () => {
    const servicePackage = await prisma.servicePackage.findFirstOrThrow({
      select: {
        id: true,
      },
    });
    const bin = await prisma.bin.create({
      data: {
        propertyId: primaryPropertyId,
        type: 'RECYCLING_BINS',
      },
      select: {
        id: true,
      },
    });
    const pendingService = await prisma.propertyService.create({
      data: {
        packageId: servicePackage.id,
        propertyId: primaryPropertyId,
        status: 'PENDING',
      },
      select: {
        id: true,
      },
    });
    const pendingSubscription = await prisma.subscription.create({
      data: {
        propertyServiceId: pendingService.id,
        status: 'PENDING',
        userId: primaryUserId,
      },
      select: {
        id: true,
      },
    });

    await expect(deactivateUserProperty(otherUserId, primaryPropertyId)).resolves.toBe(false);
    await expect(deactivateUserProperty(primaryUserId, primaryPropertyId)).resolves.toBe(true);

    await expect(listUserProperties(primaryUserId)).resolves.toEqual([]);

    const preservedBin = await prisma.bin.findUnique({
      select: {
        propertyId: true,
      },
      where: {
        id: bin.id,
      },
    });

    expect(preservedBin).toEqual({
      propertyId: primaryPropertyId,
    });

    await expect(
      prisma.propertyService.findUnique({
        select: {
          canceledAt: true,
          status: true,
        },
        where: {
          id: pendingService.id,
        },
      })
    ).resolves.toMatchObject({
      canceledAt: expect.any(Date),
      status: 'CANCELED',
    });

    await expect(
      prisma.subscription.findUnique({
        select: {
          canceledAt: true,
          status: true,
        },
        where: {
          id: pendingSubscription.id,
        },
      })
    ).resolves.toMatchObject({
      canceledAt: expect.any(Date),
      status: 'CANCELED',
    });
  });

  it('blocks deactivation while a property has an active service', async () => {
    const property = await createUserProperty(primaryUserId, {
      addressLine1: '40 Active Service Road',
      city: 'Whangarei',
      label: 'Active service property',
      suburb: 'Kamo',
    });
    const servicePackage = await prisma.servicePackage.findFirstOrThrow({
      select: {
        id: true,
      },
    });

    await prisma.propertyService.create({
      data: {
        packageId: servicePackage.id,
        propertyId: property.id,
        status: 'ACTIVE',
      },
    });

    await expect(deactivateUserProperty(primaryUserId, property.id)).rejects.toBeInstanceOf(
      ActivePropertyServiceError
    );

    await expect(
      prisma.property.findUnique({
        select: {
          active: true,
        },
        where: {
          id: property.id,
        },
      })
    ).resolves.toEqual({
      active: true,
    });
  });
});
