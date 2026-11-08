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

export type RunBoardActionState = {
  message: string;
  status: 'error' | 'idle' | 'success';
};

function formValue(formData: FormData, name: string) {
  return formData.get(name);
}

export async function updateRunBoardVisit(
  _previousState: RunBoardActionState,
  formData: FormData
): Promise<RunBoardActionState> {
  const session = await requireWorker();
  const parsed = updateVisitStatusSchema.safeParse({
    status: formValue(formData, 'status'),
    statusNote: formValue(formData, 'statusNote'),
    visitId: formValue(formData, 'visitId'),
  });

  if (!parsed.success) {
    return {
      message: 'Check the visit status and note, then try again.',
      status: 'error',
    };
  }

  try {
    const updatedVisit = await updateServiceVisitStatus(
      session.user.id,
      parsed.data.visitId,
      parsed.data.status,
      parsed.data.statusNote ?? null
    );

    if (!updatedVisit) {
      return {
        message: 'This visit is no longer available. Refresh the page and try again.',
        status: 'error',
      };
    }
  } catch (error) {
    if (error instanceof InvalidServiceVisitTransitionError) {
      return {
        message: 'That status change is not allowed for this visit.',
        status: 'error',
      };
    }

    if (error instanceof ServiceVisitConflictError) {
      return {
        message: 'This visit changed before your update was saved. Refresh and try again.',
        status: 'error',
      };
    }

    throw error;
  }

  revalidatePath('/admin');
  revalidatePath('/worker');

  return {
    message: 'Visit updated.',
    status: 'success',
  };
}
