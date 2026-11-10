import type { ServiceVisitStatus } from '@prisma/client';

import { prisma } from '../prisma';
import { allowedServiceVisitTransitions } from './status';

export class InvalidServiceVisitTransitionError extends Error {
  constructor(currentStatus: ServiceVisitStatus, nextStatus: ServiceVisitStatus) {
    super(`Cannot move service visit from ${currentStatus} to ${nextStatus}.`);
  }
}

export class ServiceVisitConflictError extends Error {
  constructor() {
    super('Service visit changed before this update was applied.');
  }
}

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
      lastUpdatedById: true,
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
      statusNote: true,
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

export async function updateServiceVisitStatus(
  actorUserId: string,
  visitId: string,
  nextStatus: ServiceVisitStatus,
  statusNote: string | null
) {
  const visit = await prisma.serviceVisit.findFirst({
    select: {
      status: true,
    },
    where: {
      id: visitId,
      property: {
        active: true,
      },
    },
  });

  if (!visit) {
    return null;
  }

  if (
    visit.status !== nextStatus &&
    !allowedServiceVisitTransitions[visit.status].includes(nextStatus)
  ) {
    throw new InvalidServiceVisitTransitionError(visit.status, nextStatus);
  }

  const updateResult = await prisma.serviceVisit.updateMany({
    data: {
      completedAt: nextStatus === 'COMPLETED' ? new Date() : null,
      lastUpdatedById: actorUserId,
      status: nextStatus,
      statusNote,
    },
    where: {
      id: visitId,
      status: visit.status,
    },
  });

  if (updateResult.count === 0) {
    throw new ServiceVisitConflictError();
  }

  return prisma.serviceVisit.findUniqueOrThrow({
    where: {
      id: visitId,
    },
  });
}
