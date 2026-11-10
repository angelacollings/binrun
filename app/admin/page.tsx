import type { Metadata } from 'next';

import { requireAdmin } from '@/lib/auth/roles';
import { listServiceRunBoard } from '@/lib/operations/service';

import { RunBoard } from '../(app)/RunBoard';
import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';

export const metadata: Metadata = {
  title: 'Service operations',
  description: 'Review and manage BinRun service operations.',
};

export default async function AdminPage() {
  await requireAdmin();
  const visits = await listServiceRunBoard();

  return (
    <Shell>
      <p className={styles.eyebrow}>Admin</p>
      <h1>Service operations</h1>
      <p>Today’s operational picture across customers, properties, bins, and service status.</p>
      <RunBoard visits={visits} />
    </Shell>
  );
}
