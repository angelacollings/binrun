# Security Baseline

This checklist keeps launch security visible as BinRun moves from scaffold to MVP.
Update it whenever a feature adds a new route, API, integration, secret, or admin surface.

## Current Baseline

- [x] Local secrets are ignored with `.env*`; `.env.example` keeps placeholders only.
- [x] Prisma uses a server-only MariaDB adapter and requires `DATABASE_URL` before database access.
- [x] Database health checks return a generic public error message.
- [x] Seed data refuses to run in `NODE_ENV=production`.
- [x] Seed data refuses non-local database hosts by default.
- [x] Global response headers set `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- [ ] Content Security Policy is defined after the first interactive pages and script/style requirements are known.

## Route And API Strategy

| Surface            | Current status           | Required security strategy                                                                |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| `/`                | Public launch page       | No customer data or secrets.                                                              |
| `/api/health/db`   | Public operational check | Generic errors only; no connection details or query output.                               |
| Customer dashboard | Not built                | Require authenticated session; query by session user only.                                |
| Properties API     | Not built                | Validate input server-side; create/read/update/delete only records owned by session user. |
| Bin selection API  | Not built                | Validate bin type and collection day server-side; enforce property ownership.             |
| Subscription API   | Not built                | Never trust client price, customer ID, subscription ID, or status.                        |
| Stripe checkout    | Not built                | Create sessions server-side from known price IDs and session user.                        |
| Stripe webhook     | Not built                | Verify Stripe signature before parsing business intent; make event handling idempotent.   |
| Admin dashboard    | Not built                | Require explicit admin role and keep customer/admin authorization paths separate.         |

## Feature Checklist

- [ ] Authentication is required for every customer/admin route that handles private data.
- [ ] Authorization checks use the authenticated session, not client-provided user IDs.
- [ ] Ownership checks are applied before returning or mutating customer records.
- [ ] Inputs are validated on the server and rejected with clear, non-sensitive errors.
- [ ] Outputs do not expose secrets, raw database errors, stack traces, or internal IDs unnecessarily.
- [ ] Mutations are protected against duplicate submission where repeated requests could cause harm.
- [ ] New secrets are documented in `.env.example` with placeholder values only.
- [ ] Browser-exposed environment variables use `NEXT_PUBLIC_` only when they are intentionally public.
- [ ] Logs are useful for operations but avoid passwords, tokens, full webhook payloads, and personal notes.
- [ ] Payment and webhook code has explicit tests for signature, idempotency, and invalid-state handling.

## Pre-Launch Review

- [ ] Run through every public route while signed out.
- [ ] Run through every customer route as the owning customer.
- [ ] Attempt to access another customer's records by changing IDs in routes or request bodies.
- [ ] Confirm admin pages reject non-admin users.
- [ ] Confirm production env vars are set in SiteHost and real values are not committed.
- [ ] Confirm Stripe webhook endpoint rejects missing or invalid signatures.
- [ ] Confirm error responses stay generic in production.
- [ ] Confirm deployment logs do not print secret values.
