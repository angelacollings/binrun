import { requireCustomer } from '@/lib/auth/roles';
import { listUserProperties } from '@/lib/properties/service';

import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';
import { createProperty, deactivateProperty, updateProperty } from './actions';

type DashboardPageProps = {
  searchParams: Promise<{
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

function propertyMessage(value: string | undefined) {
  return value ? propertyMessages[value] : undefined;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireCustomer();
  const [{ properties: propertyStatus }, properties] = await Promise.all([
    searchParams,
    listUserProperties(session.user.id),
  ]);
  const message = propertyMessage(propertyStatus);

  return (
    <Shell>
      <section className={styles.dashboardHeader}>
        <p className={styles.eyebrow}>Customer dashboard</p>
        <h1>Welcome{session.user.name ? `, ${session.user.name}` : ''}</h1>
        <p>Manage the service addresses BinRun should know about.</p>
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
                  </div>

                  <form className={styles.propertyForm} action={updateProperty}>
                    <input name="propertyId" type="hidden" value={property.id} />
                    <div className={styles.fieldGrid}>
                      <label>
                        <span>Label</span>
                        <input
                          defaultValue={textValue(property.label)}
                          maxLength={80}
                          name="label"
                          placeholder="Home"
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
                        autoComplete="address-line1"
                        defaultValue={property.addressLine1}
                        maxLength={120}
                        name="addressLine1"
                        required
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
                          autoComplete="address-level1"
                          defaultValue={property.city}
                          maxLength={80}
                          name="city"
                          required
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
                      <button
                        className={styles.buttonDanger}
                        formAction={deactivateProperty}
                        type="submit"
                      >
                        Remove
                      </button>
                    </div>
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
              <input autoComplete="address-line1" maxLength={120} name="addressLine1" required />
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
                autoComplete="address-level1"
                defaultValue="Whangarei"
                maxLength={80}
                name="city"
                required
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
