import type { CollectionDay, PropertyServiceStatus } from '@prisma/client';

import {
  binTypeLabels,
  collectionDayLabels,
  supportedBinTypes,
  supportedCollectionDays,
} from '@/lib/bins/service';
import type { listUserProperties } from '@/lib/properties/service';

import styles from '../app.module.css';
import { createBin, deactivateProperty, removeBin, updateBin, updateProperty } from './actions';

type UserProperty = Awaited<ReturnType<typeof listUserProperties>>[number];

type PropertyCardProps = {
  binId?: string;
  binStatus?: string;
  editOpen: boolean;
  manageBinsOpen: boolean;
  property: UserProperty;
  propertyField?: string;
  propertyId?: string;
  propertyStatus?: string;
};

const serviceStatusCopy: Record<PropertyServiceStatus, string> = {
  ACTIVE: 'Your regular service is active.',
  CANCELED: 'This service has been canceled.',
  PAUSED: 'This service is currently paused.',
  PENDING: 'Your request is received and awaiting service confirmation.',
};

function textValue(value: string | null | undefined) {
  return value ?? '';
}

function formatPackageStatus(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatServiceTiming(service: { frequency: string; serviceDay: string | null }) {
  const cadence = service.frequency.toLowerCase().replaceAll('_', ' ');
  const day = service.serviceDay ? ` on ${service.serviceDay.toLowerCase()}` : '';

  return `${cadence}${day}`;
}

function propertyFieldError(
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

function CollectionDayOptions() {
  return (
    <>
      <option value="">Not set</option>
      {supportedCollectionDays.map((day) => (
        <option key={day} value={day}>
          {collectionDayLabels[day]}
        </option>
      ))}
    </>
  );
}

function formatCollectionDay(day: CollectionDay | null) {
  return day ? collectionDayLabels[day] : 'Collection day not set';
}

export function PropertyCard({
  binId,
  binStatus,
  editOpen,
  manageBinsOpen,
  property,
  propertyField,
  propertyId,
  propertyStatus,
}: PropertyCardProps) {
  const existingBinTypes = new Set(property.bins.map((bin) => bin.type));
  const availableBinTypes = supportedBinTypes.filter((type) => !existingBinTypes.has(type));
  const hasActiveService = property.services.some((service) =>
    ['ACTIVE', 'PAUSED'].includes(service.status)
  );
  const propertyHeadingId = `property-${property.id}-heading`;

  return (
    <article aria-labelledby={propertyHeadingId} className={styles.propertyItem}>
      <div className={styles.propertySummary}>
        <div className={styles.propertyTitleRow}>
          <div>
            <h3 id={propertyHeadingId}>{property.label || 'Service address'}</h3>
            <p>
              {property.addressLine1}
              {property.addressLine2 ? `, ${property.addressLine2}` : ''}
            </p>
            <p>{[property.suburb, property.city, property.postcode].filter(Boolean).join(', ')}</p>
          </div>
          <span className={styles.propertyBinCount}>
            {property.bins.length} {property.bins.length === 1 ? 'bin' : 'bins'}
          </span>
        </div>
        {property.collectionNotes ? (
          <p className={styles.propertyNote}>{property.collectionNotes}</p>
        ) : null}
        {property.services.length > 0 ? (
          <div className={styles.serviceSummaryList}>
            {property.services.map((service) => (
              <div className={styles.serviceSummary} key={service.id}>
                <span>{service.package.name}</span>
                <strong>{formatPackageStatus(service.status)}</strong>
                <p>{formatServiceTiming(service)}</p>
                <p>{serviceStatusCopy[service.status]}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.mutedText}>
            No package selected yet.{' '}
            <a href="mailto:admin@binrun.co.nz?subject=Help%20choosing%20a%20BinRun%20service">
              Ask us to help choose a service.
            </a>
          </p>
        )}
      </div>

      <details className={styles.managementDetails} open={manageBinsOpen}>
        <summary>Manage bins</summary>
        <div className={styles.managementContent}>
          <div className={styles.managementHeader}>
            <div>
              <h4>Bins at this property</h4>
              <p>Keep collection days, labels, and collection quantities up to date.</p>
            </div>
          </div>

          {property.bins.length > 0 ? (
            <div className={styles.binList}>
              {property.bins.map((bin) => {
                const binHeadingId = `bin-${bin.id}-heading`;

                return (
                  <article aria-labelledby={binHeadingId} className={styles.binItem} key={bin.id}>
                    <div className={styles.binSummary}>
                      <h5 id={binHeadingId}>{bin.label || binTypeLabels[bin.type]}</h5>
                      <p>
                        {binTypeLabels[bin.type]} · {formatCollectionDay(bin.collectionDay)}
                        {bin.maxQuantity ? ` · up to ${bin.maxQuantity}` : ''}
                      </p>
                    </div>
                    <form className={styles.binForm} action={updateBin}>
                      <input name="propertyId" type="hidden" value={property.id} />
                      <input name="binId" type="hidden" value={bin.id} />
                      <div className={styles.fieldGrid}>
                        <label>
                          <span>Label</span>
                          <input
                            defaultValue={textValue(bin.label)}
                            maxLength={80}
                            name="label"
                            placeholder={binTypeLabels[bin.type]}
                          />
                        </label>
                        <label>
                          <span>Collection day</span>
                          <select defaultValue={bin.collectionDay ?? ''} name="collectionDay">
                            <CollectionDayOptions />
                          </select>
                        </label>
                      </div>
                      <label>
                        <span>Maximum quantity per collection</span>
                        <input
                          defaultValue={bin.maxQuantity ?? ''}
                          inputMode="numeric"
                          max={20}
                          min={1}
                          name="maxQuantity"
                          placeholder="Optional"
                          type="number"
                        />
                      </label>
                      <button className={styles.buttonPrimary} type="submit">
                        Save bin
                      </button>
                    </form>
                    <form className={styles.removeForm} action={removeBin}>
                      <input name="propertyId" type="hidden" value={property.id} />
                      <input name="binId" type="hidden" value={bin.id} />
                      <label>
                        <input
                          aria-describedby={`bin-${bin.id}-confirm-error`}
                          aria-invalid={
                            binStatus === 'confirm-remove' && binId === bin.id ? true : undefined
                          }
                          name="confirmRemoveBin"
                          required
                          type="checkbox"
                        />
                        <span>Confirm bin removal</span>
                      </label>
                      <FieldError
                        id={`bin-${bin.id}-confirm-error`}
                        message={
                          binStatus === 'confirm-remove' && binId === bin.id
                            ? 'Confirm removal first.'
                            : undefined
                        }
                      />
                      <button className={styles.buttonDanger} type="submit">
                        Remove bin
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyState}>No bins are recorded for this property yet.</p>
          )}

          <div className={styles.addBinSection}>
            <h4>Add another bin</h4>
            {availableBinTypes.length > 0 ? (
              <form className={styles.binForm} action={createBin}>
                <input name="propertyId" type="hidden" value={property.id} />
                <div className={styles.fieldGrid}>
                  <label>
                    <span>Bin type</span>
                    <select name="type" required>
                      {availableBinTypes.map((type) => (
                        <option key={type} value={type}>
                          {binTypeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Collection day</span>
                    <select defaultValue="" name="collectionDay">
                      <CollectionDayOptions />
                    </select>
                  </label>
                </div>
                <div className={styles.fieldGrid}>
                  <label>
                    <span>Label</span>
                    <input maxLength={80} name="label" placeholder="Optional nickname" />
                  </label>
                  <label>
                    <span>Maximum quantity</span>
                    <input
                      inputMode="numeric"
                      max={20}
                      min={1}
                      name="maxQuantity"
                      placeholder="Optional"
                      type="number"
                    />
                  </label>
                </div>
                <button className={styles.buttonPrimary} type="submit">
                  Add bin
                </button>
              </form>
            ) : (
              <p className={styles.mutedText}>All supported bin types are already recorded.</p>
            )}
          </div>
        </div>
      </details>

      <details className={styles.managementDetails} open={editOpen}>
        <summary>Edit property details</summary>
        <div className={styles.managementContent}>
          <form className={styles.propertyForm} action={updateProperty}>
            <input name="propertyId" type="hidden" value={property.id} />
            <div className={styles.fieldGrid}>
              <label>
                <span>Label</span>
                <input
                  aria-describedby={`property-${property.id}-label-error`}
                  aria-invalid={
                    propertyFieldError(
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
                  message={propertyFieldError(
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
                  propertyFieldError(
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
                message={propertyFieldError(
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
                    propertyFieldError(
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
                  message={propertyFieldError(
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
            <button className={styles.buttonPrimary} type="submit">
              Save property
            </button>
          </form>

          {hasActiveService ? (
            <div className={styles.serviceSupport}>
              <h4>Need to change or cancel this service?</h4>
              <p>
                Email{' '}
                <a
                  href={`mailto:admin@binrun.co.nz?subject=${encodeURIComponent(
                    `BinRun service change for ${property.label || property.addressLine1}`
                  )}`}
                >
                  admin@binrun.co.nz
                </a>{' '}
                and we will help with the service and property record safely.
              </p>
            </div>
          ) : (
            <form className={styles.removeForm} action={deactivateProperty}>
              <input name="propertyId" type="hidden" value={property.id} />
              <label>
                <input
                  aria-describedby={`property-${property.id}-confirmRemove-error`}
                  aria-invalid={
                    propertyFieldError(
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
                <span>Confirm property removal</span>
              </label>
              <FieldError
                id={`property-${property.id}-confirmRemove-error`}
                message={propertyFieldError(
                  propertyStatus,
                  propertyId,
                  propertyField,
                  property.id,
                  'confirmRemove'
                )}
              />
              <button className={styles.buttonDanger} type="submit">
                Remove property
              </button>
            </form>
          )}
        </div>
      </details>
    </article>
  );
}
