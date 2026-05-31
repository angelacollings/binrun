import { requireCustomer } from '@/lib/auth/roles';
import { getCustomerDashboardSummary } from '@/lib/dashboard/service';
import { listUserProperties } from '@/lib/properties/service';

import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';
import { createProperty, deactivateProperty, updateProperty } from './actions';

type DashboardPageProps = {
  searchParams: Promise<{
    propertyField?: string;
    propertyId?: string;
    properties?: string;
  }>;
};

const propertyMessages: Record<string, string> = {
  created: 'Property added.',
  deactivated: 'Property removed from active service.',
  invalid: 'Check the property details and try again.',
  'not-found': 'Property not found.',
  updated: 'Property updated.',
};

function textValue(value: string | null | undefined) {
  return value ?? '';
}

function formatPackageStatus(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatServiceTiming(service: { frequency: string; serviceDay: string | null }) {
  const cadence = service.frequency.toLowerCase().replace('_', ' ');
  const day = service.serviceDay ? ` on ${service.serviceDay.toLowerCase()}` : '';

  return `${cadence}${day}`;
}

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

function propertyMessage(value: string | undefined) {
  return value ? propertyMessages[value] : undefined;
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

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireCustomer();
  const [{ properties: propertyStatus, propertyField, propertyId }, properties, dashboardSummary] =
    await Promise.all([
      searchParams,
      listUserProperties(session.user.id),
      getCustomerDashboardSummary(session.user.id),
    ]);
  const message = propertyMessage(propertyStatus);

  return (
    <Shell>
      <section className={styles.dashboardHeader}>
        <p className={styles.eyebrow}>Customer dashboard</p>
        <h1>Welcome{session.user.name ? `, ${session.user.name}` : ''}</h1>
        <p>Manage the service addresses BinRun should know about.</p>
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
        <p className={propertyStatus === 'invalid' ? styles.errorNotice : styles.successNotice}>
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
                <article className={styles.propertyItem} key={property.id}>
                  <div className={styles.propertySummary}>
                    <h3>{property.label || 'Service address'}</h3>
                    <p>
                      {property.addressLine1}
                      {property.addressLine2 ? `, ${property.addressLine2}` : ''}
                    </p>
                    <p>
                      {[property.suburb, property.city, property.postcode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {property.collectionNotes ? (
                      <p className={styles.mutedText}>{property.collectionNotes}</p>
                    ) : null}
                    {property.services.length > 0 ? (
                      <div className={styles.serviceSummaryList}>
                        {property.services.map((service) => (
                          <div className={styles.serviceSummary} key={service.id}>
                            <span>{service.package.name}</span>
                            <strong>{formatPackageStatus(service.status)}</strong>
                            <p>{formatServiceTiming(service)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.mutedText}>
                        No package selected yet. Email admin@binrun.co.nz if you want help choosing.
                      </p>
                    )}
                  </div>

                  <form className={styles.propertyForm} action={updateProperty}>
                    <input name="propertyId" type="hidden" value={property.id} />
                    <div className={styles.fieldGrid}>
                      <label>
                        <span>Label</span>
                        <input
                          aria-describedby={`property-${property.id}-label-error`}
                          aria-invalid={
                            fieldError(
                              propertyStatus,
                              propertyId,
                              propertyField,
                              property.id,
                              'label'
                            )
                              ? true
                              : undefined
                          }
                          defaultValue={textValue(property.label)}
                          maxLength={80}
                          name="label"
                          placeholder="Home"
                        />
                        <FieldError
                          id={`property-${property.id}-label-error`}
                          message={fieldError(
                            propertyStatus,
                            propertyId,
                            propertyField,
                            property.id,
                            'label'
                          )}
                        />
                      </label>
                      <label>
                        <span>Postcode</span>
                        <input
                          autoComplete="postal-code"
                          defaultValue={textValue(property.postcode)}
                          inputMode="numeric"
                          maxLength={16}
                          name="postcode"
                        />
                      </label>
                    </div>
                    <label>
                      <span>Address line 1</span>
                      <input
                        aria-describedby={`property-${property.id}-addressLine1-error`}
                        aria-invalid={
                          fieldError(
                            propertyStatus,
                            propertyId,
                            propertyField,
                            property.id,
                            'addressLine1'
                          )
                            ? true
                            : undefined
                        }
                        autoComplete="address-line1"
                        defaultValue={property.addressLine1}
                        maxLength={120}
                        name="addressLine1"
                        required
                      />
                      <FieldError
                        id={`property-${property.id}-addressLine1-error`}
                        message={fieldError(
                          propertyStatus,
                          propertyId,
                          propertyField,
                          property.id,
                          'addressLine1'
                        )}
                      />
                    </label>
                    <label>
                      <span>Address line 2</span>
                      <input
                        autoComplete="address-line2"
                        defaultValue={textValue(property.addressLine2)}
                        maxLength={120}
                        name="addressLine2"
                      />
                    </label>
                    <div className={styles.fieldGrid}>
                      <label>
                        <span>Suburb</span>
                        <input
                          autoComplete="address-level2"
                          defaultValue={textValue(property.suburb)}
                          maxLength={80}
                          name="suburb"
                        />
                      </label>
                      <label>
                        <span>City</span>
                        <input
                          aria-describedby={`property-${property.id}-city-error`}
                          aria-invalid={
                            fieldError(
                              propertyStatus,
                              propertyId,
                              propertyField,
                              property.id,
                              'city'
                            )
                              ? true
                              : undefined
                          }
                          autoComplete="address-level1"
                          defaultValue={property.city}
                          maxLength={80}
                          name="city"
                          required
                        />
                        <FieldError
                          id={`property-${property.id}-city-error`}
                          message={fieldError(
                            propertyStatus,
                            propertyId,
                            propertyField,
                            property.id,
                            'city'
                          )}
                        />
                      </label>
                    </div>
                    <label>
                      <span>Collection notes</span>
                      <textarea
                        defaultValue={textValue(property.collectionNotes)}
                        maxLength={500}
                        name="collectionNotes"
                        rows={3}
                      />
                    </label>
                    <div className={styles.actionRow}>
                      <button className={styles.buttonPrimary} type="submit">
                        Save changes
                      </button>
                    </div>
                  </form>
                  <form className={styles.removeForm} action={deactivateProperty}>
                    <input name="propertyId" type="hidden" value={property.id} />
                    <label>
                      <input
                        aria-describedby={`property-${property.id}-confirmRemove-error`}
                        aria-invalid={
                          fieldError(
                            propertyStatus,
                            propertyId,
                            propertyField,
                            property.id,
                            'confirmRemove'
                          )
                            ? true
                            : undefined
                        }
                        name="confirmRemove"
                        required
                        type="checkbox"
                      />
                      <span>Confirm removal from active service</span>
                    </label>
                    <FieldError
                      id={`property-${property.id}-confirmRemove-error`}
                      message={fieldError(
                        propertyStatus,
                        propertyId,
                        propertyField,
                        property.id,
                        'confirmRemove'
                      )}
                    />
                    <button className={styles.buttonDanger} type="submit">
                      Remove
                    </button>
                  </form>
                </article>
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
                  fieldError(propertyStatus, propertyId, propertyField, 'new', 'addressLine1')
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
                  propertyStatus,
                  propertyId,
                  propertyField,
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
                  fieldError(propertyStatus, propertyId, propertyField, 'new', 'city')
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
                message={fieldError(propertyStatus, propertyId, propertyField, 'new', 'city')}
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

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  return message ? (
    <span className={styles.fieldError} id={id}>
      {message}
    </span>
  ) : (
    <span className={styles.fieldErrorPlaceholder} id={id} />
  );
}
