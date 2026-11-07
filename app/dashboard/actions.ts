'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireCustomer } from '@/lib/auth/roles';
import {
  ActivePropertyServiceError,
  createPropertySchema,
  createUserProperty,
  deactivateUserProperty,
  updatePropertySchema,
  updateUserProperty,
} from '@/lib/properties/service';

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

function propertyInputFromForm(formData: FormData) {
  return {
    addressLine1: formValue(formData, 'addressLine1'),
    addressLine2: formValue(formData, 'addressLine2'),
    city: formValue(formData, 'city') ?? 'Whangarei',
    collectionNotes: formValue(formData, 'collectionNotes'),
    label: formValue(formData, 'label'),
    postcode: formValue(formData, 'postcode'),
    suburb: formValue(formData, 'suburb'),
  };
}

function propertyIdFromForm(formData: FormData) {
  const propertyId = formValue(formData, 'propertyId')?.trim();

  if (!propertyId) {
    redirect('/dashboard?properties=invalid');
  }

  return propertyId;
}

function invalidPropertyRedirect(field: string, propertyId?: string): never {
  const params = new URLSearchParams({
    propertyField: field,
    properties: 'invalid',
  });

  if (propertyId) {
    params.set('propertyId', propertyId);
  }

  redirect(`/dashboard?${params.toString()}`);
}

function firstIssueField(error: { issues: { path: PropertyKey[] }[] }) {
  return String(error.issues[0]?.path[0] ?? 'form');
}

export async function createProperty(formData: FormData) {
  const session = await requireCustomer();
  const parsedInput = createPropertySchema.safeParse(propertyInputFromForm(formData));

  if (!parsedInput.success) {
    invalidPropertyRedirect(firstIssueField(parsedInput.error), 'new');
  }

  await createUserProperty(session.user.id, parsedInput.data);
  revalidatePath('/dashboard');
  redirect('/dashboard?properties=created');
}

export async function updateProperty(formData: FormData) {
  const session = await requireCustomer();
  const propertyId = propertyIdFromForm(formData);
  const parsedInput = updatePropertySchema.safeParse(propertyInputFromForm(formData));

  if (!parsedInput.success) {
    invalidPropertyRedirect(firstIssueField(parsedInput.error), propertyId);
  }

  const property = await updateUserProperty(session.user.id, propertyId, parsedInput.data);

  if (!property) {
    redirect('/dashboard?properties=not-found');
  }

  revalidatePath('/dashboard');
  redirect('/dashboard?properties=updated');
}

export async function deactivateProperty(formData: FormData) {
  const session = await requireCustomer();
  const propertyId = propertyIdFromForm(formData);
  const confirmed = formData.get('confirmRemove') === 'on';

  if (!confirmed) {
    redirect(`/dashboard?properties=invalid&propertyId=${propertyId}&propertyField=confirmRemove`);
  }

  let deactivated: boolean;

  try {
    deactivated = await deactivateUserProperty(session.user.id, propertyId);
  } catch (error) {
    if (error instanceof ActivePropertyServiceError) {
      redirect('/dashboard?properties=active-service');
    }

    throw error;
  }

  if (!deactivated) {
    redirect('/dashboard?properties=not-found');
  }

  revalidatePath('/dashboard');
  redirect('/dashboard?properties=deactivated');
}
