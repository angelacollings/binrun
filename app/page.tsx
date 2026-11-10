import styles from './page.module.css';
import Link from 'next/link';
import type { Metadata } from 'next';

import { publicServicePackages } from '@/lib/service-packages';

export const metadata: Metadata = {
  title: {
    absolute: 'Bin day? Sorted. | BinRun',
  },
};

const packagePrices: Record<string, string> = {
  ONE_OFF_CLEAN: 'Quote',
  REGULAR_RUN: 'From $25',
  REGULAR_RUN_PLUS_WASH: 'From $35',
};

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark} aria-hidden="true" />
          <span>BinRun</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="#how-it-works">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Login</Link>
        </nav>
        <Link className={styles.headerButton} href="/register">
          Sign up
        </Link>
      </header>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.intro}>
            <span className={styles.kicker}>Whangarei property service</span>
            <h2 className={styles.productName}>BinRun</h2>
            <h1>Bin day handled, every week.</h1>
            <p className={styles.lede}>
              <strong>Bin day? Sorted.</strong> Set-out, return, and bin cleaning for Whangarei
              homes, rentals, and small properties.
            </p>
            <div className={styles.ctas}>
              <Link className={styles.primary} href="/register">
                Start service
              </Link>
              <Link className={styles.secondary} href="/pricing">
                View pricing
              </Link>
            </div>
            <dl className={styles.heroStats} aria-label="Service highlights">
              <div>
                <dt>Scheduled</dt>
                <dd>weekly runs</dd>
              </div>
              <div>
                <dt>Local</dt>
                <dd>Whangarei based</dd>
              </div>
              <div>
                <dt>Assisted</dt>
                <dd>setup available</dd>
              </div>
            </dl>
          </div>
          <div className={styles.servicePanel} aria-label="Example BinRun service plan">
            <div className={styles.panelHeader}>
              <span>Example service plan</span>
              <strong>Regular Run + Wash</strong>
            </div>
            <div className={styles.serviceSummary}>
              <div>
                <span>Collection day</span>
                <strong>Thursday</strong>
              </div>
              <div>
                <span>Service area</span>
                <strong>Whangarei</strong>
              </div>
            </div>
            <dl className={styles.taskList}>
              <div>
                <dt>Set out</dt>
                <dd>Wheelie bin and recycling placed for collection.</dd>
              </div>
              <div>
                <dt>Return</dt>
                <dd>Bins brought back after the council collection window.</dd>
              </div>
              <div>
                <dt>Wash</dt>
                <dd>Scheduled cleaning added when your package includes it.</dd>
              </div>
            </dl>
            <div className={styles.panelFooter}>
              <span>Good for</span>
              <strong>Homes, rentals, seniors, and busy households</strong>
            </div>
          </div>
        </section>

        <section className={styles.features} aria-label="Service benefits">
          <article>
            <span aria-hidden="true">01</span>
            <h2>Reliable collection-day support</h2>
            <p>Bins are set out and returned around your regular collection day.</p>
          </article>
          <article>
            <span aria-hidden="true">02</span>
            <h2>Clear setup and access notes</h2>
            <p>Online signup is available, with assisted setup for anyone who wants help.</p>
          </article>
          <article>
            <span aria-hidden="true">03</span>
            <h2>Built for homes and rentals</h2>
            <p>Useful for rentals, shared driveways, multi-property owners, and busy households.</p>
          </article>
        </section>

        <section className={styles.howItWorks} id="how-it-works" aria-labelledby="how-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>How BinRun works</span>
            <h2 id="how-heading">Simple service, professionally run</h2>
          </div>
          <div className={styles.stepGrid}>
            <article>
              <span>1</span>
              <h3>Set your address</h3>
              <p>Tell us where the bins live, your collection day, and any access notes.</p>
            </article>
            <article>
              <span>2</span>
              <h3>Choose your package</h3>
              <p>Pick a regular run, add washing, or choose a one-off clean.</p>
            </article>
            <article>
              <span>3</span>
              <h3>We run the service</h3>
              <p>BinRun keeps the work organised so service visits are clear and trackable.</p>
            </article>
          </div>
        </section>

        <section className={styles.packages} aria-labelledby="packages-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Packages</span>
            <h2 id="packages-heading">Simple packages, clear starting points</h2>
            <p>Choose the level of help you need now. Larger sites can be quoted separately.</p>
          </div>
          <div className={styles.packageGrid}>
            {publicServicePackages.map((servicePackage) => (
              <article className={styles.packageCard} key={servicePackage.code}>
                <span>{packagePrices[servicePackage.code]}</span>
                <h3>{servicePackage.name}</h3>
                <p>{servicePackage.summary}</p>
              </article>
            ))}
          </div>
          <Link className={styles.packageLink} href="/pricing">
            Compare plans
          </Link>
        </section>

        <section className={styles.helpGrid} aria-label="Other ways to start service">
          <article>
            <h2>Prefer a person to help?</h2>
            <p>
              Email <a href="mailto:admin@binrun.co.nz">admin@binrun.co.nz</a> and we can set up
              service with you. Phone setup can be arranged from there.
            </p>
          </article>
          <article>
            <h2>Several addresses or a block of flats?</h2>
            <p>
              Tell us what needs servicing and we can build a tailored package for landlords,
              multi-property customers, body corporates, or larger sites.
            </p>
          </article>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta-heading">
          <div>
            <span className={styles.kicker}>Ready when you are</span>
            <h2 id="final-cta-heading">Make bin day one less thing to manage.</h2>
          </div>
          <Link className={styles.primary} href="/register">
            Start service
          </Link>
        </section>
      </main>
    </div>
  );
}
