import type { UserRole } from '@prisma/client';

export function homePathForRole(role: UserRole | undefined) {
  if (role === 'ADMIN') {
    return '/admin';
  }

  if (role === 'WORKER') {
    return '/worker';
  }

  return '/dashboard';
}

export function safeRelativePath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard';
  }

  if (value.includes('://')) {
    return '/dashboard';
  }

  return value;
}
