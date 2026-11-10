import type { BinType, CollectionDay } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../prisma';

export const supportedBinTypes = [
  'RECYCLING_BINS',
  'RUBBISH_BAGS',
  'RUBBISH_WHEELIE',
  'GREEN_WASTE_WHEELIE',
] as const satisfies readonly BinType[];

export const binTypeLabels: Record<BinType, string> = {
  GREEN_WASTE_WHEELIE: 'Green waste wheelie bin',
  RECYCLING_BINS: 'Red and blue recycling bins',
  RUBBISH_BAGS: 'Council prepaid rubbish bags',
  RUBBISH_WHEELIE: 'Rubbish wheelie bin',
};

export const supportedCollectionDays = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const satisfies readonly CollectionDay[];

export const collectionDayLabels: Record<CollectionDay, string> = {
  FRIDAY: 'Friday',
  MONDAY: 'Monday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
  THURSDAY: 'Thursday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
};

const binTypeSchema = z.enum(supportedBinTypes);
const collectionDaySchema = z.enum(supportedCollectionDays);

const optionalText = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(maxLength).nullable().optional());

const optionalMaxQuantity = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return value;
}, z.coerce.number().int().positive().max(20).nullable().optional());

export const createBinSchema = z.object({
  collectionDay: collectionDaySchema.nullable().optional(),
  label: optionalText(80),
  maxQuantity: optionalMaxQuantity,
  type: binTypeSchema,
});

export const updateBinSchema = createBinSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one bin field is required.',
  });

const binSelect = {
  collectionDay: true,
  createdAt: true,
  id: true,
  label: true,
  maxQuantity: true,
  propertyId: true,
  type: true,
  updatedAt: true,
} as const;

export type CreateBinInput = z.infer<typeof createBinSchema>;
export type UpdateBinInput = z.infer<typeof updateBinSchema>;

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

export class DuplicateBinTypeError extends Error {
  constructor() {
    super('Bin type already exists for this property.');
  }
}

async function ownedActivePropertyId(userId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    select: {
      id: true,
    },
    where: {
      active: true,
      id: propertyId,
      userId,
    },
  });

  return property?.id ?? null;
}

export async function listPropertyBins(userId: string, propertyId: string) {
  const ownedPropertyId = await ownedActivePropertyId(userId, propertyId);

  if (!ownedPropertyId) {
    return null;
  }

  return prisma.bin.findMany({
    orderBy: [
      {
        type: 'asc',
      },
      {
        id: 'asc',
      },
    ],
    select: binSelect,
    where: {
      propertyId,
    },
  });
}

export async function createPropertyBin(userId: string, propertyId: string, input: CreateBinInput) {
  const ownedPropertyId = await ownedActivePropertyId(userId, propertyId);

  if (!ownedPropertyId) {
    return null;
  }

  try {
    return await prisma.bin.create({
      data: {
        ...input,
        propertyId,
      },
      select: binSelect,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DuplicateBinTypeError();
    }

    throw error;
  }
}

export async function updatePropertyBin(
  userId: string,
  propertyId: string,
  binId: string,
  input: UpdateBinInput
) {
  const existingBin = await prisma.bin.findFirst({
    select: {
      id: true,
    },
    where: {
      id: binId,
      property: {
        active: true,
        id: propertyId,
        userId,
      },
    },
  });

  if (!existingBin) {
    return null;
  }

  try {
    return await prisma.bin.update({
      data: input,
      select: binSelect,
      where: {
        id: binId,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DuplicateBinTypeError();
    }

    throw error;
  }
}

export async function removePropertyBin(userId: string, propertyId: string, binId: string) {
  const deleteResult = await prisma.bin.deleteMany({
    where: {
      id: binId,
      property: {
        active: true,
        id: propertyId,
        userId,
      },
    },
  });

  return deleteResult.count > 0;
}
