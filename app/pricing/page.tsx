import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import styles from '../page.module.css';
import { Brand } from '../Brand';
import { publicServicePackages } from '@/lib/service-packages';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Compare BinRun wheelie bin set-out, return, and cleaning service packages.',
};

const packagePrices: Record<string, string> = {
  ONE_OFF_CLEAN: 'Quote',
  REGULAR_RUN: 'From $25',
  REGULAR_RUN_PLUS_WASH: 'From $35',
};

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Brand />
        <nav aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Login</Link>
        </nav>
        <Link className={styles.headerButton} href="/register">
          Sign up
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.sectionHeader} aria-labelledby="pricing-heading">
          <span className={styles.kicker}>Pricing</span>
          <h1 id="pricing-heading">Simple packages</h1>
          <p>Choose a starting point. Larger sites and multiple addresses can be tailored.</p>
        </section>

        <section className={styles.packageGrid} aria-label="Service package prices">
          {publicServicePackages.map((servicePackage) => (
            <article className={styles.packageCard} key={servicePackage.code}>
              <h2>{servicePackage.name}</h2>
              <strong>{packagePrices[servicePackage.code]}</strong>
              <p>{servicePackage.summary}</p>
              <Link className={styles.primary} href="/register">
                Get started
              </Link>
            </article>
          ))}
        </section>

        <section className={styles.helpGrid} aria-label="Pricing help">
          <article>
            <Image alt="" aria-hidden="true" height={64} src="/brand/icon-support.svg" width={64} />
            <h2>Need help signing up?</h2>
            <p>
              Email <a href="mailto:admin@binrun.co.nz">admin@binrun.co.nz</a> and we can help
              arrange the right package with you.
            </p>
          </article>
          <article>
            <Image alt="" aria-hidden="true" height={64} src="/brand/icon-secure.svg" width={64} />
            <h2>Multiple properties</h2>
            <p>
              We can quote a catered package for landlords, blocks of flats, body corporates, or
              customers with several addresses.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
