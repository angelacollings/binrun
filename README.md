# BinRun

**Bin day? Sorted.**

BinRun is an in-development full-stack application for a subscription-based wheelie bin management service in Whangarei, New Zealand. It is designed to help households, landlords, and property managers arrange regular bin set-out and return, with optional bin cleaning.

BinRun manages the service around council collection; it is not a waste collection provider.

## Project status

BinRun is an active portfolio and product-development project. The repository demonstrates the core customer, operational, and data-management workflows, but it is not yet a complete production subscription platform.

## Application preview

The screenshots below use fictional local seed data.

<img src="./docs/screenshots/landing-page.png" alt="BinRun landing page showing its service proposition, packages, and signup calls to action" width="900">

<table>
  <tr>
    <td width="50%">
      <img src="./docs/screenshots/customer-dashboard.png" alt="BinRun customer dashboard showing service summaries and property management">
    </td>
    <td width="50%">
      <img src="./docs/screenshots/admin-run-board.png" alt="BinRun administrator run board showing scheduled service visits and status controls">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Customer property dashboard</strong></td>
    <td align="center"><strong>Administrator service run board</strong></td>
  </tr>
</table>

### Implemented

- Email and password registration and sign-in
- Argon2 password hashing and database-backed sessions through Better Auth
- Customer, worker, and administrator roles with protected routes
- Package selection during customer signup
- Customer property creation, editing, and soft deactivation
- Ownership-protected property and bin APIs
- Customer dashboard summaries for properties, services, bins, subscriptions, and upcoming visits
- Worker and administrator run boards with controlled service-visit status transitions
- Service packages, properties, bins, collection schedules, subscriptions, and visits in the Prisma data model
- Local MySQL development with committed migrations and guarded sample seed data
- Unit and database-backed integration tests
- GitHub Actions checks for linting, type safety, tests, migrations, seeding, and production builds
- Standalone Next.js deployment configuration

### Partially implemented

- **Subscriptions:** the schema and dashboard status views exist, but checkout, billing management, and provider synchronization do not.
- **Bin management:** the API and data model exist, but customers do not yet have a bin-management screen.
- **Collection scheduling:** service areas, schedules, and visits are modelled and displayed, but production visit generation is not automated.
- **Administration:** workers and administrators can update service visits, but broader customer, package, and schedule administration is still planned.
- **Accessibility:** semantic forms and basic smoke coverage are present; automated accessibility checks and a documented manual review are outstanding.

### Planned

- Stripe checkout, webhooks, billing portal, and subscription lifecycle management
- Password recovery and email verification
- Email notifications
- Customer-facing bin and package management
- Automated generation of service visits from collection schedules
- Expanded administration and operational reporting

## Service packages

The current product model supports:

- **Regular Run** — weekly bin set-out and return
- **Regular Run + Wash** — regular service with scheduled bin cleaning
- **One-Off Clean** — a single cleaning visit without a subscription
- **Custom Package** — tailored service for multiple properties, rental blocks, body corporates, or larger sites

Package selection currently creates a pending property service. It does not take payment.

## Architecture

BinRun uses the Next.js App Router as a full-stack application:

```text
Next.js pages and forms
├── Server Actions
├── Route Handlers
└── Better Auth routes
        │
Domain services and Zod validation
├── Authentication and role checks
├── Properties and bins
├── Customer dashboard
└── Service operations
        │
Prisma Client with MariaDB adapter
        │
MySQL 8.4
```

The main application boundaries are:

- `app/` — App Router pages, server actions, API routes, and styles
- `lib/` — authentication, validation, domain services, environment handling, and Prisma access
- `prisma/` — schema, migrations, and guarded local seed data
- `tests/` — Vitest unit/integration tests and Playwright browser smoke tests
- `docs/` — architecture, security, accessibility, deployment, and product documentation

`PropertyService` represents the package purchased for a property. `Bin` separately represents the physical bin inventory used by operational visits. This keeps the commercial service definition separate from day-to-day service execution.

## Technology stack

- Next.js 16 and React 19
- TypeScript 5 with strict mode
- Node.js 24
- MySQL 8.4
- Prisma 7 with the MariaDB driver adapter
- Better Auth and Argon2
- Zod validation
- Vitest and Playwright
- ESLint and Prettier
- Docker Compose for local MySQL
- GitHub Actions for continuous integration

Stripe and SMTP configuration are represented in the environment layer for planned payment and notification work; those integrations are not currently active application features.

## Security and authorization

Current safeguards include:

- Server-side session and role checks for customer, worker, and administrator routes
- Resource-ownership checks for customer property and bin operations
- Argon2 password hashing
- Short-lived database-backed sessions
- Better Auth rate limiting plus a supplemental per-process login/signup throttle
- Server-side Zod validation
- Production environment validation and rejection of placeholder secrets
- Rejection of secret-like `NEXT_PUBLIC_` environment variable names
- Security response headers
- Seed protection that refuses production and non-local database targets

