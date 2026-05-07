import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireCustomer } from '@/lib/auth/roles';
import { apiError, handleApiError, readJson } from '@/lib/api/responses';
import {
  DuplicateBinTypeError,
  removePropertyBin,
  updateBinSchema,
  updatePropertyBin,
} from '@/lib/bins/service';

export const runtime = 'nodejs';

type BinRouteContext = {
  params: Promise<{
    binId: string;
    id: string;
  }>;
};

const routeIdSchema = z.string().min(1).max(64);

async function idsFromContext(context: BinRouteContext) {
  const params = await context.params;

  return {
    binId: routeIdSchema.parse(params.binId),
    propertyId: routeIdSchema.parse(params.id),
  };
}

function handleBinError(error: unknown) {
  if (error instanceof DuplicateBinTypeError) {
    return apiError('duplicate-bin-type', 'Bin type already exists for this property.', 409);
  }

  return handleApiError(error, 'Unable to process bin request.');
}

export async function PATCH(request: Request, context: BinRouteContext) {
  try {
    const session = await requireCustomer();
    const { binId, propertyId } = await idsFromContext(context);
    const input = updateBinSchema.parse(await readJson(request));
    const bin = await updatePropertyBin(session.user.id, propertyId, binId, input);

    if (!bin) {
      return apiError('not-found', 'Bin not found.', 404);
    }

    return NextResponse.json({ bin });
  } catch (error) {
    return handleBinError(error);
  }
}

export async function PUT(request: Request, context: BinRouteContext) {
  return PATCH(request, context);
}

export async function DELETE(_request: Request, context: BinRouteContext) {
  try {
    const session = await requireCustomer();
    const { binId, propertyId } = await idsFromContext(context);
    const removed = await removePropertyBin(session.user.id, propertyId, binId);

    if (!removed) {
      return apiError('not-found', 'Bin not found.', 404);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleBinError(error);
  }
}
