'use client';

import { useActionState } from 'react';
import type { ServiceVisitStatus } from '@prisma/client';

import { updateRunBoardVisit, type RunBoardActionState } from './run-board-actions';
import { serviceVisitStatusLabels } from './run-board-status';
import styles from '../app.module.css';

type RunBoardVisitFormProps = {
  status: ServiceVisitStatus;
  statusNote: string | null;
  visitId: string;
};

const initialState: RunBoardActionState = {
  message: '',
  status: 'idle',
};

export function RunBoardVisitForm({ status, statusNote, visitId }: RunBoardVisitFormProps) {
  const [state, formAction, pending] = useActionState(updateRunBoardVisit, initialState);

  return (
    <form className={styles.runStatusForm} action={formAction}>
      <input name="visitId" type="hidden" value={visitId} />
      <label>
        <span>Status</span>
        <select defaultValue={status} disabled={pending} name="status">
          {Object.entries(serviceVisitStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Note</span>
        <input
          defaultValue={statusNote ?? ''}
          disabled={pending}
          maxLength={500}
          name="statusNote"
          placeholder="Access issue, completion note, or exception"
        />
      </label>
      <button className={styles.buttonPrimary} disabled={pending} type="submit">
        {pending ? 'Updating…' : 'Update visit'}
      </button>
      {state.message ? (
        <p
          aria-live="polite"
          className={`${styles.runStatusMessage} ${
            state.status === 'error' ? styles.errorNotice : styles.successNotice
          }`}
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
