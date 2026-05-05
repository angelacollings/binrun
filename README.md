# BinRun

**Bin day? Sorted.**

BinRun is a subscription-based service that takes your bins to the roadside and returns them after collection.

Designed for:

- Busy households
- Elderly or disabled individuals
- Rental property owners
- Airbnb hosts

---

## What We Do

We manage all common bin types in Whangarei:

- Council recycling bins
- Council prepaid rubbish bags
- Green wheelie bins (third-party providers)

BinRun handles the **movement of bins**, not the waste collection itself.

---

## Core Features (MVP)

- User accounts
- Subscription management
- Address/property management
- Bin type selection
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

Prisma 7 reads the database connection from `prisma.config.ts`, not from `prisma/schema.prisma`.

Current load order in `prisma.config.ts`:

1. Existing environment variables already provided by the shell or hosting platform
2. `.env`

In production, the recommended setup is to configure environment variables in the hosting platform instead of deploying `.env`.

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
