import { describe, expect, it } from 'vitest';

import { homePathForRole, safeRelativePath } from '../../lib/auth/routes';

describe('auth route helpers', () => {
  it('routes users to the right default area for their role', () => {
    expect(homePathForRole('CUSTOMER')).toBe('/dashboard');
    expect(homePathForRole('WORKER')).toBe('/worker');
    expect(homePathForRole('ADMIN')).toBe('/admin');
    expect(homePathForRole(undefined)).toBe('/dashboard');
  });

  it('only accepts local callback paths', () => {
    expect(safeRelativePath('/dashboard?tab=bins')).toBe('/dashboard?tab=bins');
    expect(safeRelativePath('/worker')).toBe('/worker');
    expect(safeRelativePath('https://example.com/dashboard')).toBe('/dashboard');
    expect(safeRelativePath('//example.com/dashboard')).toBe('/dashboard');
    expect(safeRelativePath('dashboard')).toBe('/dashboard');
    expect(safeRelativePath(null)).toBe('/dashboard');
  });
});
