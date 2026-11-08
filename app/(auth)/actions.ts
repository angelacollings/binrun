'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { BinType, ServicePackageCode, UserRole } from '@prisma/client';

import { auth } from '@/auth';
import { hashPassword, loginSchema, signupSchema } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';
import { homePathForRole, safeRelativePath } from '@/lib/auth/routes';
import { checkAuthRateLimit } from '@/lib/auth/throttle';
import { servicePackageByCode, servicePackageCodes } from '@/lib/service-packages';

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

function firstForwardedValue(value: string | null) {
  return value?.split(',')[0]?.trim() || 'unknown';
}

async function requestIdentity() {
  const requestHeaders = await headers();

  return firstForwardedValue(
    requestHeaders.get('x-forwarded-for') ?? requestHeaders.get('x-real-ip')
  );
}

async function enforceAuthThrottle(action: 'login' | 'signup', email: string) {
  const identity = await requestIdentity();
  const normalizedEmail = email.trim().toLowerCase() || 'unknown';
  const result = checkAuthRateLimit(`${action}:${identity}:${normalizedEmail}`);

  if (!result.allowed) {
    redirect(`/${action === 'login' ? 'login' : 'register'}?error=too-many-attempts`);
  }
}

function selectedServicePackageCode(formData: FormData): ServicePackageCode | null {
  const value = String(formData.get('servicePackageCode') ?? '');

  return servicePackageCodes.includes(value as ServicePackageCode)
    ? (value as ServicePackageCode)
    : null;
}

function labelForBinType(type: BinType) {
  const labels: Record<BinType, string> = {
    GREEN_WASTE_WHEELIE: 'Green waste wheelie bin',
    RECYCLING_BINS: 'Red and blue recycling bins',
    RUBBISH_BAGS: 'Council prepaid rubbish bags',
    RUBBISH_WHEELIE: 'Rubbish wheelie bin',
  };

  return labels[type];
}

async function signInWithPassword(
  email: string,
  password: string,
  callbackUrl?: string,
  errorPath = '/login'
) {
  const requestHeaders = await headers();
  let destination: string;

  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: false,
      },
      headers: requestHeaders,
    });
    destination = callbackUrl ?? homePathForRole(result.user.role as UserRole);
  } catch {
    const params = new URLSearchParams({
      callbackUrl: callbackUrl ?? '/dashboard',
      error: 'invalid-credentials',
    });

    redirect(`${errorPath}?${params.toString()}`);
  }

  redirect(destination);
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

export async function requestLogin(formData: FormData) {
  const callbackUrl = optionalCallbackPath(formData.get('callbackUrl'));
  const emailValue = formValue(formData, 'email');

  await enforceAuthThrottle('login', emailValue);

  const parsedCredentials = loginSchema.safeParse({
    email: emailValue,
    password: formValue(formData, 'password'),
  });

  if (!parsedCredentials.success) {
    return redirectWithLoginError('invalid-credentials', callbackUrl ?? '/dashboard');
  }

  const { email, password } = parsedCredentials.data;

  await signInWithPassword(email, password, callbackUrl);
}

export async function requestServiceSignup(formData: FormData) {
  const emailValue = formValue(formData, 'email');

  await enforceAuthThrottle('signup', emailValue);

  const parsedSignup = signupSchema.safeParse({
    addressLine1: formValue(formData, 'addressLine1'),
    collectionNotes: formValue(formData, 'collectionNotes'),
    email: emailValue,
    name: formValue(formData, 'name'),
    password: formValue(formData, 'password'),
    passwordConfirm: formValue(formData, 'passwordConfirm'),
    postcode: formValue(formData, 'postcode'),
    suburb: formValue(formData, 'suburb'),
  });
  const selectedPackageCode = selectedServicePackageCode(formData);
  const selectedPackage = selectedPackageCode ? servicePackageByCode(selectedPackageCode) : null;

  if (!parsedSignup.success || !selectedPackage) {
    redirect('/register?error=incomplete');
  }

  const { addressLine1, collectionNotes, email, name, password, postcode, suburb } =
    parsedSignup.data;
  const passwordHash = await hashPassword(password);
  const userId = randomUUID();
  const packageItems = selectedPackage.items;
  const binRecords = Array.from(
    packageItems
      .filter((item) => item.binType)
      .reduce<Map<BinType, number>>((itemsByType, item) => {
        const binType = item.binType;

        if (!binType) {
          return itemsByType;
        }

        return itemsByType.set(binType, Math.max(itemsByType.get(binType) ?? 0, item.quantity));
      }, new Map())
  ).map(([type, quantity]) => ({
    label: labelForBinType(type),
    maxQuantity: quantity > 1 || type === 'RUBBISH_BAGS' ? quantity : null,
    type,
  }));

  const existingUser = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      email,
    },
  });

  if (existingUser) {
    redirect('/register?error=account-unavailable');
  }

  const serviceArea = await prisma.serviceArea.findFirst({
    select: {
      id: true,
    },
    where: {
      active: true,
      city: 'Whangarei',
    },
  });

  try {
    const servicePackage = await prisma.servicePackage.upsert({
      create: {
        active: true,
        billingMode: selectedPackage.billingMode,
        code: selectedPackage.code,
        description: selectedPackage.description,
        name: selectedPackage.name,
        sortOrder: selectedPackage.sortOrder,
      },
      update: {
        active: true,
        billingMode: selectedPackage.billingMode,
        description: selectedPackage.description,
        name: selectedPackage.name,
        sortOrder: selectedPackage.sortOrder,
      },
      where: {
        code: selectedPackage.code,
      },
    });

    await prisma.user.create({
      data: {
        email,
        id: userId,
        name,
        accounts: {
          create: {
            accountId: userId,
            providerId: 'credential',
            password: passwordHash,
          },
        },
        role: 'CUSTOMER',
        properties: {
          create: {
            addressLine1,
            city: 'Whangarei',
            collectionNotes: collectionNotes || null,
            label: 'Home',
            postcode: postcode || null,
            serviceAreaId: serviceArea?.id,
            suburb,
            bins: {
              create: binRecords,
            },
            services: {
              create: {
                customNotes:
                  selectedPackage.code === 'CUSTOM'
                    ? 'Customer requested a tailored package at signup.'
                    : null,
                frequency: selectedPackage.billingMode === 'ONE_OFF' ? 'ON_DEMAND' : 'WEEKLY',
                items: {
                  create: packageItems.map((item) => ({
                    binType: item.binType ?? null,
                    quantity: item.quantity,
                    type: item.type,
                  })),
                },
                packageId: servicePackage.id,
                status: 'PENDING',
              },
            },
          },
        },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      redirect('/register?error=account-unavailable');
    }

    throw error;
  }

  await signInWithPassword(email, password, '/dashboard', '/register');
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect('/');
}
