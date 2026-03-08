-- ============================================================
-- TapMenu Armenia v2.0 — Full Database Schema
-- Migration: 0001_initial_schema
-- Run in: Supabase SQL Editor or psql
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'admin', 'superadmin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('starter', 'pro', 'premium', 'luxe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'grace', 'blocked', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE dish_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE menu_status AS ENUM ('active', 'inactive', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                VARCHAR(255) NOT NULL UNIQUE,
  name                 VARCHAR(255) NOT NULL,
  phone                VARCHAR(50),
  role                 user_role NOT NULL DEFAULT 'owner',
  avatar_url           TEXT,
  is_email_verified    BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  last_login_at        TIMESTAMP WITH TIME ZONE,
  created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

-- ============================================================
-- RESTAURANTS
-- ============================================================

CREATE TABLE IF NOT EXISTS restaurants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  slug              VARCHAR(100) NOT NULL UNIQUE,
  description       TEXT,
  logo_url          TEXT,
  cover_url         TEXT,
  address           TEXT,
  city              VARCHAR(100),
  country           VARCHAR(10) NOT NULL DEFAULT 'AM',
  phone             VARCHAR(50),
  website           VARCHAR(255),
  wifi_name         VARCHAR(100),
  wifi_password_enc TEXT,                          -- AES-256 encrypted
  primary_color     VARCHAR(20) NOT NULL DEFAULT '#F59E0B',
  accent_color      VARCHAR(20) NOT NULL DEFAULT '#1F2937',
  template_id       VARCHAR(50) NOT NULL DEFAULT 'classic',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug    ON restaurants(slug);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan                subscription_plan NOT NULL DEFAULT 'starter',
  status              subscription_status NOT NULL DEFAULT 'trial',
  is_yearly           BOOLEAN NOT NULL DEFAULT false,
  trial_ends_at       TIMESTAMP WITH TIME ZONE,
  current_period_end  TIMESTAMP WITH TIME ZONE,
  grace_ends_at       TIMESTAMP WITH TIME ZONE,
  max_menus           INT NOT NULL DEFAULT 1,
  max_dishes          INT NOT NULL DEFAULT 30,
  max_languages       INT NOT NULL DEFAULT 2,
  max_nfc_tags        INT NOT NULL DEFAULT 1,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);

-- ============================================================
-- DISHES
-- ============================================================

CREATE TABLE IF NOT EXISTS dishes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id             UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name                      VARCHAR(255) NOT NULL,
  name_translations         JSONB,         -- {"en": "...", "hy": "...", "ar": "..."}
  description               TEXT,
  description_translations  JSONB,
  price                     INTEGER NOT NULL DEFAULT 0,  -- AMD (drams)
  image_url                 TEXT,          -- full 1200×900 WebP
  image_url_md              TEXT,          -- medium 800×600 WebP
  image_url_sm              TEXT,          -- thumb 300×200 WebP
  calories                  INTEGER,
  proteins                  NUMERIC(6,2),
  fats                      NUMERIC(6,2),
  carbohydrates             NUMERIC(6,2),
  weight                    INTEGER,       -- grams
  spicy_level               SMALLINT NOT NULL DEFAULT 0 CHECK (spicy_level BETWEEN 0 AND 3),
  is_vegan                  BOOLEAN NOT NULL DEFAULT false,
  is_gluten_free            BOOLEAN NOT NULL DEFAULT false,
  allergens                 TEXT[] NOT NULL DEFAULT '{}',
  tags                      TEXT[] NOT NULL DEFAULT '{}',
  status                    dish_status NOT NULL DEFAULT 'active',
  sort_order                INTEGER NOT NULL DEFAULT 0,
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_status        ON dishes(status);
CREATE INDEX IF NOT EXISTS idx_dishes_name_fts      ON dishes USING GIN (to_tsvector('simple', name));

-- ============================================================
-- MENUS
-- ============================================================

CREATE TABLE IF NOT EXISTS menus (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  status        menu_status NOT NULL DEFAULT 'draft',
  is_default    BOOLEAN NOT NULL DEFAULT false,
  languages     TEXT[] NOT NULL DEFAULT '{ru}',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_is_default    ON menus(is_default) WHERE is_default = true;

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id           UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  name_translations JSONB,
  emoji             VARCHAR(10),
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_menu_id ON categories(menu_id);

-- ============================================================
-- MENU_DISHES (pivot)
-- ============================================================

CREATE TABLE IF NOT EXISTS menu_dishes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id      UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  dish_id      UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  special_price INTEGER,                           -- override price in AMD

  UNIQUE (menu_id, dish_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_dishes_menu_id  ON menu_dishes(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_dishes_dish_id  ON menu_dishes(dish_id);

-- ============================================================
-- TABLES (NFC/QR столики)
-- ============================================================

CREATE TABLE IF NOT EXISTS tables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  nfc_tag_id    VARCHAR(100) UNIQUE,
  qr_code       TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON tables(restaurant_id);

-- ============================================================
-- MENU_VIEWS (analytics)
-- ============================================================

CREATE TABLE IF NOT EXISTS menu_views (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id      UUID REFERENCES tables(id) ON DELETE SET NULL,
  lang          VARCHAR(10) NOT NULL DEFAULT 'ru',
  device        VARCHAR(20),                       -- mobile | desktop | tablet
  country       VARCHAR(10),
  city          VARCHAR(100),
  viewed_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_views_restaurant_id ON menu_views(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_views_viewed_at     ON menu_views(viewed_at DESC);

-- ============================================================
-- EXCHANGE_RATES (CBA daily cron)
-- ============================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(10) NOT NULL,
  to_currency   VARCHAR(10) NOT NULL,
  rate          NUMERIC(14,6) NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE (from_currency, to_currency)
);

-- Seed initial rates (AMD base)
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
  ('AMD', 'USD', 0.002564),
  ('AMD', 'EUR', 0.002358),
  ('AMD', 'RUB', 0.232600),
  ('AMD', 'GBP', 0.002020)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- ============================================================
-- LEADS (contact form submissions)
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255),
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  plan            VARCHAR(50) NOT NULL DEFAULT 'pro',
  message         TEXT,
  status          VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);

-- ============================================================
-- AI_CONVERSATIONS (LUXE plan)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages      JSONB NOT NULL DEFAULT '[]',      -- [{role, content}]
  tokens_used   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_restaurant_id ON ai_conversations(restaurant_id);

-- ============================================================
-- PAYMENT_HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  amount          NUMERIC(10,2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
  plan            subscription_plan NOT NULL,
  period          VARCHAR(20) NOT NULL,            -- monthly | yearly
  status          VARCHAR(20) NOT NULL,            -- success | failed | refunded
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);

-- ============================================================
-- updated_at TRIGGER (auto-update on row change)
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','restaurants','subscriptions','dishes',
    'menus','categories','ai_conversations'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
       CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;
