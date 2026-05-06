import Link from 'next/link';

import { requestServiceSignup } from './actions';
import styles from '../auth.module.css';

type ServiceSignupFormProps = {
  error?: string;
};

export function ServiceSignupForm({ error }: ServiceSignupFormProps) {
  const errorMessage =
    error === 'incomplete'
      ? 'Add your contact details, password, service address, and at least one bin type.'
      : undefined;

  return (
    <main className={styles.signupPage}>
      <section className={styles.signupIntro} aria-labelledby="signup-heading">
        <Link className={styles.brandLink} href="/">
          BinRun
        </Link>
        <p className={styles.eyebrow}>Start service</p>
        <h1 id="signup-heading">Set up your bin run</h1>
        <p>
          Tell us where to collect from, which bins need moving, and create the account you will use
          to manage the service.
        </p>
        <dl className={styles.steps}>
          <div>
            <dt>1</dt>
            <dd>Enter your service address</dd>
          </div>
          <div>
            <dt>2</dt>
            <dd>Choose the bins you need handled</dd>
          </div>
          <div>
            <dt>3</dt>
            <dd>Create your password and continue to your dashboard</dd>
          </div>
        </dl>
      </section>

      <section className={styles.signupPanel} aria-label="Service signup form">
        {errorMessage ? (
          <p className={styles.alert} id="signup-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form className={styles.signupForm} action={requestServiceSignup}>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="signup-name">Full name</label>
              <input autoComplete="name" id="signup-name" name="name" required type="text" />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-email">Email address</label>
              <input
                autoComplete="email"
                id="signup-email"
                inputMode="email"
                name="email"
                required
                type="email"
              />
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="signup-password">Password</label>
              <input
                autoComplete="new-password"
                id="signup-password"
                minLength={10}
                name="password"
                required
                type="password"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-password-confirm">Confirm password</label>
              <input
                autoComplete="new-password"
                id="signup-password-confirm"
                minLength={10}
                name="passwordConfirm"
                required
                type="password"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="signup-address">Service address</label>
            <input
              autoComplete="street-address"
              id="signup-address"
              name="addressLine1"
              required
              type="text"
            />
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="signup-suburb">Suburb</label>
              <input autoComplete="address-level2" id="signup-suburb" name="suburb" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-postcode">Postcode</label>
              <input
                autoComplete="postal-code"
                id="signup-postcode"
                inputMode="numeric"
                name="postcode"
              />
            </div>
          </div>

          <fieldset className={styles.binOptions}>
            <legend>Bins to move</legend>
            <label>
              <input defaultChecked name="binTypes" type="checkbox" value="RECYCLING_BINS" />
              Recycling bins
            </label>
            <label>
              <input name="binTypes" type="checkbox" value="RUBBISH_BAGS" />
              Prepaid rubbish bags
            </label>
            <label>
              <input name="binTypes" type="checkbox" value="RUBBISH_WHEELIE" />
              Rubbish wheelie bin
            </label>
            <label>
              <input name="binTypes" type="checkbox" value="GREEN_WASTE_WHEELIE" />
              Green waste wheelie bin
            </label>
          </fieldset>

          <div className={styles.field}>
            <label htmlFor="signup-notes">Collection notes</label>
            <textarea
              id="signup-notes"
              name="collectionNotes"
              placeholder="Gate code, bin location, driveway notes"
              rows={4}
            />
          </div>

          <button className={styles.button} type="submit">
            Create account and start service
          </button>
          <p className={styles.hint}>
            We never ask for card details here. Payment setup happens later through Stripe.
          </p>
        </form>

        <p className={styles.switchText}>
          Already a customer? <Link href="/login">Sign in to your dashboard</Link>.
        </p>
      </section>
    </main>
  );
}
