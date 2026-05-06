import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { homePathForRole } from '@/lib/auth/routes';

import { ServiceSignupForm } from '../(auth)/ServiceSignupForm';

type RegisterPageProps = {
  searchParams: Promise<{
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

  return <ServiceSignupForm error={firstValue(params.error)} />;
}
