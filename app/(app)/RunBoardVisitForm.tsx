'use client';

import { useActionState } from 'react';
import type { ServiceVisitStatus } from '@prisma/client';

import { updateRunBoardVisit, type RunBoardActionState } from './run-board-actions';
import { availableServiceVisitStatuses, serviceVisitStatusLabels } from './run-board-status';
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
  const availableStatuses = availableServiceVisitStatuses(status);
  const isTerminal = availableStatuses.length === 1;

  return (
    <form className={styles.runStatusForm} action={formAction}>
      <input name="visitId" type="hidden" value={visitId} />
      <label>
        <span>Status</span>
        <select defaultValue={status} disabled={pending || isTerminal} name="status">
          {availableStatuses.map((value) => (
            <option key={value} value={value}>
              {serviceVisitStatusLabels[value]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Note</span>
        <input
          defaultValue={statusNote ?? ''}
          disabled={pending || isTerminal}
          maxLength={500}
          name="statusNote"
          placeholder="Access issue, completion note, or exception"
        />
      </label>
      {isTerminal ? (
        <p className={styles.runStatusComplete}>This visit is closed and cannot be updated.</p>
      ) : (
        <button className={styles.buttonPrimary} disabled={pending} type="submit">
          {pending ? 'Updating…' : 'Update visit'}
        </button>
      )}
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
