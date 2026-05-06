import { requireAdmin } from '@/lib/auth/roles';

import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';

export default async function AdminPage() {
  await requireAdmin();

  return (
    <Shell>
      <p className={styles.eyebrow}>Admin</p>
      <h1>Service operations</h1>
      <p>This protected admin area is ready for customer, schedule, and fulfilment controls.</p>
    </Shell>
  );
}
