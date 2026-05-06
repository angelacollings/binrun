import Link from 'next/link';

import { requestLogin } from './actions';
import styles from '../auth.module.css';

type CustomerLoginFormProps = {
  callbackUrl?: string;
  error?: string;
};

const errorMessages: Record<string, string> = {
  'invalid-credentials': 'Check your email and password, then try again.',
};

export function CustomerLoginForm({ callbackUrl, error }: CustomerLoginFormProps) {
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <main className={styles.authPage}>
      <section className={styles.authHeader} aria-labelledby="login-heading">
        <Link className={styles.brandLink} href="/">
          BinRun
        </Link>
        <p className={styles.eyebrow}>Secure sign in</p>
        <h1 id="login-heading">Sign in to BinRun</h1>
        <p>Use your BinRun email and password.</p>
      </section>

      <section className={styles.authPanel} aria-label="Sign-in form">
        {errorMessage ? (
          <p className={styles.alert} id="login-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form className={styles.form} action={requestLogin}>
          {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
          <div className={styles.field}>
            <label htmlFor="login-email">Email address</label>
            <input
              aria-describedby={errorMessage ? 'login-error' : undefined}
              aria-invalid={errorMessage ? 'true' : undefined}
              autoComplete="email"
              id="login-email"
              inputMode="email"
              name="email"
              required
              type="email"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="login-password">Password</label>
            <input
              aria-describedby={errorMessage ? 'login-error' : undefined}
              aria-invalid={errorMessage ? 'true' : undefined}
              autoComplete="current-password"
              id="login-password"
              name="password"
              required
              type="password"
            />
          </div>
          <button className={styles.button} type="submit">
            Sign in
          </button>
          <p className={styles.hint}>Forgot password support is coming before launch.</p>
        </form>

        <p className={styles.switchText}>
          Need BinRun service? <Link href="/register">Start a service signup</Link>.
        </p>
      </section>
    </main>
  );
}
