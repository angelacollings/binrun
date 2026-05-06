import type { Session } from 'next-auth';
import type { UserRole } from '@prisma/client';

import { auth } from '@/auth';
import { adminRoles, customerRoles, hasAnyRole, workerRoles } from '@/lib/auth/access';

export { adminRoles, customerRoles, hasAnyRole, workerRoles };

export class AuthenticationError extends Error {
  readonly status = 401;

  constructor() {
    super('Authentication required.');
  }
}

export class AuthorizationError extends Error {
  readonly status = 403;

  constructor() {
    super('Insufficient role for this resource.');
  }
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthenticationError();
  }

  return session;
}

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const session = await requireUser();

  if (!hasAnyRole(session.user.role, allowedRoles)) {
    throw new AuthorizationError();
  }

  return session;
}

export async function requireCustomer() {
  return requireRole(customerRoles);
}

export async function requireWorker() {
  return requireRole(workerRoles);
}

export async function requireAdmin() {
  return requireRole(adminRoles);
}

export type AuthenticatedSession = Session & {
  user: Session['user'] & {
    id: string;
    role: UserRole;
  };
};
