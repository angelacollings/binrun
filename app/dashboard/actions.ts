'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireCustomer } from '@/lib/auth/roles';
import {
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

export async function createProperty(formData: FormData) {
  const session = await requireCustomer();
  const parsedInput = createPropertySchema.safeParse(propertyInputFromForm(formData));

  if (!parsedInput.success) {
    redirect('/dashboard?properties=invalid');
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
    redirect('/dashboard?properties=invalid');
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
  const deactivated = await deactivateUserProperty(session.user.id, propertyId);

  if (!deactivated) {
    redirect('/dashboard?properties=not-found');
  }

  revalidatePath('/dashboard');
  redirect('/dashboard?properties=deactivated');
}
