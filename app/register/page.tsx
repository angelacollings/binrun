import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { homePathForRole } from '@/lib/auth/routes';
import { getSession } from '@/lib/auth/roles';

import { ServiceSignupForm } from '../(auth)/ServiceSignupForm';

export const metadata: Metadata = {
  title: 'Start service',
  description: 'Create a BinRun account and request service for your Whangarei property.',
};

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getSession();

  if (session?.user) {
    redirect(homePathForRole(session.user.role));
  }

  const params = await searchParams;

  return <ServiceSignupForm error={firstValue(params.error)} />;
}
