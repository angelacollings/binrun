# Security Baseline

This checklist keeps launch security visible as BinRun moves from scaffold to MVP.
Update it whenever a feature adds a new route, API, integration, secret, or admin surface.

## Current Baseline

- [x] Local secrets are ignored with `.env*`; `.env.example` keeps placeholders only.
- [x] Server-side environment validation is centralized in `lib/env.ts`.
- [x] Secret-like `NEXT_PUBLIC_` environment variable names are rejected at startup/build.
- [x] Prisma uses a server-only MariaDB adapter and requires `DATABASE_URL` before database access.
- [x] Better Auth manages auth routes, credential verification, cookie-backed sessions, and session revocation.
- [x] Database health checks return a generic public error message.
- [x] Seed data refuses to run in `NODE_ENV=production`.
- [x] Seed data refuses non-local database hosts by default.
- [x] Global response headers set `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- [x] Login and signup apply Better Auth rate limits plus a basic per-IP/per-email server-action throttle for MVP abuse resistance.
- [ ] Content Security Policy is defined after the first interactive pages and script/style requirements are known.

## Route And API Strategy

| Surface            | Current status           | Required security strategy                                                                 |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------ |
| `/`                | Public launch page       | No customer data or secrets.                                                               |
| `/api/health/db`   | Public operational check | Generic errors only; no connection details or query output.                                |
| `/login`           | Public auth form         | Safe credential errors only; Better Auth sign-in plus per-IP/per-email throttling.         |
| `/register`        | Public signup form       | Reject duplicate emails safely; create Better Auth credential accounts; throttle attempts. |
| Customer dashboard | Not built                | Require authenticated session; query by session user only.                                 |
| Properties API     | Not built                | Validate input server-side; create/read/update/delete only records owned by session user.  |
| Bin selection API  | Not built                | Validate bin type and collection day server-side; enforce property ownership.              |
| Subscription API   | Not built                | Never trust client price, customer ID, subscription ID, or status.                         |
| Stripe checkout    | Not built                | Create sessions server-side from known price IDs and session user.                         |
| Stripe webhook     | Not built                | Verify Stripe signature before parsing business intent; make event handling idempotent.    |
| Admin dashboard    | Not built                | Require explicit admin role and keep customer/admin authorization paths separate.          |

## Feature Checklist

- [ ] Authentication is required for every customer/admin route that handles private data.
- [ ] Authorization checks use the authenticated session, not client-provided user IDs.
- [ ] Ownership checks are applied before returning or mutating customer records.
- [ ] Inputs are validated on the server and rejected with clear, non-sensitive errors.
- [ ] Outputs do not expose secrets, raw database errors, stack traces, or internal IDs unnecessarily.
- [ ] Mutations are protected against duplicate submission where repeated requests could cause harm.
- [ ] New secrets are documented in `.env.example` with placeholder values only.
- [ ] Browser-exposed environment variables use `NEXT_PUBLIC_` only when they are intentionally public.
- [ ] New subsystems read config through `lib/env.ts` instead of direct `process.env` access.
- [ ] If a script runner such as `tsx` is adopted, consider collapsing `lib/env.mjs` and `lib/env.ts` into one TypeScript source.
- [ ] Logs are useful for operations but avoid passwords, tokens, full webhook payloads, and personal notes.
- [ ] Payment and webhook code has explicit tests for signature, idempotency, and invalid-state handling.

## Auth Throttling

Better Auth rate limits are enabled in `auth.ts` for auth endpoints.
The MVP supplemental auth throttle is implemented in `lib/auth/throttle.ts` and enforced by the login and signup server actions.
It allows five attempts per IP/email/action for a 15-minute window in each Node.js process.

This is a baseline control, not a complete distributed rate limiter. Before scaling beyond a single app process, replace or back it with shared infrastructure such as Redis, a managed edge/WAF rule, or the hosting platform's request-rate controls.

## Pre-Launch Review

- [ ] Run through every public route while signed out.
- [ ] Run through every customer route as the owning customer.
- [ ] Attempt to access another customer's records by changing IDs in routes or request bodies.
- [ ] Confirm admin pages reject non-admin users.
- [ ] Confirm production env vars are set in SiteHost and real values are not committed.
- [ ] Confirm Stripe webhook endpoint rejects missing or invalid signatures.
- [ ] Confirm error responses stay generic in production.
- [ ] Confirm deployment logs do not print secret values.
