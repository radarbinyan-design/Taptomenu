-- Migration: 0003_orders_tables.sql
-- Phase 01: Guest Ordering tables
-- Additive only — no existing tables modified

-- Order status enum
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  guest_name VARCHAR(255),
  guest_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Auto-update trigger for orders.updated_at
CREATE OR REPLACE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Orders policies: restaurant owners can read their own orders
CREATE POLICY orders_select_owner ON orders
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Guests (anon) can insert orders
CREATE POLICY orders_insert_anon ON orders
  FOR INSERT WITH CHECK (true);

-- Order items follow order access
CREATE POLICY order_items_select_owner ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY order_items_insert_anon ON order_items
  FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE orders IS 'Guest orders placed through digital menu';
COMMENT ON TABLE order_items IS 'Individual dishes in a guest order';
COMMENT ON COLUMN orders.total_amount IS 'Total price in AMD at time of order';
COMMENT ON COLUMN order_items.price IS 'Dish price in AMD, snapshot at order time';
