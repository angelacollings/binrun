import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.kicker}>Coming Soon</span>
          <h1>BinRun</h1>
          <p>
            <strong>Bin day? Sorted.</strong> We take your bins to the roadside and return them
            after collection.
          </p>
          <div className={styles.ctas}>
            <Link className={styles.primary} href="/login">
              Sign in
            </Link>
            <Link className={styles.secondary} href="/register">
              Request access
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
