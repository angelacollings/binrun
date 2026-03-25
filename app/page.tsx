import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>BinRun</h1>
          <p>Bin day? Sorted.</p>
        </div>
      </main>
    </div>
  );
}

console.log(process.env.NEXTAUTH_URL);
