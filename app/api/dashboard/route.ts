import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/api/responses';
import { requireCustomer } from '@/lib/auth/roles';
import { getCustomerDashboardSummary } from '@/lib/dashboard/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireCustomer();
    const dashboard = await getCustomerDashboardSummary(session.user.id);

    if (!dashboard) {
      return NextResponse.json(
        {
          error: {
            code: 'not-found',
            message: 'Dashboard not found.',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ dashboard });
  } catch (error) {
    return handleApiError(error, 'Unable to load dashboard.');
  }
}
