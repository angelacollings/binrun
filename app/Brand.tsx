import Link from 'next/link';
import Image from 'next/image';

import styles from './brand.module.css';

type BrandProps = {
  className?: string;
};

export function Brand({ className }: BrandProps) {
  return (
    <Link className={`${styles.brand}${className ? ` ${className}` : ''}`} href="/">
      <Image alt="" aria-hidden="true" height={30} src="/brand/binrun-mark.svg" width={40} />
      <span>BinRun</span>
    </Link>
  );
}
