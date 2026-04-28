import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.kicker}>Coming Soon</span>
          <h1>BinRun</h1>
          <p>Getting your bins to the roadside, back again, and cleaned — launching soon.</p>
        </div>
      </main>
    </div>
  );
}
