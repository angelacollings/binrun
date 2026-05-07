import { redirect } from 'next/navigation';

import { homePathForRole, safeRelativePath } from '@/lib/auth/routes';
import { getSession } from '@/lib/auth/roles';

import { CustomerLoginForm } from '../(auth)/CustomerLoginForm';

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session?.user) {
    redirect(homePathForRole(session.user.role));
  }

  const params = await searchParams;
  const callbackUrl = firstValue(params.callbackUrl);

  return (
    <CustomerLoginForm
      callbackUrl={callbackUrl ? safeRelativePath(callbackUrl) : undefined}
      error={firstValue(params.error)}
    />
  );
}
