import styles from './page.module.css';
import Link from 'next/link';

import { publicServicePackages } from '@/lib/service-packages';

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <img alt="BinRun" src="/brand/binrun-logo.svg" />
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
            <span className={styles.kicker}>Whangarei bin service</span>
            <h1>Bin day? Sorted.</h1>
            <p>Pick a simple package and we will handle the regular set-out, return, or clean.</p>
            <div className={styles.ctas}>
              <Link className={styles.primary} href="/register">
                Get started
              </Link>
              <Link className={styles.secondary} href="/pricing">
                View pricing
              </Link>
            </div>
          </div>
          <div className={styles.heroScene}>
            <img
              alt="BinRun worker standing with one green wheelie bin outside a home"
              src="/images/binrun-hero.png"
            />
          </div>
        </section>

        <section className={styles.features} aria-label="Service benefits">
          <article>
            <img alt="" aria-hidden="true" src="/brand/icon-convenient.svg" />
            <h2>Convenient service</h2>
            <p>We set out and return bins for your regular collection day.</p>
          </article>
          <article>
            <img alt="" aria-hidden="true" src="/brand/icon-seniors.svg" />
            <h2>Helpful for seniors</h2>
            <p>Online signup is optional. Email us and we can arrange setup with you.</p>
          </article>
          <article>
            <img alt="" aria-hidden="true" src="/brand/icon-rental.svg" />
            <h2>Rental friendly</h2>
            <p>Tailored packages are available for multiple properties or larger sites.</p>
          </article>
        </section>

        <section className={styles.howItWorks} id="how-it-works" aria-labelledby="how-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>How BinRun works</span>
            <h2 id="how-heading">Three steps, no fuss</h2>
          </div>
          <div className={styles.stepGrid}>
            <article>
              <span>1</span>
              <h3>Set your address</h3>
              <p>Tell us where the bins live and any access notes.</p>
            </article>
            <article>
              <span>2</span>
              <h3>Choose your package</h3>
              <p>Pick a run, wash, clean-only visit, or ask for a tailored setup.</p>
            </article>
            <article>
              <span>3</span>
              <h3>We handle service</h3>
              <p>BinRun tracks the service and keeps the work visible in your dashboard.</p>
            </article>
          </div>
        </section>

        <section className={styles.packages} aria-labelledby="packages-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Packages</span>
            <h2 id="packages-heading">Simple choices</h2>
          </div>
          <div className={styles.packageGrid}>
            {publicServicePackages.map((servicePackage) => (
              <article className={styles.packageCard} key={servicePackage.code}>
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
      </main>
    </div>
  );
}
