import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireCustomer } from '@/lib/auth/roles';
import { apiError, handleApiError, readJson } from '@/lib/api/responses';
import {
  createBinSchema,
  createPropertyBin,
  DuplicateBinTypeError,
  listPropertyBins,
} from '@/lib/bins/service';

export const runtime = 'nodejs';

type PropertyBinsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const propertyIdSchema = z.string().min(1).max(64);

async function propertyIdFromContext(context: PropertyBinsRouteContext) {
  const params = await context.params;
  return propertyIdSchema.parse(params.id);
}

function handleBinsError(error: unknown) {
  if (error instanceof DuplicateBinTypeError) {
    return apiError('duplicate-bin-type', 'Bin type already exists for this property.', 409);
  }

  return handleApiError(error, 'Unable to process bins request.');
}

export async function GET(_request: Request, context: PropertyBinsRouteContext) {
  try {
    const session = await requireCustomer();
    const propertyId = await propertyIdFromContext(context);
    const bins = await listPropertyBins(session.user.id, propertyId);

    if (!bins) {
      return apiError('not-found', 'Property not found.', 404);
    }

    return NextResponse.json({ bins });
  } catch (error) {
    return handleBinsError(error);
  }
}

export async function POST(request: Request, context: PropertyBinsRouteContext) {
  try {
    const session = await requireCustomer();
    const propertyId = await propertyIdFromContext(context);
    const input = createBinSchema.parse(await readJson(request));
    const bin = await createPropertyBin(session.user.id, propertyId, input);

    if (!bin) {
      return apiError('not-found', 'Property not found.', 404);
    }

    return NextResponse.json({ bin }, { status: 201 });
  } catch (error) {
    return handleBinsError(error);
  }
}
