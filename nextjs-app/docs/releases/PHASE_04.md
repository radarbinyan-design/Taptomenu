# Phase 04 — Payments & Subscription Billing

> Completed: 2026-03-24
> Branch: `genspark_ai_developer`
> Feature Flag: `FF_PAYMENTS`

---

## Summary

Phase 04 implements the full payment and subscription billing system for TapMenu Armenia. It integrates Stripe for payment processing, adds a subscription lifecycle management system (Trial > Active > Grace > Blocked > Cancelled), plan enforcement middleware to check quotas on CRUD operations, and a full billing dashboard for restaurant owners.

---

## New Files

| File | Description |
|---|---|
| `src/lib/stripe.ts` | Stripe SDK wrapper: checkout sessions, portal sessions, customer management, webhook constructors |
| `src/lib/plan-enforcement.ts` | Server-side plan limit enforcement: checks quotas for menus/dishes/languages/NFC, subscription status validation, usage summary |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook handler: checkout completed, invoice paid/failed, subscription updated/deleted |
| `src/app/api/subscriptions/route.ts` | GET subscription + usage + history, PATCH cancel/resume |
| `src/app/api/subscriptions/checkout/route.ts` | POST create Stripe checkout session or demo plan switch |
| `src/app/api/subscriptions/portal/route.ts` | POST create Stripe customer portal session |
| `src/app/dashboard/billing/page.tsx` | Full billing dashboard: current plan, usage bars, plan comparison grid, payment history, feature availability |
| `supabase/migrations/0004_payment_transactions.sql` | Migration: add Stripe columns to subscriptions, create payment_transactions table with RLS |

## Modified Files

| File | Changes |
|---|---|
| `prisma/schema.prisma` | Added `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `cancelAtPeriodEnd` to Subscription; added `PaymentTransaction` model with enums |
| `src/types/index.ts` | Added `PaymentTransaction`, `PaymentTransactionStatus`, `PaymentTransactionType`, `SubscriptionWithStripe`, `UsageSummary` types |
| `src/lib/validators.ts` | Added `CheckoutCreateSchema`, `SubscriptionActionSchema`, `PaymentTransactionFilterSchema` |
| `src/hooks/index.ts` | Added `useSubscription` hook with checkout, cancel, resume, openPortal methods |
| `src/app/dashboard/layout.tsx` | Added Billing nav item (`CreditCard` icon) for all roles |
| `src/app/dashboard/settings/page.tsx` | Subscription tab now links to `/dashboard/billing` instead of inline plan cards |
| `src/middleware.ts` | Added `/dashboard/billing` to `RESTAURANT_ADMIN_ALLOWED` routes |
| `docs/FEATURE_FLAGS.md` | Updated version to Phase 04 |

---

## Architecture Decisions

### 1. Stripe Integration Pattern
- **Lazy SDK init**: `getStripe()` creates Stripe instance on first call, avoids client-side bundle
- **Price ID mapping**: Stripe price IDs configured via env vars, with fallback mock IDs for demo mode
- **Webhook-first**: All subscription state changes flow through webhooks, ensuring server is source of truth
- **Customer portal**: Uses Stripe's hosted portal for payment method/invoice management

### 2. Subscription Lifecycle
```
Trial (14d) ──> Active ──> Grace (7d) ──> Blocked
                  │           ↑ (payment retry)
                  │           │
                  └── Cancel at period end ──> Cancelled ──> Starter (downgrade)
```

### 3. Demo-First Pattern (continued)
- All API routes work without Stripe configured
- Checkout in demo mode: immediately switches plan in DB, records a demo transaction
- Billing page shows demo data when subscription API returns 404
- No breaking changes to existing flows

### 4. Plan Enforcement
- `enforcePlanLimit(userId, resource)` — checks subscription status + resource count vs plan limit
- `checkSubscriptionStatus(userId)` — validates trial/grace expiry, auto-blocks expired subscriptions
- Can be called from any API route before allowing creation of new resources
- Returns structured error with `current`, `max`, and `plan` info for client display

### 5. Payment Transactions
- Immutable audit log of all payment events
- Tracks: amount, currency, plan, period, type (create/renew/upgrade/downgrade/refund)
- Links to Stripe payment intent and invoice IDs for reconciliation
- RLS: owners see their own transactions, only service role can insert/update

---

## API Inventory Update

| Endpoint | Method | Description | Phase |
|---|---|---|---|
| `/api/subscriptions` | GET | Current subscription + usage + transaction history | 04 |
| `/api/subscriptions` | PATCH | Cancel or resume subscription | 04 |
| `/api/subscriptions/checkout` | POST | Create Stripe checkout session or demo plan switch | 04 |
| `/api/subscriptions/portal` | POST | Create Stripe customer portal session | 04 |
| `/api/webhooks/stripe` | POST | Stripe webhook event processor | 04 |

**Total active API endpoints: 25** (20 from Phase 02 + 5 new)

---

## Environment Variables (new)

```env
# Stripe (required for real payments, optional for demo)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=https://app.tapmenu.am

# Stripe Price IDs (from Stripe Dashboard > Products)
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...
STRIPE_PRICE_LUXE_MONTHLY=price_...
STRIPE_PRICE_LUXE_YEARLY=price_...
```

---

## Verification Steps

1. **Run `npm run dev`** — no TypeScript errors, no build warnings
2. **Navigate to `/dashboard/billing`** — billing page renders with demo data
3. **Current plan card** — shows Pro plan, usage bars, status badge
4. **Plan comparison** — 4 plans with monthly/yearly toggle and -20% badge
5. **Payment history** — shows 3 demo transactions with expand/collapse
6. **Features grid** — correctly marks enabled/disabled features per plan
7. **Settings > Subscription tab** — now links to `/dashboard/billing`
8. **Sidebar** — shows new "Billing" nav item with CreditCard icon
9. **Plan checkout (demo)** — clicking "Upgrade" changes plan immediately, records demo transaction
10. **Cancel/Resume** — buttons toggle cancelAtPeriodEnd state

### With Stripe configured:
11. **Checkout** — redirects to Stripe Checkout hosted page
12. **Webhooks** — `checkout.session.completed` activates subscription
13. **Invoice** — `invoice.paid` renews, `invoice.payment_failed` enters grace
14. **Portal** — opens Stripe Customer Portal in new tab
15. **Subscription deletion** — downgrades to Starter plan limits

---

## Rollback

1. Revert the commit (all changes are additive)
2. Supabase migration is additive (`ADD COLUMN`, `CREATE TABLE`) — no data loss
3. Stripe webhook URL can be disabled in Stripe Dashboard
4. Feature flag `FF_PAYMENTS` defaults to `false` — toggle off for full disable

---

## Next Phase

**Phase 05 — POS Integration**
- POS adapter interface (abstract pattern)
- iiko adapter integration
- R-Keeper adapter integration
- Real-time order push to POS
- Menu sync from POS
