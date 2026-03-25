-- Phase 04: Payment Transactions + Subscription Stripe fields
-- Additive only — no DROP statements

-- ─── Add Stripe fields to subscriptions ──────────────────────────────────────

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- ─── Payment transaction status & type enums ─────────────────────────────────

DO $$ BEGIN
  CREATE TYPE payment_transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_transaction_type AS ENUM ('subscription_create', 'subscription_renew', 'subscription_upgrade', 'subscription_downgrade', 'refund');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Payment transactions table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT UNIQUE,
  type payment_transaction_type NOT NULL DEFAULT 'subscription_create',
  status payment_transaction_status NOT NULL DEFAULT 'pending',
  amount INTEGER NOT NULL,            -- cents (USD)
  currency TEXT NOT NULL DEFAULT 'usd',
  plan subscription_plan NOT NULL,
  period TEXT NOT NULL,               -- 'monthly' | 'yearly'
  description TEXT,
  failure_reason TEXT,
  receipt_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- ─── RLS for payment_transactions ─────────────────────────────────────────────

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Owners can see their own payments (through subscriptions)
CREATE POLICY "payment_transactions_select_own" ON payment_transactions
  FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert/update (webhooks run server-side)
CREATE POLICY "payment_transactions_insert_service" ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "payment_transactions_update_service" ON payment_transactions
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- ─── Updated_at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
