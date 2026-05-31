import { z } from 'zod';

import { prisma } from '../prisma';

const optionalText = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(maxLength).nullable().optional());

const requiredText = (maxLength: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(2).max(maxLength)
  );

export const createPropertySchema = z.object({
  addressLine1: requiredText(120),
  addressLine2: optionalText(120),
  city: requiredText(80).default('Whangarei'),
  collectionNotes: optionalText(500),
  label: optionalText(80),
  postcode: optionalText(16),
  suburb: optionalText(80),
});

export const updatePropertySchema = createPropertySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one property field is required.',
  });

const propertySelect = {
  active: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  collectionNotes: true,
  createdAt: true,
  deactivatedAt: true,
  id: true,
  label: true,
  postcode: true,
  serviceArea: {
    select: {
      city: true,
      id: true,
      name: true,
    },
  },
  services: {
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      frequency: true,
      id: true,
      package: {
        select: {
          name: true,
        },
      },
      serviceDay: true,
      status: true,
    },
  },
  suburb: true,
  updatedAt: true,
} as const;

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

async function activeServiceAreaForCity(city: string) {
  return prisma.serviceArea.findFirst({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
    },
    where: {
      active: true,
      city,
    },
  });
}

export async function listUserProperties(userId: string) {
  return prisma.property.findMany({
    orderBy: [
      {
        createdAt: 'asc',
      },
      {
        id: 'asc',
      },
    ],
    select: propertySelect,
    where: {
      active: true,
      userId,
    },
  });
}

export async function createUserProperty(userId: string, input: CreatePropertyInput) {
  const serviceArea = await activeServiceAreaForCity(input.city);

  return prisma.property.create({
    data: {
      ...input,
      serviceAreaId: serviceArea?.id,
      userId,
    },
    select: propertySelect,
  });
}

export async function updateUserProperty(
  userId: string,
  propertyId: string,
  input: UpdatePropertyInput
) {
  const serviceArea =
    input.city === undefined ? undefined : await activeServiceAreaForCity(input.city);

  const updateResult = await prisma.property.updateMany({
    data: {
      ...input,
      ...(input.city === undefined ? {} : { serviceAreaId: serviceArea?.id ?? null }),
    },
    where: {
      active: true,
      id: propertyId,
      userId,
    },
  });

  if (updateResult.count === 0) {
    return null;
  }

  return prisma.property.findFirst({
    select: propertySelect,
    where: {
      id: propertyId,
      userId,
    },
  });
}

export async function deactivateUserProperty(userId: string, propertyId: string) {
  const updateResult = await prisma.property.updateMany({
    data: {
      active: false,
      deactivatedAt: new Date(),
    },
    where: {
      active: true,
      id: propertyId,
      userId,
    },
  });

  return updateResult.count > 0;
}
