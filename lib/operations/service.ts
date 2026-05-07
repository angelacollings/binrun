import { prisma } from '@/lib/prisma';

export async function listServiceRunBoard() {
  return prisma.serviceVisit.findMany({
    orderBy: [
      {
        scheduledFor: 'asc',
      },
      {
        property: {
          suburb: 'asc',
        },
      },
    ],
    select: {
      bin: {
        select: {
          collectionDay: true,
          label: true,
          maxQuantity: true,
          type: true,
        },
      },
      completedAt: true,
      id: true,
      notes: true,
      property: {
        select: {
          addressLine1: true,
          addressLine2: true,
          city: true,
          collectionNotes: true,
          label: true,
          postcode: true,
          suburb: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      scheduledFor: true,
      status: true,
      updatedAt: true,
    },
    take: 25,
    where: {
      property: {
        active: true,
      },
      scheduledFor: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    },
  });
}
