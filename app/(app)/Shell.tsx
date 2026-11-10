import type { ReactNode } from 'react';

import { logout } from '../(auth)/actions';
import { Brand } from '../Brand';
import styles from '../app.module.css';

type ShellProps = {
  children: ReactNode;
};

export function Shell({ children }: ShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Brand />
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
