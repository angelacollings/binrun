import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { homePathForRole, safeRelativePath } from '@/lib/auth/routes';

import { AuthForm } from '../(auth)/AuthForm';

type RegisterPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect(homePathForRole(session.user.role));
  }

  const params = await searchParams;

  return (
    <AuthForm
      callbackUrl={safeRelativePath(firstValue(params.callbackUrl))}
      error={firstValue(params.error)}
      mode="register"
    />
  );
}
