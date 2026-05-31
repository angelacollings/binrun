# Stripe Setup For BinRun

Use Stripe test mode first. Do not enter live keys into local `.env` or GitHub.

## Products And Prices

Create one Stripe product for each public BinRun package:

| BinRun package     | Stripe product                | Price type        |
| ------------------ | ----------------------------- | ----------------- |
| Regular Run        | `BinRun - Regular Run`        | Recurring monthly |
| Regular Run + Wash | `BinRun - Regular Run + Wash` | Recurring monthly |
| One-Off Clean      | `BinRun - One-Off Clean`      | One-time          |

Keep the custom package out of self-serve checkout for MVP. Quote it manually,
then add a Stripe invoice or hosted payment link if needed.

## Environment Variables

Add these to local `.env`, staging, and production with the correct test/live
values for that environment:

```txt
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_REGULAR_RUN=price_...
STRIPE_PRICE_REGULAR_RUN_PLUS_WASH=price_...
STRIPE_PRICE_ONE_OFF_CLEAN=price_...
```

Never use `NEXT_PUBLIC_` for Stripe secret keys or price IDs in this app. Checkout
will be started server-side from known price IDs.

## Webhook Endpoint

When the webhook route is implemented, register one endpoint per environment:

```txt
https://staging.binrun.co.nz/api/stripe/webhook
https://binrun.co.nz/api/stripe/webhook
```

Initial events to send:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

Copy the signing secret from each endpoint into that environment's
`STRIPE_WEBHOOK_SECRET`.

## Test Cards

Use Stripe's test cards in test mode:

- Successful card: `4242 4242 4242 4242`
- Any future expiry date
- Any three-digit CVC
- Any postal code

## Launch Checklist

- Test mode checkout works for each self-serve package.
- Success and cancel redirects return customers to BinRun.
- Webhook events update local `Subscription` status.
- Duplicate webhook events are ignored using `WebhookEvent.eventId`.
- Dashboard never shows raw Stripe IDs to customers.
- Live mode keys are added only after the test mode path is proven.
