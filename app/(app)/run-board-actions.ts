'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireWorker } from '@/lib/auth/roles';
import {
  InvalidServiceVisitTransitionError,
  ServiceVisitConflictError,
  updateServiceVisitStatus,
} from '@/lib/operations/service';

const visitStatusSchema = z.enum([
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'BLOCKED',
  'SKIPPED',
  'FAILED',
  'MISSED',
  'CANCELED',
]);

const updateVisitStatusSchema = z.object({
  status: visitStatusSchema,
  statusNote: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim().length > 0 ? value.trim() : null),
      z.string().max(500).nullable()
    )
    .optional(),
  visitId: z.string().min(1).max(64),
});

function formValue(formData: FormData, name: string) {
  return formData.get(name);
}

export async function updateRunBoardVisit(formData: FormData) {
  const session = await requireWorker();
  const parsed = updateVisitStatusSchema.safeParse({
    status: formValue(formData, 'status'),
    statusNote: formValue(formData, 'statusNote'),
    visitId: formValue(formData, 'visitId'),
  });

  if (!parsed.success) {
    return;
  }

  try {
    await updateServiceVisitStatus(
      session.user.id,
      parsed.data.visitId,
      parsed.data.status,
      parsed.data.statusNote ?? null
    );
  } catch (error) {
    if (
      !(error instanceof InvalidServiceVisitTransitionError) &&
      !(error instanceof ServiceVisitConflictError)
    ) {
      throw error;
    }
  }

  revalidatePath('/admin');
  revalidatePath('/worker');
}
