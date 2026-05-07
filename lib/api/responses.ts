import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { AuthenticationError, AuthorizationError } from '@/lib/auth/roles';

export function apiError(code: string, message: string, status: number, issues?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        issues,
        message,
      },
    },
    { status }
  );
}

export function handleApiError(error: unknown, message = 'Unable to process request.') {
  if (error instanceof AuthenticationError) {
    return apiError('unauthorized', 'Authentication required.', 401);
  }

  if (error instanceof AuthorizationError) {
    return apiError('forbidden', 'Insufficient role for this resource.', 403);
  }

  if (error instanceof ZodError) {
    return apiError('invalid-request', 'Request body failed validation.', 400, error.issues);
  }

  console.error(message, error);

  return apiError('internal-error', message, 500);
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ZodError([
      {
        code: 'custom',
        input: undefined,
        message: 'Request body must be valid JSON.',
        path: [],
      },
    ]);
  }
}
