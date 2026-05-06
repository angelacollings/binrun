import { requireWorker } from '@/lib/auth/roles';

import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';

export default async function WorkerPage() {
  await requireWorker();

  return (
    <Shell>
      <p className={styles.eyebrow}>Worker routes</p>
      <h1>Service route access</h1>
      <p>This protected worker area is ready for route lists and service visit workflows.</p>
    </Shell>
  );
}
