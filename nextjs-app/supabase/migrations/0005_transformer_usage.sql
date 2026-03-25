-- Phase 03: Transformer Usage tracking table
-- Additive only — no DROP statements

CREATE TABLE IF NOT EXISTS transformer_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- 'translation' | 'description' | 'image'
  provider TEXT NOT NULL,          -- 'deepl' | 'google' | 'openai' | 'dalle' | 'demo'
  tokens_used INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transformer_usage_restaurant_id ON transformer_usage(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_transformer_usage_type ON transformer_usage(type);
CREATE INDEX IF NOT EXISTS idx_transformer_usage_created_at ON transformer_usage(created_at);

-- RLS
ALTER TABLE transformer_usage ENABLE ROW LEVEL SECURITY;

-- Owners can see their own usage
CREATE POLICY "transformer_usage_select_own" ON transformer_usage
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Service role can insert (API routes run server-side)
CREATE POLICY "transformer_usage_insert_service" ON transformer_usage
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
