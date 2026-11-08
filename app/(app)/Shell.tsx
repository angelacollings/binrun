import type { ReactNode } from 'react';
import Image from 'next/image';

import { logout } from '../(auth)/actions';
import styles from '../app.module.css';

type ShellProps = {
  children: ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image alt="BinRun" height={64} src="/brand/binrun-logo.svg" width={238} />
        </div>
        <form action={logout}>
          <button className={styles.button} type="submit">
            Sign out
          </button>
        </form>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
