import { prisma } from '../prisma';

export async function getCustomerDashboardSummary(userId: string) {
  const user = await prisma.user.findUnique({
    select: {
      properties: {
        orderBy: [
          {
            createdAt: 'asc',
          },
          {
            id: 'asc',
          },
        ],
        select: {
          addressLine1: true,
          bins: {
            orderBy: {
              type: 'asc',
            },
            select: {
              collectionDay: true,
              id: true,
              label: true,
              maxQuantity: true,
              type: true,
            },
          },
          city: true,
          id: true,
          label: true,
          serviceVisits: {
            orderBy: {
              scheduledFor: 'asc',
            },
            select: {
              id: true,
              scheduledFor: true,
              status: true,
            },
            take: 3,
            where: {
              scheduledFor: {
                gte: new Date(),
              },
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
                  code: true,
                  name: true,
                },
              },
              serviceDay: true,
              status: true,
            },
          },
          suburb: true,
        },
        where: {
          active: true,
        },
      },
      subscriptions: {
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          currentPeriodEnd: true,
          id: true,
          propertyServiceId: true,
          status: true,
        },
      },
    },
    where: {
      id: userId,
    },
  });

  if (!user) {
    return null;
  }

  const upcomingVisits = user.properties
    .flatMap((property) =>
      property.serviceVisits.map((visit) => ({
        ...visit,
        property: {
          addressLine1: property.addressLine1,
          city: property.city,
          label: property.label,
          suburb: property.suburb,
        },
      }))
    )
    .sort((left, right) => left.scheduledFor.getTime() - right.scheduledFor.getTime());

  return {
    nextServiceVisit: upcomingVisits[0] ?? null,
    properties: user.properties,
    subscriptionStatus: user.subscriptions[0]?.status ?? 'PENDING',
    subscriptions: user.subscriptions,
    totals: {
      activeServices: user.properties.reduce(
        (count, property) =>
          count + property.services.filter((service) => service.status === 'ACTIVE').length,
        0
      ),
      bins: user.properties.reduce((count, property) => count + property.bins.length, 0),
      properties: user.properties.length,
      upcomingVisits: upcomingVisits.length,
    },
    upcomingVisits: upcomingVisits.slice(0, 5),
  };
}
