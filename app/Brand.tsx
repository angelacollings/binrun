import Link from 'next/link';

import styles from './brand.module.css';

type BrandProps = {
  className?: string;
};

export function Brand({ className }: BrandProps) {
  return (
    <Link className={`${styles.brand}${className ? ` ${className}` : ''}`} href="/">
      <span className={styles.mark} aria-hidden="true" />
      <span>BinRun</span>
    </Link>
  );
}
