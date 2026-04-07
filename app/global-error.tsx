'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import styles from './global-error.module.css';
import './globals.css';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>BinRun | Something Went Wrong</title>
      </head>
      <body>
        <main className={styles.page}>
          <section className={styles.panel}>
            <p className={styles.eyebrow}>BinRun</p>
            <h1 className={styles.title}>Something went wrong.</h1>
            <p className={styles.description}>
              The app hit an unexpected problem and could not finish loading this page.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.primaryAction}
                type="button"
                onClick={() => reset()}
              >
                Try again
              </button>
              <Link className={styles.secondaryAction} href="/">
                Return home
              </Link>
            </div>
            {error.digest ? <p className={styles.reference}>Reference: {error.digest}</p> : null}
          </section>
        </main>
      </body>
    </html>
  );
}
