-- TapMenu Armenia — Initial Schema with RLS Policies
-- Run this in Supabase SQL Editor

-- =============================================
-- ENABLE UUID EXTENSION
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'superadmin')),
  avatar_url TEXT,
  is_email_verified BOOLEAN DEFAULT FALSE,
  must_change_password BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RESTAURANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'AM',
  phone TEXT,
  website TEXT,
  wifi_name TEXT,
  wifi_password_enc TEXT, -- AES-256 encrypted
  primary_color TEXT DEFAULT '#F59E0B',
  accent_color TEXT DEFAULT '#1F2937',
  template_id TEXT DEFAULT 'classic',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_user_id ON public.restaurants(user_id);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'premium', 'luxe')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'grace', 'blocked', 'cancelled')),
  is_yearly BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  grace_ends_at TIMESTAMPTZ,
  max_menus INTEGER DEFAULT 1,
  max_dishes INTEGER DEFAULT 30,
  max_languages INTEGER DEFAULT 2,
  max_nfc_tags INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DISHES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_translations JSONB,
  description TEXT,
  description_translations JSONB,
  price INTEGER NOT NULL, -- AMD
  image_url TEXT,
  image_url_md TEXT,
  image_url_sm TEXT,
  calories INTEGER,
  proteins FLOAT,
  fats FLOAT,
  carbohydrates FLOAT,
  weight INTEGER,
  spicy_level INTEGER DEFAULT 0 CHECK (spicy_level BETWEEN 0 AND 3),
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  allergens TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dishes_restaurant_id ON public.dishes(restaurant_id);
CREATE INDEX idx_dishes_status ON public.dishes(status);

-- =============================================
-- MENUS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  is_default BOOLEAN DEFAULT FALSE,
  languages TEXT[] DEFAULT '{ru}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menus_restaurant_id ON public.menus(restaurant_id);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_translations JSONB,
  emoji TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_menu_id ON public.categories(menu_id);

-- =============================================
-- MENU_DISHES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.menu_dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  sort_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  special_price INTEGER,
  UNIQUE(menu_id, dish_id)
);

CREATE INDEX idx_menu_dishes_menu_id ON public.menu_dishes(menu_id);
CREATE INDEX idx_menu_dishes_dish_id ON public.menu_dishes(dish_id);

-- =============================================
-- TABLES (NFC/QR)
-- =============================================
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nfc_tag_id TEXT UNIQUE,
  qr_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tables_restaurant_id ON public.tables(restaurant_id);

-- =============================================
-- MENU_VIEWS (Analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS public.menu_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID,
  lang TEXT DEFAULT 'ru',
  device TEXT,
  country TEXT,
  city TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_views_restaurant_id ON public.menu_views(restaurant_id);
CREATE INDEX idx_menu_views_viewed_at ON public.menu_views(viewed_at);

-- =============================================
-- EXCHANGE RATES
-- =============================================
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL DEFAULT 'AMD',
  rate FLOAT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Seed initial rates
INSERT INTO public.exchange_rates (from_currency, to_currency, rate) VALUES
  ('USD', 'AMD', 390),
  ('EUR', 'AMD', 420),
  ('RUB', 'AMD', 4.3),
  ('GBP', 'AMD', 490)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- =============================================
-- LEADS
-- =============================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  restaurant_name TEXT,
  message TEXT,
  source TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENT HISTORY
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id),
  amount FLOAT NOT NULL,
  currency TEXT DEFAULT 'USD',
  plan TEXT NOT NULL,
  period TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI CONVERSATIONS (LUXE)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- USERS: users can see/edit their own data; admins see all
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
  ));

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RESTAURANTS: owners see their own; admins see all
CREATE POLICY "Owners can manage their restaurants" ON public.restaurants
  FOR ALL USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
    )
  );

-- PUBLIC MENU ACCESS: anyone can view active restaurants
CREATE POLICY "Public can view active restaurants" ON public.restaurants
  FOR SELECT USING (is_active = TRUE);

-- SUBSCRIPTIONS: owners see their own
CREATE POLICY "Owners can view own subscription" ON public.subscriptions
  FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
    )
  );

-- DISHES: owners manage their dishes; public reads active ones
CREATE POLICY "Owners can manage their dishes" ON public.dishes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND (
        r.user_id = auth.uid() OR EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
        )
      )
    )
  );

CREATE POLICY "Public can view active dishes" ON public.dishes
  FOR SELECT USING (status = 'active');

-- MENUS: owners manage their menus
CREATE POLICY "Owners can manage their menus" ON public.menus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Public can view active menus" ON public.menus
  FOR SELECT USING (status = 'active');

-- CATEGORIES & MENU_DISHES: follow same pattern
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view menu dishes" ON public.menu_dishes FOR SELECT USING (is_available = TRUE);

-- MENU_VIEWS: anyone can insert (tracking); owners/admins can read
CREATE POLICY "Anyone can log menu views" ON public.menu_views
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Owners can view their menu analytics" ON public.menu_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND (
        r.user_id = auth.uid() OR EXISTS (
          SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
        )
      )
    )
  );

-- LEADS: anyone can insert; only admins read
CREATE POLICY "Anyone can submit leads" ON public.leads
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin'))
  );

-- EXCHANGE RATES: public read, cron updates via service key
ALTER TABLE public.exchange_rates DISABLE ROW LEVEL SECURITY; -- Public read for rates

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON public.dishes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create subscription when new user registers
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'starter', 'trial', NOW() + INTERVAL '7 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_user_create_subscription
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();
