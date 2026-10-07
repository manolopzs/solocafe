# Solo Cafe

Pickup-only ordering platform for independent coffee shops. Stage 1 MVP: white-label web ordering, Stripe Connect payments, and a tablet-friendly kitchen display system.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Realtime)
- Stripe Connect
- Jest

## Setup

1. Copy `.env.example` to `.env.local` and fill in real credentials.
2. Create a Supabase project and run the migrations in `supabase/migrations/` in order.
3. Create a Stripe account and configure Connect.
4. Set the Stripe webhook endpoint to `https://your-domain.com/api/webhooks/stripe` and select `payment_intent.succeeded`, `payment_intent.payment_failed`, and `account.updated`.
5. Install dependencies:

```bash
npm install
```

6. Run locally:

```bash
npm run dev
```

## Database migrations

Apply with the Supabase CLI or SQL Editor in order:

```bash
npx supabase db push
```

Or run manually:

1. `supabase/migrations/00000000000000_initial_schema.sql`
2. `supabase/migrations/00000000000001_create_order_function.sql`

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Important notes

- The app uses Supabase Auth magic links. Configure the Site URL and redirect URLs in Supabase Auth settings.
- Stripe Connect Express accounts are created per shop. The platform fee is configurable via `PLATFORM_FEE_PERCENT` and is 0% by default in Stage 1.
- SaaS billing tiers are defined in `subscription_tiers`. Shops are assigned the Free tier on creation. Automated Stripe Billing for paid tiers is not yet implemented.
- Customer ready notifications insert a row into `notifications` but do not yet send SMS or email. Integrate Twilio or a similar provider to complete the loop.
- Offline resilience for the KDS is not yet implemented.
