import type { Metadata } from 'next';

import { requireCustomer } from '@/lib/auth/roles';
import { getCustomerDashboardSummary } from '@/lib/dashboard/service';
import { listUserProperties } from '@/lib/properties/service';

import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';
import { createProperty } from './actions';
import { PropertyCard } from './PropertyCard';

export const metadata: Metadata = {
  title: 'Customer dashboard',
  description: 'Manage your BinRun properties and review upcoming service information.',
};

type DashboardPageProps = {
  searchParams: Promise<{
    binId?: string;
    bins?: string;
    edit?: string;
    manage?: string;
    propertyField?: string;
    propertyId?: string;
    properties?: string;
  }>;
};

const propertyMessages: Record<string, string> = {
  'active-service':
    'This property has an active service. Contact admin@binrun.co.nz for help changing or canceling it.',
  created: 'Property added.',
  deactivated: 'Property removed from active service.',
  invalid: 'Check the property details and try again.',
  'not-found': 'Property not found.',
  updated: 'Property updated.',
};

const binMessages: Record<string, string> = {
  'confirm-remove': 'Confirm the bin removal and try again.',
  created: 'Bin added.',
  duplicate: 'That bin type is already recorded for this property.',
  invalid: 'Check the bin details and try again.',
  'not-found': 'Bin or property not found.',
  removed: 'Bin removed.',
  updated: 'Bin updated.',
};

const errorPropertyStatuses = new Set(['active-service', 'invalid', 'not-found']);
const errorBinStatuses = new Set(['confirm-remove', 'duplicate', 'invalid', 'not-found']);

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Pacific/Auckland',
  }).format(value);
}

function fieldError(
  propertyStatus: string | undefined,
  errorPropertyId: string | undefined,
  errorField: string | undefined,
  currentPropertyId: string,
  field: string
) {
  if (
    propertyStatus === 'invalid' &&
    errorPropertyId === currentPropertyId &&
    errorField === field
  ) {
    return 'Check this field.';
  }

  return undefined;
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  return message ? (
    <span className={styles.fieldError} id={id}>
      {message}
    </span>
  ) : (
    <span className={styles.fieldErrorPlaceholder} id={id} />
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireCustomer();
  const [params, properties, dashboardSummary] = await Promise.all([
    searchParams,
    listUserProperties(session.user.id),
    getCustomerDashboardSummary(session.user.id),
  ]);
  const propertyMessage = params.properties ? propertyMessages[params.properties] : undefined;
  const binMessage = params.bins ? binMessages[params.bins] : undefined;
  const message = binMessage ?? propertyMessage;
  const isError = params.bins
    ? errorBinStatuses.has(params.bins)
    : params.properties
      ? errorPropertyStatuses.has(params.properties)
      : false;

  return (
    <Shell>
      <section className={styles.dashboardHeader}>
        <p className={styles.eyebrow}>Customer dashboard</p>
        <h1>Welcome{session.user.name ? `, ${session.user.name}` : ''}</h1>
        <p>Review your services and keep each property and its bins up to date.</p>
      </section>

      <section className={styles.metricGrid} aria-label="Dashboard summary">
        <div>
          <span>{dashboardSummary?.totals.properties ?? 0}</span>
          <p>Properties</p>
        </div>
        <div>
          <span>{dashboardSummary?.totals.activeServices ?? 0}</span>
          <p>Active services</p>
        </div>
        <div>
          <span>{dashboardSummary?.totals.bins ?? 0}</span>
          <p>Known bins</p>
        </div>
        <div>
          <span className={styles.metricValueText}>
            {formatDateTime(dashboardSummary?.nextServiceVisit?.scheduledFor)}
          </span>
          <p>Next service</p>
        </div>
      </section>

      {message ? (
        <p
          className={isError ? styles.errorNotice : styles.successNotice}
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      ) : null}

      <section className={styles.dashboardGrid} aria-label="Property management">
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Active properties</h2>
            <span>{properties.length}</span>
          </div>

          {properties.length > 0 ? (
            <div className={styles.propertyList}>
              {properties.map((property) => (
                <PropertyCard
                  binId={params.binId}
                  binStatus={params.bins}
                  editOpen={params.edit === property.id}
                  key={property.id}
                  manageBinsOpen={params.manage === property.id}
                  property={property}
                  propertyField={params.propertyField}
                  propertyId={params.propertyId}
                  propertyStatus={params.properties}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No active properties yet.</p>
          )}
        </div>

        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Add property</h2>
          </div>
          <form className={styles.propertyForm} action={createProperty}>
            <label>
              <span>Label</span>
              <input maxLength={80} name="label" placeholder="Home, rental, Airbnb" />
            </label>
            <label>
              <span>Address line 1</span>
              <input
                aria-describedby="new-property-addressLine1-error"
                aria-invalid={
                  fieldError(
                    params.properties,
                    params.propertyId,
                    params.propertyField,
                    'new',
                    'addressLine1'
                  )
                    ? true
                    : undefined
                }
                autoComplete="address-line1"
                maxLength={120}
                name="addressLine1"
                required
              />
              <FieldError
                id="new-property-addressLine1-error"
                message={fieldError(
                  params.properties,
                  params.propertyId,
                  params.propertyField,
                  'new',
                  'addressLine1'
                )}
              />
            </label>
            <label>
              <span>Address line 2</span>
              <input autoComplete="address-line2" maxLength={120} name="addressLine2" />
            </label>
            <div className={styles.fieldGrid}>
              <label>
                <span>Suburb</span>
                <input autoComplete="address-level2" maxLength={80} name="suburb" />
              </label>
              <label>
                <span>Postcode</span>
                <input
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={16}
                  name="postcode"
                />
              </label>
            </div>
            <label>
              <span>City</span>
              <input
                aria-describedby="new-property-city-error"
                aria-invalid={
                  fieldError(
                    params.properties,
                    params.propertyId,
                    params.propertyField,
                    'new',
                    'city'
                  )
                    ? true
                    : undefined
                }
                autoComplete="address-level1"
                defaultValue="Whangarei"
                maxLength={80}
                name="city"
                required
              />
              <FieldError
                id="new-property-city-error"
                message={fieldError(
                  params.properties,
                  params.propertyId,
                  params.propertyField,
                  'new',
                  'city'
                )}
              />
            </label>
            <label>
              <span>Collection notes</span>
              <textarea maxLength={500} name="collectionNotes" rows={4} />
            </label>
            <button className={styles.buttonPrimary} type="submit">
              Add property
            </button>
          </form>
        </aside>
      </section>
    </Shell>
  );
}
