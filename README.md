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
- Node.js
- PostgreSQL
- Stripe (payments)

---

## Prerequisites

- Node.js v18 or later
- npm v9 or later

---

## Getting Started

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

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 14+

---

### Local Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables by copying `.env.example` to `.env.local`
4. Set up the database:

   ```bash
   npm run db:migrate
   ```

---

### Available Scripts

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint checks
- `npm run test` — Run tests
- `npm run db:migrate` — Run database migrations

---

### Project Structure

```
src/
├── pages/           # Next.js page routes and API routes
├── lib/             # Shared utilities and helpers
├── components/      # Reusable React components
└── middleware.ts    # Request middleware
```

---

### Notes

- This project uses Next.js with server-side rendering
- Database migrations run automatically on `npm run dev`
- Review the docs in `node_modules/next/dist/docs/` for API changes and deprecation notices
