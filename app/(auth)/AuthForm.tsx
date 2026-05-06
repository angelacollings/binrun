import Link from 'next/link';

import { requestMagicLink } from './actions';
import styles from '../auth.module.css';

type AuthFormProps = {
  callbackUrl: string;
  error?: string;
  mode: 'login' | 'register';
};

const errorMessages: Record<string, string> = {
  'invalid-email': 'Enter a valid email address.',
  'send-failed': 'We could not send a sign-in link. Try again in a moment.',
};

export function AuthForm({ callbackUrl, error, mode }: AuthFormProps) {
  const isRegister = mode === 'register';
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <section className={styles.context} aria-labelledby={`${mode}-context-heading`}>
          <div className={styles.brand}>BinRun</div>
          <div className={styles.contextCopy}>
            <h1 id={`${mode}-context-heading`}>Bin day? Sorted.</h1>
            <p>
              Customers manage properties and subscriptions. Workers see the routes they need.
              Admins keep the service running.
            </p>
          </div>
          <p className={styles.contextFoot}>Secure access is handled by email sign-in links.</p>
        </section>

        <main className={styles.formWrap}>
          <div className={styles.formHeader}>
            <p className={styles.eyebrow}>{isRegister ? 'Create access' : 'Sign in'}</p>
            <h2>{isRegister ? 'Start with your email' : 'Access your BinRun account'}</h2>
            <p>
              Enter your email and we will send a private sign-in link. The message is the same
              whether an account exists or needs to be created.
            </p>
          </div>

          {errorMessage ? (
            <p className={styles.alert} id={`${mode}-error`} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <form className={styles.form} action={requestMagicLink}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className={styles.field}>
              <label htmlFor={`${mode}-email`}>Email address</label>
              <input
                aria-describedby={errorMessage ? `${mode}-error ${mode}-hint` : `${mode}-hint`}
                aria-invalid={errorMessage ? 'true' : undefined}
                autoComplete="email"
                id={`${mode}-email`}
                inputMode="email"
                name="email"
                required
                type="email"
              />
            </div>
            <button className={styles.button} type="submit">
              Send sign-in link
            </button>
            <p className={styles.hint} id={`${mode}-hint`}>
              No password is needed. Links expire automatically and should not be forwarded.
            </p>
          </form>

          <p className={styles.switchText}>
            {isRegister ? (
              <>
                Already have access? <Link href="/login">Sign in instead</Link>.
              </>
            ) : (
              <>
                New to BinRun? <Link href="/register">Request access</Link>.
              </>
            )}
          </p>
        </main>
      </div>
    </div>
  );
}
