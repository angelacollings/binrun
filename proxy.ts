export { auth as proxy } from '@/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/worker/:path*', '/admin/:path*'],
};
