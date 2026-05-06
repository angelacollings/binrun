import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { adminRoles, customerRoles, hasAnyRole, workerRoles } from '@/lib/auth/access';
import { homePathForRole } from '@/lib/auth/routes';

export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const user = request.auth?.user;

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/admin') && !hasAnyRole(user.role, adminRoles)) {
    return NextResponse.redirect(new URL(homePathForRole(user.role), request.url));
  }

  if (pathname.startsWith('/worker') && !hasAnyRole(user.role, workerRoles)) {
    return NextResponse.redirect(new URL(homePathForRole(user.role), request.url));
  }

  if (pathname.startsWith('/dashboard') && !hasAnyRole(user.role, customerRoles)) {
    return NextResponse.redirect(new URL(homePathForRole(user.role), request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/worker/:path*', '/admin/:path*'],
};