The in-memory supplemental throttle is an MVP control for a single application process, not a distributed rate limiter. See [`docs/security.md`](./docs/security.md) for the current security checklist and known follow-up work.

## Local development

### Prerequisites

- Node.js 24.x
- npm 11 or a version compatible with the committed lockfile
- Docker with Docker Compose

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/angelacollings/binrun.git
   cd binrun
   ```

2. Install the locked dependencies:

   ```bash
   npm ci
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

4. Set `DATABASE_URL` in `.env` for the MySQL service in `docker-compose.yml`:

   ```text
   DATABASE_URL=mysql://binrun:binrun-local@127.0.0.1:3306/binrun
   ```

   The remaining values in `.env.example` are safe placeholders. Local authentication can use the development defaults in `lib/env.mjs`; production requires explicit Better Auth configuration.

5. Start MySQL, apply committed migrations, generate Prisma Client, and start Next.js:

   ```bash
   npm run dev:local
   ```

6. Open [http://localhost:3000](http://localhost:3000).

### Optional sample data

The seed creates fictional customers, properties, service packages, visits, and staff roles for local development. It deletes and recreates its known sample users, so only run it against a disposable local database.

```bash
npm run db:seed
```

The seed script refuses to run when `NODE_ENV=production` or when `DATABASE_URL` targets a non-local host.

## Environment variables

Real credentials belong in an ignored `.env` file for local development or in the deployment platform's secret configuration. Never commit real values or expose server secrets with `NEXT_PUBLIC_`.

| Variable                                               | Current use                           | Required        |
| ------------------------------------------------------ | ------------------------------------- | --------------- |
| `DATABASE_URL`                                         | Prisma/MySQL connection               | Yes             |
| `BETTER_AUTH_SECRET`                                   | Session and authentication signing    | Production auth |
| `BETTER_AUTH_URL`                                      | Canonical Better Auth application URL | Production auth |
| `STRIPE_SECRET_KEY`                                    | Planned Stripe server client          | Not yet         |
| `STRIPE_WEBHOOK_SECRET`                                | Planned webhook verification          | Not yet         |
| `STRIPE_PRICE_*`                                       | Planned package-to-price mapping      | Not yet         |
| `EMAIL_FROM`                                           | Planned notification sender           | Not yet         |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Planned SMTP delivery                 | Not yet         |

Prisma 7 reads the database URL through `prisma.config.ts`. Environment validation is shared between TypeScript application code and direct Node scripts through `lib/env.mjs` and its typed `lib/env.ts` wrapper.

## Available commands

| Command                             | Purpose                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`                       | Start Next.js using an already configured database environment                  |
| `npm run dev:local`                 | Start local MySQL, deploy migrations, generate Prisma Client, and start Next.js |
| `npm run build`                     | Generate Prisma Client and create a production build                            |
| `npm start`                         | Start the standalone production server after a build                            |
| `npm run lint`                      | Run ESLint                                                                      |
| `npm run format:check`              | Check Prettier formatting                                                       |
| `npx tsc --noEmit`                  | Run TypeScript type checking                                                    |
| `npm run test:unit`                 | Run unit tests                                                                  |
| `npm run test:integration`          | Run database-backed integration tests                                           |
| `npm run test:e2e`                  | Run Playwright browser tests                                                    |
| `npm run db:up` / `npm run db:down` | Start or stop local MySQL                                                       |
| `npm run db:deploy`                 | Apply committed migrations                                                      |
| `npm run db:seed`                   | Load guarded fictional local data                                               |

Integration tests and seed commands read and write the configured database. Use a dedicated local/test database, never a production database.

## Testing and continuous integration

The test suite currently covers:

- Environment validation
- Role and callback-route helpers
- Authentication throttling
- Property validation, ownership, updates, and soft deactivation
- Bin validation, ownership, uniqueness, updates, and removal
- Seed-data structure and Better Auth sign-in
- Public login, registration, pricing, and homepage browser smoke tests

GitHub Actions provisions MySQL 8.4, applies migrations, generates Prisma Client, seeds test data, and runs linting, TypeScript, unit tests, database-backed integration tests, Playwright browser smoke tests, and a production build.

## Documentation

- [Documentation index](./docs/README.md)
- [Project vision](./docs/vision.md)
- [Data model](./docs/diagrams/data-model.md)
- [Security baseline](./docs/security.md)
- [Accessibility and UX baseline](./docs/accessibility.md)
- [Deployment runbook](./docs/deployment/sitehost.md)

## Roadmap

The next portfolio-focused priorities are:

1. Keep documentation synchronized with the implemented routes and workflows.
2. Define how property deactivation interacts with active services and future billing.
3. Add integration coverage for signup, service creation, and visit transitions.
4. Add representative screenshots using fictional seed data.
5. Expand authenticated browser coverage for the customer and operations workflows.

Payment, notification, and broader product workflows will follow as product development continues; they are not required to understand or run the current application.

## License

This project is licensed under the terms in [`LICENSE`](./LICENSE).
