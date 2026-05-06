'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

import { signIn, signOut } from '@/auth';
import { safeRelativePath } from '@/lib/auth/routes';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function redirectWithLoginError(error: string, callbackUrl: string) {
  const params = new URLSearchParams({
    callbackUrl,
    error,
  });

  redirect(`/login?${params.toString()}`);
}

export async function requestMagicLink(formData: FormData) {
  const callbackUrl = safeRelativePath(formData.get('callbackUrl'));
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();

  if (!isValidEmail(email)) {
    redirectWithLoginError('invalid-email', callbackUrl);
  }

  try {
    await signIn('nodemailer', {
      email,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirectWithLoginError('send-failed', callbackUrl);
    }

    throw error;
  }
}

export async function logout() {
  await signOut({
    redirectTo: '/',
  });
}
