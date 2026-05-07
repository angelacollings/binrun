import 'dotenv/config';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createPropertyBin,
  createBinSchema,
  DuplicateBinTypeError,
  listPropertyBins,
  removePropertyBin,
  updatePropertyBin,
} from '../../lib/bins/service';
import { createUserProperty } from '../../lib/properties/service';
import { createPrismaTestClient } from './prisma-test-client';

const prisma = createPrismaTestClient();
const runId = `bins-${Date.now()}`;
const primaryEmail = `${runId}-primary@example.com`;
const otherEmail = `${runId}-other@example.com`;

let primaryUserId: string;
let otherUserId: string;
let primaryPropertyId: string;
let otherPropertyId: string;
let recyclingBinId: string;

beforeAll(async () => {
  const [primaryUser, otherUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: primaryEmail,
        name: 'Primary Bin Customer',
      },
      select: {
        id: true,
      },
    }),
    prisma.user.create({
      data: {
        email: otherEmail,
        name: 'Other Bin Customer',
      },
      select: {
        id: true,
      },
    }),
  ]);

  primaryUserId = primaryUser.id;
  otherUserId = otherUser.id;

  const [primaryProperty, otherProperty] = await Promise.all([
    createUserProperty(primaryUserId, {
      addressLine1: '11 Bin Test Road',
      city: 'Whangarei',
      label: 'Primary home',
      suburb: 'Avenues',
    }),
    createUserProperty(otherUserId, {
      addressLine1: '22 Other Bin Road',
      city: 'Whangarei',
      label: 'Other home',
      suburb: 'Onerahi',
    }),
  ]);

  primaryPropertyId = primaryProperty.id;
  otherPropertyId = otherProperty.id;
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

describe('bin selection API service contract', () => {
  it('validates allowed bin types and normalizes optional fields', () => {
    expect(
      createBinSchema.parse({
        collectionDay: 'TUESDAY',
        label: '  Red and blue bins  ',
        maxQuantity: '',
        type: 'RECYCLING_BINS',
      })
    ).toEqual({
      collectionDay: 'TUESDAY',
      label: 'Red and blue bins',
      maxQuantity: null,
      type: 'RECYCLING_BINS',
    });

    expect(() =>
      createBinSchema.parse({
        type: 'ANYTHING_GOES',
      })
    ).toThrow();
  });

  it('creates and lists bins only for owned active properties', async () => {
    const recyclingBin = await createPropertyBin(primaryUserId, primaryPropertyId, {
      collectionDay: 'TUESDAY',
      label: 'Red and blue recycling bins',
      type: 'RECYCLING_BINS',
    });

    recyclingBinId = recyclingBin?.id ?? '';

    const blockedCreate = await createPropertyBin(otherUserId, primaryPropertyId, {
      type: 'GREEN_WASTE_WHEELIE',
    });

    const [primaryBins, blockedList, otherBins] = await Promise.all([
      listPropertyBins(primaryUserId, primaryPropertyId),
      listPropertyBins(otherUserId, primaryPropertyId),
      listPropertyBins(primaryUserId, otherPropertyId),
    ]);

    expect(recyclingBin).toMatchObject({
      collectionDay: 'TUESDAY',
      label: 'Red and blue recycling bins',
      type: 'RECYCLING_BINS',
    });
    expect(blockedCreate).toBeNull();
    expect(primaryBins).toEqual([
      expect.objectContaining({
        id: recyclingBinId,
        type: 'RECYCLING_BINS',
      }),
    ]);
    expect(blockedList).toBeNull();
    expect(otherBins).toBeNull();
  });

  it('prevents duplicate bin types for the same property', async () => {
    await expect(
      createPropertyBin(primaryUserId, primaryPropertyId, {
        type: 'RECYCLING_BINS',
      })
    ).rejects.toBeInstanceOf(DuplicateBinTypeError);
  });

  it('updates only bins owned through the requested property', async () => {
    const blockedUpdate = await updatePropertyBin(otherUserId, primaryPropertyId, recyclingBinId, {
      label: 'Hijacked bin',
    });

    const updatedBin = await updatePropertyBin(primaryUserId, primaryPropertyId, recyclingBinId, {
      label: 'Updated recycling bins',
      maxQuantity: 2,
    });

    expect(blockedUpdate).toBeNull();
    expect(updatedBin).toMatchObject({
      id: recyclingBinId,
      label: 'Updated recycling bins',
      maxQuantity: 2,
      type: 'RECYCLING_BINS',
    });
  });

  it('removes only bins owned through the requested property', async () => {
    await expect(removePropertyBin(otherUserId, primaryPropertyId, recyclingBinId)).resolves.toBe(
      false
    );
    await expect(removePropertyBin(primaryUserId, primaryPropertyId, recyclingBinId)).resolves.toBe(
      true
    );

    await expect(listPropertyBins(primaryUserId, primaryPropertyId)).resolves.toEqual([]);
  });
});
