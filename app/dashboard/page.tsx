import { requireCustomer } from '@/lib/auth/roles';

import { Shell } from '../(app)/Shell';
import styles from '../app.module.css';

export default async function DashboardPage() {
  const session = await requireCustomer();

  return (
    <Shell>
      <p className={styles.eyebrow}>Customer dashboard</p>
      <h1>Welcome{session.user.name ? `, ${session.user.name}` : ''}</h1>
      <p>
        This protected customer area is ready for property, bin, and subscription workflows.
      </p>
    </Shell>
  );
}
