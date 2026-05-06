import { describe, expect, it } from 'vitest';

import { adminRoles, customerRoles, hasAnyRole, workerRoles } from '../../lib/auth/access';

describe('auth role helpers', () => {
  it('keeps customer and worker route access separate while allowing admins through', () => {
    expect(hasAnyRole('CUSTOMER', customerRoles)).toBe(true);
    expect(hasAnyRole('CUSTOMER', workerRoles)).toBe(false);

    expect(hasAnyRole('WORKER', workerRoles)).toBe(true);
    expect(hasAnyRole('WORKER', customerRoles)).toBe(false);

    expect(hasAnyRole('ADMIN', customerRoles)).toBe(true);
    expect(hasAnyRole('ADMIN', workerRoles)).toBe(true);
    expect(hasAnyRole('ADMIN', adminRoles)).toBe(true);
  });
});
