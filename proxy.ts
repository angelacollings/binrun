import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@prisma/client';

import { auth } from '@/auth';
import { adminRoles, customerRoles, hasAnyRole, workerRoles } from '@/lib/auth/access';
import { homePathForRole } from '@/lib/auth/routes';

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const user = session?.user;

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  const role = user.role as UserRole;

  if (pathname.startsWith('/admin') && !hasAnyRole(role, adminRoles)) {
    return NextResponse.redirect(new URL(homePathForRole(role), request.url));
  }

  if (pathname.startsWith('/worker') && !hasAnyRole(role, workerRoles)) {
    return NextResponse.redirect(new URL(homePathForRole(role), request.url));
  }

  if (pathname.startsWith('/dashboard') && !hasAnyRole(role, customerRoles)) {
    return NextResponse.redirect(new URL(homePathForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/worker/:path*', '/admin/:path*'],
};
