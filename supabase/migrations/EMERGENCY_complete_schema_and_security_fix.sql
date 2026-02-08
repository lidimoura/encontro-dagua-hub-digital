-- ============================================================================
-- EMERGENCY FIX: Complete Database Schema Migration
-- ============================================================================
-- Purpose: Add missing columns and tables for Enterprise Agent Collaboration
-- Execute: Run this ONCE in Supabase SQL Editor
-- Date: 2026-02-07
-- ============================================================================

-- 1. ADD MISSING COLUMNS TO DEALS TABLE
-- ============================================================================

-- Add metadata column (JSONB for flexible data storage)
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add quote_details column (stores Precy calculations)
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS quote_details JSONB;

-- Add quote approval tracking
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS quote_approved_at TIMESTAMPTZ;

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS quote_approved_by UUID REFERENCES auth.users(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_metadata ON deals USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_deals_quote_details ON deals USING gin(quote_details);
CREATE INDEX IF NOT EXISTS idx_deals_quote_approved_at ON deals(quote_approved_at);

-- ============================================================================
-- 2. CREATE WEBHOOK_LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_webhook_logs_company_id ON webhook_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- Enable RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_logs
CREATE POLICY "Users can view own company webhook logs"
  ON webhook_logs FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can insert webhook logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 3. FIX CONTACTS TABLE RLS (CRITICAL SECURITY)
-- ============================================================================

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Users can view own company contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert own company contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own company contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own company contacts" ON contacts;

-- Recreate with strict company_id isolation
CREATE POLICY "Users can view own company contacts"
  ON contacts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company contacts"
  ON contacts FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company contacts"
  ON contacts FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company contacts"
  ON contacts FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 4. FIX DEALS TABLE RLS (ENSURE ISOLATION)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own company deals" ON deals;
DROP POLICY IF EXISTS "Users can insert own company deals" ON deals;
DROP POLICY IF EXISTS "Users can update own company deals" ON deals;
DROP POLICY IF EXISTS "Users can delete own company deals" ON deals;

-- Recreate with strict company_id isolation
CREATE POLICY "Users can view own company deals"
  ON deals FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company deals"
  ON deals FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company deals"
  ON deals FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company deals"
  ON deals FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 5. FIX PRODUCTS TABLE RLS (ENSURE ISOLATION)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own company products" ON products;
DROP POLICY IF EXISTS "Users can insert own company products" ON products;
DROP POLICY IF EXISTS "Users can update own company products" ON products;
DROP POLICY IF EXISTS "Users can delete own company products" ON products;

-- Recreate with strict company_id isolation
CREATE POLICY "Users can view own company products"
  ON products FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company products"
  ON products FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company products"
  ON products FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company products"
  ON products FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 6. ADD PRODUCTS METADATA COLUMN (FOR QUOTE-TO-PRODUCT)
-- ============================================================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_metadata ON products USING gin(metadata);

-- ============================================================================
-- 7. VERIFICATION QUERIES (RUN AFTER MIGRATION)
-- ============================================================================

-- Verify deals columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deals' 
  AND column_name IN ('metadata', 'quote_details', 'quote_approved_at', 'quote_approved_by')
ORDER BY column_name;

-- Verify webhook_logs table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'webhook_logs'
);

-- Verify RLS policies for contacts
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'contacts'
ORDER BY policyname;

-- Verify RLS policies for deals
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'deals'
ORDER BY policyname;

-- Verify RLS policies for products
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next Steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all queries return expected results
-- 3. Test frontend: Create deal, add contact, save product
-- 4. Verify data isolation: Login as different users, confirm no data leak
-- ============================================================================
