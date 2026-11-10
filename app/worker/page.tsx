import type { Metadata } from 'next';

import { requireWorker } from '@/lib/auth/roles';
import { listServiceRunBoard } from '@/lib/operations/service';

import { RunBoard } from '../(app)/RunBoard';
import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';

export const metadata: Metadata = {
  title: 'Worker run board',
  description: 'Review and update upcoming BinRun service visits.',
};

export default async function WorkerPage() {
  await requireWorker();
  const visits = await listServiceRunBoard();

  return (
    <Shell>
      <p className={styles.eyebrow}>Worker routes</p>
      <h1>Service route access</h1>
      <p>Upcoming property stops with bin details, customer context, and collection notes.</p>
      <RunBoard visits={visits} />
    </Shell>
  );
}
