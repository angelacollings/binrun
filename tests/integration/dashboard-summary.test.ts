import 'dotenv/config';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getCustomerDashboardSummary } from '../../lib/dashboard/service';
import { createPrismaTestClient } from './prisma-test-client';

const prisma = createPrismaTestClient();
const runId = `dashboard-${Date.now()}`;
const primaryEmail = `${runId}-primary@example.com`;
const otherEmail = `${runId}-other@example.com`;

let primaryUserId: string;
let activePropertyId: string;
let firstVisitId: string;

beforeAll(async () => {
  const [primaryUser, otherUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: primaryEmail,
        name: 'Dashboard Test Customer',
      },
      select: {
        id: true,
      },
    }),
    prisma.user.create({
      data: {
        email: otherEmail,
        name: 'Other Dashboard Customer',
      },
      select: {
        id: true,
      },
    }),
  ]);

  primaryUserId = primaryUser.id;

  const [activeProperty] = await Promise.all([
    prisma.property.create({
      data: {
        addressLine1: '10 Dashboard Lane',
        city: 'Whangarei',
        label: 'Visible home',
        suburb: 'Avenues',
        userId: primaryUser.id,
      },
    }),
    prisma.property.create({
      data: {
        active: false,
        addressLine1: '20 Inactive Road',
        city: 'Whangarei',
        label: 'Inactive home',
        userId: primaryUser.id,
      },
    }),
    prisma.property.create({
      data: {
        addressLine1: '30 Other Street',
        city: 'Whangarei',
        label: 'Another customer home',
        userId: otherUser.id,
      },
    }),
  ]);

  activePropertyId = activeProperty.id;

  const now = Date.now();
  const [firstVisit] = await Promise.all([
    prisma.serviceVisit.create({
      data: {
        propertyId: activeProperty.id,
        scheduledFor: new Date(now + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.serviceVisit.create({
      data: {
        propertyId: activeProperty.id,
        scheduledFor: new Date(now + 48 * 60 * 60 * 1000),
      },
    }),
    prisma.bin.create({
      data: {
        collectionDay: 'MONDAY',
        propertyId: activeProperty.id,
        type: 'RECYCLING_BINS',
      },
    }),
    prisma.subscription.create({
      data: {
        status: 'ACTIVE',
        stripeCustomerId: `${runId}-customer`,
        stripeSubscriptionId: `${runId}-subscription`,
        userId: primaryUser.id,
      },
    }),
    prisma.subscription.create({
      data: {
        status: 'PAST_DUE',
        userId: otherUser.id,
      },
    }),
  ]);

  firstVisitId = firstVisit.id;
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

describe('customer dashboard summary', () => {
  it('returns only active records owned by the requested customer', async () => {
    const summary = await getCustomerDashboardSummary(primaryUserId);

    expect(summary).not.toBeNull();
    expect(summary?.properties).toHaveLength(1);
    expect(summary?.properties[0]).toMatchObject({
      addressLine1: '10 Dashboard Lane',
      id: activePropertyId,
      label: 'Visible home',
    });
    expect(summary?.totals).toMatchObject({
      bins: 1,
      properties: 1,
      upcomingVisits: 2,
    });
    expect(summary?.subscriptions).toHaveLength(1);
    expect(summary?.subscriptionStatus).toBe('ACTIVE');
  });

  it('orders upcoming visits and omits provider identifiers', async () => {
    const summary = await getCustomerDashboardSummary(primaryUserId);
    const serializedSummary = JSON.stringify(summary);

    expect(summary?.nextServiceVisit?.id).toBe(firstVisitId);
    expect(summary?.upcomingVisits.map((visit) => visit.id)[0]).toBe(firstVisitId);
    expect(serializedSummary).not.toContain(`${runId}-customer`);
    expect(serializedSummary).not.toContain(`${runId}-subscription`);
  });

  it('returns null for an unknown customer', async () => {
    await expect(getCustomerDashboardSummary('missing-customer')).resolves.toBeNull();
  });
});
