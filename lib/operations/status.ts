import type { ServiceVisitStatus } from '@prisma/client';

export const allowedServiceVisitTransitions: Record<
  ServiceVisitStatus,
  readonly ServiceVisitStatus[]
> = {
  BLOCKED: ['IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED', 'CANCELED'],
  CANCELED: [],
  COMPLETED: [],
  FAILED: [],
  IN_PROGRESS: ['COMPLETED', 'BLOCKED', 'SKIPPED', 'FAILED', 'MISSED', 'CANCELED'],
  MISSED: ['IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED', 'CANCELED'],
  PLANNED: ['IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED', 'FAILED', 'MISSED', 'CANCELED'],
  SKIPPED: [],
};

export const serviceVisitStatusLabels: Record<ServiceVisitStatus, string> = {
  BLOCKED: 'Blocked',
  CANCELED: 'Canceled',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  IN_PROGRESS: 'In progress',
  MISSED: 'Missed',
  PLANNED: 'Planned',
  SKIPPED: 'Skipped',
};

export function availableServiceVisitStatuses(status: ServiceVisitStatus) {
  return [status, ...allowedServiceVisitTransitions[status]];
}
