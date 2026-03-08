-- ============================================================
-- TapMenu Armenia v2.0
-- Migration: 0002_leads_table
-- Description: Create leads table for contact form submissions
-- ============================================================

-- Create table (idempotent)
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy 1: anyone can INSERT (public contact form)
CREATE POLICY IF NOT EXISTS "leads_insert_public"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: only admins/superadmins can SELECT
CREATE POLICY IF NOT EXISTS "leads_select_admin"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
  );

-- Policy 3: only admins/superadmins can UPDATE (change status)
CREATE POLICY IF NOT EXISTS "leads_update_admin"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (true);

-- Policy 4: only superadmins can DELETE
CREATE POLICY IF NOT EXISTS "leads_delete_superadmin"
  ON leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'superadmin'
    )
  );

-- ============================================================
-- Status constraint (valid values)
-- ============================================================

ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'converted', 'rejected'));

-- ============================================================
-- Plan constraint (valid values)
-- ============================================================

ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_plan_check;

ALTER TABLE leads
  ADD CONSTRAINT leads_plan_check
  CHECK (plan IN ('starter', 'pro', 'premium', 'luxe'));

-- ============================================================
-- Comments (documentation in DB)
-- ============================================================

COMMENT ON TABLE  leads IS 'Contact form submissions from landing page /contact';
COMMENT ON COLUMN leads.id              IS 'UUID primary key';
COMMENT ON COLUMN leads.name            IS 'Contact person full name';
COMMENT ON COLUMN leads.restaurant_name IS 'Restaurant or business name';
COMMENT ON COLUMN leads.email           IS 'Email or phone (combined field)';
COMMENT ON COLUMN leads.phone           IS 'Phone number (optional)';
COMMENT ON COLUMN leads.plan            IS 'Interested plan: starter | pro | premium | luxe';
COMMENT ON COLUMN leads.message         IS 'Free-form message from the form';
COMMENT ON COLUMN leads.status          IS 'CRM status: new | contacted | converted | rejected';
COMMENT ON COLUMN leads.created_at      IS 'Submission timestamp (Yerevan time stored as UTC)';
