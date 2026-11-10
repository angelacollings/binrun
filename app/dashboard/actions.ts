'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireCustomer } from '@/lib/auth/roles';
import {
  createBinSchema,
  createPropertyBin,
  DuplicateBinTypeError,
  removePropertyBin,
  updateBinSchema,
  updatePropertyBin,
} from '@/lib/bins/service';
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

function binIdFromForm(formData: FormData) {
  const binId = formValue(formData, 'binId')?.trim();

  if (!binId) {
    redirect('/dashboard?bins=invalid');
  }

  return binId;
}

function binInputFromForm(formData: FormData) {
  return {
    collectionDay: formValue(formData, 'collectionDay') || null,
    label: formValue(formData, 'label'),
    maxQuantity: formValue(formData, 'maxQuantity'),
    type: formValue(formData, 'type'),
  };
}

function binRedirect(status: string, propertyId?: string, binId?: string): never {
  const params = new URLSearchParams({ bins: status });

  if (propertyId) {
    params.set('manage', propertyId);
  }

  if (binId) {
    params.set('binId', binId);
  }

  redirect(`/dashboard?${params.toString()}`);
}

function invalidPropertyRedirect(field: string, propertyId?: string): never {
  const params = new URLSearchParams({
    propertyField: field,
    properties: 'invalid',
  });

  if (propertyId) {
    params.set('propertyId', propertyId);

    if (propertyId !== 'new') {
      params.set('edit', propertyId);
    }
  }

  redirect(`/dashboard?${params.toString()}`);
}

export async function createBin(formData: FormData) {
  const session = await requireCustomer();
  const propertyId = propertyIdFromForm(formData);
  const parsedInput = createBinSchema.safeParse(binInputFromForm(formData));

  if (!parsedInput.success) {
    binRedirect('invalid', propertyId);
  }

  try {
    const bin = await createPropertyBin(session.user.id, propertyId, parsedInput.data);

    if (!bin) {
      binRedirect('not-found');
    }
  } catch (error) {
    if (error instanceof DuplicateBinTypeError) {
      binRedirect('duplicate', propertyId);
    }

    throw error;
  }

  revalidatePath('/dashboard');
  binRedirect('created', propertyId);
}

export async function updateBin(formData: FormData) {
  const session = await requireCustomer();
  const propertyId = propertyIdFromForm(formData);
  const binId = binIdFromForm(formData);
  const binInput = binInputFromForm(formData);
  const parsedInput = updateBinSchema.safeParse({
    collectionDay: binInput.collectionDay,
    label: binInput.label,
    maxQuantity: binInput.maxQuantity,
  });

  if (!parsedInput.success) {
    binRedirect('invalid', propertyId, binId);
  }

  try {
    const bin = await updatePropertyBin(session.user.id, propertyId, binId, parsedInput.data);

    if (!bin) {
      binRedirect('not-found');
    }
  } catch (error) {
    if (error instanceof DuplicateBinTypeError) {
      binRedirect('duplicate', propertyId, binId);
    }

    throw error;
  }

  revalidatePath('/dashboard');
  binRedirect('updated', propertyId, binId);
}

export async function removeBin(formData: FormData) {
  const session = await requireCustomer();
  const propertyId = propertyIdFromForm(formData);
  const binId = binIdFromForm(formData);

  if (formData.get('confirmRemoveBin') !== 'on') {
    binRedirect('confirm-remove', propertyId, binId);
  }

  const removed = await removePropertyBin(session.user.id, propertyId, binId);

  if (!removed) {
    binRedirect('not-found');
  }

  revalidatePath('/dashboard');
  binRedirect('removed', propertyId);
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
