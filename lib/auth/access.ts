import type { UserRole } from '@prisma/client';

export const customerRoles = ['CUSTOMER', 'ADMIN'] as const satisfies readonly UserRole[];
export const workerRoles = ['WORKER', 'ADMIN'] as const satisfies readonly UserRole[];
export const adminRoles = ['ADMIN'] as const satisfies readonly UserRole[];

export function hasAnyRole(role: UserRole | undefined, allowedRoles: readonly UserRole[]) {
  return role ? allowedRoles.includes(role) : false;
}
