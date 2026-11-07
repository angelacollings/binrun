import 'dotenv/config';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  InvalidServiceVisitTransitionError,
  updateServiceVisitStatus,
} from '../../lib/operations/service';
import { createPrismaTestClient } from './prisma-test-client';

const prisma = createPrismaTestClient();
const runId = `service-visits-${Date.now()}`;
const customerEmail = `${runId}-customer@example.com`;
const workerEmail = `${runId}-worker@example.com`;

let customerUserId: string;
let workerUserId: string;
let visitId: string;

beforeAll(async () => {
  const [customer, worker] = await Promise.all([
    prisma.user.create({
      data: {
        email: customerEmail,
        name: 'Visit Test Customer',
      },
      select: {
        id: true,
      },
    }),
    prisma.user.create({
      data: {
        email: workerEmail,
        name: 'Visit Test Worker',
        role: 'WORKER',
      },
      select: {
        id: true,
      },
    }),
  ]);

  customerUserId = customer.id;
  workerUserId = worker.id;

  const property = await prisma.property.create({
    data: {
      addressLine1: '50 Operations Test Street',
      city: 'Whangarei',
      userId: customerUserId,
    },
    select: {
      id: true,
    },
  });
  const visit = await prisma.serviceVisit.create({
    data: {
      propertyId: property.id,
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000),
      status: 'PLANNED',
    },
    select: {
      id: true,
    },
  });

  visitId = visit.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [customerEmail, workerEmail],
      },
    },
  });
  await prisma.$disconnect();
});

describe('service visit operations', () => {
  it('records valid progress and the worker responsible for the change', async () => {
    const updatedVisit = await updateServiceVisitStatus(
      workerUserId,
      visitId,
      'IN_PROGRESS',
      'Bins moved to the collection point.'
    );

    expect(updatedVisit).toMatchObject({
      completedAt: null,
      id: visitId,
      lastUpdatedById: workerUserId,
      status: 'IN_PROGRESS',
      statusNote: 'Bins moved to the collection point.',
    });
  });

  it('sets a completion timestamp for a completed visit', async () => {
    const updatedVisit = await updateServiceVisitStatus(
      workerUserId,
      visitId,
      'COMPLETED',
      'Service completed.'
    );

    expect(updatedVisit).toMatchObject({
      completedAt: expect.any(Date),
      status: 'COMPLETED',
      statusNote: 'Service completed.',
    });
  });

  it('rejects transitions away from a terminal status', async () => {
    await expect(
      updateServiceVisitStatus(workerUserId, visitId, 'IN_PROGRESS', null)
    ).rejects.toBeInstanceOf(InvalidServiceVisitTransitionError);

    await expect(
      prisma.serviceVisit.findUnique({
        select: {
          status: true,
        },
        where: {
          id: visitId,
        },
      })
    ).resolves.toEqual({
      status: 'COMPLETED',
    });
  });
});
