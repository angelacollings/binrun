import { describe, expect, it } from 'vitest';

import { availableServiceVisitStatuses } from '../../lib/operations/status';

describe('available service visit statuses', () => {
  it('includes the current status and valid next statuses for an active visit', () => {
    expect(availableServiceVisitStatuses('PLANNED')).toEqual([
      'PLANNED',
      'IN_PROGRESS',
      'COMPLETED',
      'BLOCKED',
      'SKIPPED',
      'FAILED',
      'MISSED',
      'CANCELED',
    ]);
  });

  it.each(['CANCELED', 'COMPLETED', 'FAILED', 'SKIPPED'] as const)(
    'keeps terminal status %s read-only',
    (status) => {
      expect(availableServiceVisitStatuses(status)).toEqual([status]);
    }
  );
});
