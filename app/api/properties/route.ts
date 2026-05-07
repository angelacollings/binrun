import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { requireCustomer, AuthenticationError, AuthorizationError } from '@/lib/auth/roles';
import {
  createPropertySchema,
  createUserProperty,
  listUserProperties,
} from '@/lib/properties/service';

export const runtime = 'nodejs';

function apiError(code: string, message: string, status: number, issues?: unknown) {
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

function handleRouteError(error: unknown) {
  if (error instanceof AuthenticationError) {
    return apiError('unauthorized', 'Authentication required.', 401);
  }

  if (error instanceof AuthorizationError) {
    return apiError('forbidden', 'Insufficient role for this resource.', 403);
  }

  if (error instanceof ZodError) {
    return apiError('invalid-request', 'Request body failed validation.', 400, error.issues);
  }

  console.error('Properties API error:', error);

  return apiError('internal-error', 'Unable to process properties request.', 500);
}

async function readJson(request: Request) {
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

export async function GET() {
  try {
    const session = await requireCustomer();
    const properties = await listUserProperties(session.user.id);

    return NextResponse.json({ properties });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireCustomer();
    const input = createPropertySchema.parse(await readJson(request));
    const property = await createUserProperty(session.user.id, input);

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
