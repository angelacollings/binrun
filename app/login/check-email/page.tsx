import Link from 'next/link';

import styles from '../../auth.module.css';

export default function CheckEmailPage() {
  return (
    <main className={styles.checkEmail}>
      <section className={styles.messageBox} aria-labelledby="check-email-heading">
        <p className={styles.eyebrow}>Check your email</p>
        <h1 id="check-email-heading">Your sign-in link is on its way</h1>
        <p>
          If the address can receive BinRun access, a private sign-in link will arrive shortly.
          Keep this tab open, then return after using the link.
        </p>
        <p className={styles.switchText}>
          Need to try again? <Link href="/login">Return to sign in</Link>.
        </p>
      </section>
    </main>
  );
}
