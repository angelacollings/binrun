import styles from './page.module.css';

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
        </div>
      </main>
    </div>
  );
}
