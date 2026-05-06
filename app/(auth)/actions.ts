'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import type { BinType } from '@prisma/client';

import { signIn, signOut } from '@/auth';
import { hashPassword, loginSchema, signupSchema, verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';
import { homePathForRole, safeRelativePath } from '@/lib/auth/routes';

function redirectWithLoginError(error: string, callbackUrl: string): never {
  const params = new URLSearchParams({
    callbackUrl,
    error,
  });

  redirect(`/login?${params.toString()}`);
}

function optionalCallbackPath(value: FormDataEntryValue | null) {
  return typeof value === 'string' && value.length > 0 ? safeRelativePath(value) : undefined;
}

function formValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}

function selectedBinTypes(formData: FormData): BinType[] {
  const allowed = new Set<BinType>([
    'RECYCLING_BINS',
    'RUBBISH_BAGS',
    'RUBBISH_WHEELIE',
    'GREEN_WASTE_WHEELIE',
  ]);

  return formData
    .getAll('binTypes')
    .map((value) => String(value))
    .filter((value): value is BinType => allowed.has(value as BinType));
}

async function signInWithPassword(email: string, password: string, callbackUrl: string, errorPath = '/login') {
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const params = new URLSearchParams({
        callbackUrl,
        error: 'invalid-credentials',
      });

      redirect(`${errorPath}?${params.toString()}`);
    }

    throw error;
  }
}

export async function requestLogin(formData: FormData) {
  const callbackUrl = optionalCallbackPath(formData.get('callbackUrl'));
  const parsedCredentials = loginSchema.safeParse({
    email: formValue(formData, 'email'),
    password: formValue(formData, 'password'),
  });

  if (!parsedCredentials.success) {
    return redirectWithLoginError('invalid-credentials', callbackUrl ?? '/dashboard');
  }

  const { email, password } = parsedCredentials.data;
  const user = await prisma.user.findUnique({
    select: {
      passwordCredential: {
        select: {
          passwordHash: true,
        },
      },
      role: true,
    },
    where: {
      email,
    },
  });

  const passwordHash = user?.passwordCredential?.passwordHash;
  const verified = passwordHash ? await verifyPassword(passwordHash, password) : false;

  if (!verified) {
    return redirectWithLoginError('invalid-credentials', callbackUrl ?? '/dashboard');
  }

  const destination = callbackUrl ?? homePathForRole(user?.role);

  await signInWithPassword(email, password, destination);
}

export async function requestServiceSignup(formData: FormData) {
  const parsedSignup = signupSchema.safeParse({
    addressLine1: formValue(formData, 'addressLine1'),
    collectionNotes: formValue(formData, 'collectionNotes'),
    email: formValue(formData, 'email'),
    name: formValue(formData, 'name'),
    password: formValue(formData, 'password'),
    passwordConfirm: formValue(formData, 'passwordConfirm'),
    postcode: formValue(formData, 'postcode'),
    suburb: formValue(formData, 'suburb'),
  });
  const binTypes = selectedBinTypes(formData);

  if (!parsedSignup.success || binTypes.length === 0) {
    redirect('/register?error=incomplete');
  }

  const { addressLine1, collectionNotes, email, name, password, postcode, suburb } =
    parsedSignup.data;
  const passwordHash = await hashPassword(password);

  const serviceArea = await prisma.serviceArea.findFirst({
    select: {
      id: true,
    },
    where: {
      active: true,
      city: 'Whangarei',
    },
  });

  const user = await prisma.user.upsert({
    create: {
      email,
      name,
      passwordCredential: {
        create: {
          passwordHash,
        },
      },
      role: 'CUSTOMER',
    },
    update: {
      name,
      passwordCredential: {
        upsert: {
          create: {
            passwordHash,
          },
          update: {
            passwordHash,
          },
        },
      },
    },
    where: {
      email,
    },
  });

  const existingProperty = await prisma.property.findFirst({
    select: {
      id: true,
    },
    where: {
      addressLine1,
      postcode: postcode || null,
      suburb,
      userId: user.id,
    },
  });

  if (!existingProperty) {
    await prisma.property.create({
      data: {
        addressLine1,
        city: 'Whangarei',
        collectionNotes: collectionNotes || null,
        label: 'Home',
        postcode: postcode || null,
        serviceAreaId: serviceArea?.id,
        suburb,
        userId: user.id,
        bins: {
          create: binTypes.map((type) => ({
            maxQuantity: type === 'RUBBISH_BAGS' ? 3 : null,
            type,
          })),
        },
      },
    });
  }

  await signInWithPassword(email, password, '/dashboard', '/register');
}

export async function logout() {
  await signOut({
    redirectTo: '/',
  });
}
