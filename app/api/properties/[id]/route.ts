import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';

import { requireCustomer, AuthenticationError, AuthorizationError } from '@/lib/auth/roles';
import {
  deactivateUserProperty,
  updatePropertySchema,
  updateUserProperty,
} from '@/lib/properties/service';

export const runtime = 'nodejs';

type PropertyRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const propertyIdSchema = z.string().min(1).max(64);

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

  console.error('Property API error:', error);

  return apiError('internal-error', 'Unable to process property request.', 500);
}

async function propertyIdFromContext(context: PropertyRouteContext) {
  const params = await context.params;
  return propertyIdSchema.parse(params.id);
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

export async function PATCH(request: Request, context: PropertyRouteContext) {
  try {
    const session = await requireCustomer();
    const propertyId = await propertyIdFromContext(context);
    const input = updatePropertySchema.parse(await readJson(request));
    const property = await updateUserProperty(session.user.id, propertyId, input);

    if (!property) {
      return apiError('not-found', 'Property not found.', 404);
    }

    return NextResponse.json({ property });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: PropertyRouteContext) {
  return PATCH(request, context);
}

export async function DELETE(_request: Request, context: PropertyRouteContext) {
  try {
    const session = await requireCustomer();
    const propertyId = await propertyIdFromContext(context);
    const deactivated = await deactivateUserProperty(session.user.id, propertyId);

    if (!deactivated) {
      return apiError('not-found', 'Property not found.', 404);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
