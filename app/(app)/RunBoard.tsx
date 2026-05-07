import type { ServiceVisitStatus } from '@prisma/client';

import styles from '../app.module.css';

type RunBoardVisit = {
  id: string;
  bin: {
    collectionDay: string | null;
    label: string | null;
    maxQuantity: number | null;
    type: string;
  } | null;
  completedAt: Date | null;
  notes: string | null;
  property: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    collectionNotes: string | null;
    label: string | null;
    postcode: string | null;
    suburb: string | null;
    user: {
      email: string;
      name: string;
    };
  };
  scheduledFor: Date;
  status: ServiceVisitStatus;
  updatedAt: Date;
};

type RunBoardProps = {
  visits: RunBoardVisit[];
};

const statusLabels: Record<ServiceVisitStatus, string> = {
  CANCELED: 'Canceled',
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In progress',
  MISSED: 'Missed',
  PLANNED: 'Planned',
};

const binLabels: Record<string, string> = {
  GREEN_WASTE_WHEELIE: 'Green waste wheelie',
  RECYCLING_BINS: 'Recycling bins',
  RUBBISH_BAGS: 'Prepaid rubbish bags',
  RUBBISH_WHEELIE: 'Rubbish wheelie',
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Pacific/Auckland',
  }).format(value);
}

function formatAddress(visit: RunBoardVisit) {
  return [
    visit.property.addressLine1,
    visit.property.addressLine2,
    visit.property.suburb,
    visit.property.city,
    visit.property.postcode,
  ]
    .filter(Boolean)
    .join(', ');
}

function binLabel(visit: RunBoardVisit) {
  if (!visit.bin) {
    return 'General service';
  }

  return visit.bin.label || binLabels[visit.bin.type] || visit.bin.type;
}

export function RunBoard({ visits }: RunBoardProps) {
  const plannedCount = visits.filter((visit) => visit.status === 'PLANNED').length;
  const activeCount = visits.filter((visit) => visit.status === 'IN_PROGRESS').length;
  const exceptionCount = visits.filter((visit) =>
    ['MISSED', 'CANCELED'].includes(visit.status)
  ).length;

  return (
    <section className={styles.runBoard} aria-label="Service run board">
      <div className={styles.metricGrid}>
        <div>
          <span>{visits.length}</span>
          <p>Upcoming visits</p>
        </div>
        <div>
          <span>{plannedCount}</span>
          <p>Planned</p>
        </div>
        <div>
          <span>{activeCount}</span>
          <p>In progress</p>
        </div>
        <div>
          <span>{exceptionCount}</span>
          <p>Needs review</p>
        </div>
      </div>

      {visits.length > 0 ? (
        <div className={styles.runList}>
          {visits.map((visit) => (
            <article className={styles.runItem} key={visit.id}>
              <div className={styles.runSchedule}>
                <strong>{formatDateTime(visit.scheduledFor)}</strong>
                <span className={styles[`status${visit.status}`]}>
                  {statusLabels[visit.status]}
                </span>
              </div>

              <div className={styles.runDetails}>
                <h2>{visit.property.label || visit.property.user.name}</h2>
                <p>{formatAddress(visit)}</p>
                <p>
                  {binLabel(visit)}
                  {visit.bin?.maxQuantity ? `, up to ${visit.bin.maxQuantity}` : ''}
                  {visit.bin?.collectionDay
                    ? `, usual day ${visit.bin.collectionDay.toLowerCase()}`
                    : ''}
                </p>
                <p className={styles.mutedText}>
                  {visit.property.user.name} · {visit.property.user.email}
                </p>
                {visit.property.collectionNotes ? (
                  <p className={styles.runNote}>{visit.property.collectionNotes}</p>
                ) : null}
                {visit.notes ? <p className={styles.runNote}>{visit.notes}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>No scheduled service visits yet.</p>
      )}
    </section>
  );
}
