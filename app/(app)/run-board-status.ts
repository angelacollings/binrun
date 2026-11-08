import type { ServiceVisitStatus } from '@prisma/client';

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
