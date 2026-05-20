# BinRun

**Bin day? Sorted.**

BinRun is a package-based service for regular bin set-out, return, and optional bin cleaning.

Designed for:

- Busy households
- Elderly or disabled individuals
- Rental property owners
- Airbnb hosts

---

## What We Do

BinRun packages the service around the job customers want done:

- Regular Run
- Regular Run + Wash
- Clean Bin Visit
- One-Off Clean
- Custom Package for multiple properties, rental blocks, body corporates, and larger sites

BinRun handles the **movement and optional cleaning of bins**, not the waste collection itself.

---

## Core Features (MVP)

- User accounts
- Subscription management
- Address/property management
- Package selection
- Assisted signup path for customers who prefer email or phone help
- Collection day tracking
- Secure online billing

---

## Tech Stack

- Next.js 16 with TypeScript (frontend + backend)
- Node.js 24
- MySQL 8.4
- Stripe (payments)

**Note**: Docker configuration is development-only. Production uses SiteHost's managed MySQL container.

---

## Prerequisites

- Node.js v24 or later
- npm v9 or later
- MySQL 8.4 for local container development (optional, see Development section)

## Production Deployment

This application is designed for deployment on SiteHost Cloud Containers:

- **Node.js**: v24 (managed by the SiteHost Nginx + NodeJS24 container)
- **MySQL**: v8.4 (provisioned through SiteHost control panel)
- **No Docker required** - SiteHost handles containerization

## Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/angelacollings/binrun.git
   cd binrun
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**

   ```bash
   npm run build
   npm run start
   ```

---

## Code Quality

- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Check formatting**: `npm run format:check`

---

## Project Status

🚧 In development

---

## Vision

Our goal is to make bin day hassle-free for everyone in Whangarei. We plan to expand to other regions.

---

## App Setup Guide

### Prerequisites

- Node.js 24.x
- npm 9.x or higher
- MySQL 8.4

---

### Local Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables by copying `.env.example` to `.env`
4. Start local development (database + app):

   ```bash
   npm run dev:local
   ```

### Environment Variables

- Store secrets in `.env`
- Keep `.env.example` with placeholder values only
- Server-only config is validated in `lib/env.ts`
- Do not expose secrets with `NEXT_PUBLIC_`; those values are bundled into browser JavaScript

Prisma 7 reads the database connection from `prisma.config.ts`, not from `prisma/schema.prisma`.

Current load order in `prisma.config.ts`:

1. Existing environment variables already provided by the shell or hosting platform
2. `.env`

In production, the recommended setup is to configure environment variables in the hosting platform instead of deploying `.env`.

Current validation behavior:

- `DATABASE_URL` is required before Prisma connects.
- Better Auth, Stripe, and email settings are validated when their subsystem reads them.
- Production rejects placeholder secret values.
- Build/startup rejects secret-like `NEXT_PUBLIC_` variable names.

Current requirement groups:

- Required now: `DATABASE_URL`
- Required when auth lands: `BETTER_AUTH_SECRET`
- Required for deployed auth behind SiteHost: `BETTER_AUTH_URL`
- Required when payments land: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and Stripe
  package price IDs
- Required when notifications land: `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

The env implementation has a JavaScript core (`lib/env.mjs`) plus typed TypeScript
wrapper (`lib/env.ts`) so direct Node scripts like `prisma/seed.mjs` can share the
same validation without adding a script transpilation step.

---

### Available Scripts

- `npm run dev` — Start development server only (localhost:3000)
- `npm run dev:local` — Start local MySQL, apply migrations, generate Prisma client, and run app
- `npm run build` — Generate Prisma Client and build for production
- `npm run start` — Start production server
- `npm run deploy:prepare` — Apply committed migrations, generate Prisma Client, and build for deployment
- `npm run lint` — Run ESLint checks
- `npm run db:up` — Start local MySQL container
- `npm run db:down` — Stop local MySQL container
- `npm run db:reset` — Recreate local MySQL volume from scratch
- `npm run db:migrate` — Create/apply development migrations
- `npm run db:deploy` — Apply committed migrations
- `npm run db:generate` — Generate Prisma client
- `npm run test:unit` — Run fast unit tests
- `npm run test:integration` — Run database-backed integration tests

### Local Database Reset And Seed

Use this flow when you need a clean local database with sample customers,
properties, bins, and subscriptions:

```bash
npm run db:reset
npm run db:deploy
npm run db:generate
npm run db:seed
npm run test:integration
```

The seed script is for local/test data only. It refuses to run in production and
refuses non-local database hosts by default.

---

### Project Structure

```
app/      # Next.js app router pages, layouts, and styles
docs/     # Product notes, architecture diagrams, and mockups
prisma/   # Prisma schema and future migrations
public/   # Static assets served by the app
docker-compose.yml  # Local MySQL service for development
```

---

### Notes

- This project uses Next.js with server-side rendering
- Local DB + app startup is automated via `npm run dev:local`
- Review the docs in `node_modules/next/dist/docs/` for API changes and deprecation notices
