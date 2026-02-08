-- ============================================================================
-- RLS CLEANUP: Remove Duplicate and Conflicting Policies
-- ============================================================================
-- Purpose: Drop old/duplicate RLS policies that conflict with new schema
-- Execute: Run this AFTER the main emergency migration
-- Date: 2026-02-07
-- ============================================================================

-- ============================================================================
-- 1. CLEAN CONTACTS TABLE POLICIES
-- ============================================================================

-- Drop old policies (keep only "Users can view/insert/update/delete own company contacts")
DROP POLICY IF EXISTS "tenant_isolation" ON contacts;
DROP POLICY IF EXISTS "Individual insert access" ON contacts;
DROP POLICY IF EXISTS "Individual read access" ON contacts;
DROP POLICY IF EXISTS "Individual update access" ON contacts;
DROP POLICY IF EXISTS "Individual delete access" ON contacts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON contacts;

-- ============================================================================
-- 2. CLEAN DEALS TABLE POLICIES
-- ============================================================================

-- Drop old policies (keep only "Users can view/insert/update/delete own company deals")
DROP POLICY IF EXISTS "tenant_isolation" ON deals;
DROP POLICY IF EXISTS "Individual insert access" ON deals;
DROP POLICY IF EXISTS "Individual read access" ON deals;
DROP POLICY IF EXISTS "Individual update access" ON deals;
DROP POLICY IF EXISTS "Individual delete access" ON deals;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON deals;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON deals;

-- ============================================================================
-- 3. CLEAN PRODUCTS TABLE POLICIES
-- ============================================================================

-- Drop old policies (keep only "Users can view/insert/update/delete own company products")
DROP POLICY IF EXISTS "tenant_isolation" ON products;
DROP POLICY IF EXISTS "Ver meus produtos" ON products;
DROP POLICY IF EXISTS "Adicionar produtos" ON products;
DROP POLICY IF EXISTS "Atualizar meus produtos" ON products;
DROP POLICY IF EXISTS "Deletar meus produtos" ON products;
DROP POLICY IF EXISTS "Individual insert access" ON products;
DROP POLICY IF EXISTS "Individual read access" ON products;
DROP POLICY IF EXISTS "Individual update access" ON products;
DROP POLICY IF EXISTS "Individual delete access" ON products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;

-- ============================================================================
-- 4. CREATE NOTIFICATIONS TABLE (FOR BELL BUTTON)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lead', 'deal', 'task', 'system', 'webhook')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (
    user_id = auth.uid() OR
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- Verify contacts policies (should only show 4: view, insert, update, delete)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'contacts'
ORDER BY policyname;

-- Verify deals policies (should only show 4: view, insert, update, delete)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'deals'
ORDER BY policyname;

-- Verify products policies (should only show 4: view, insert, update, delete)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- Verify notifications table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'notifications'
);

-- ============================================================================
-- CLEANUP COMPLETE
-- ============================================================================
-- Expected Result:
-- - contacts: 4 policies (view, insert, update, delete own company)
-- - deals: 4 policies (view, insert, update, delete own company)
-- - products: 4 policies (view, insert, update, delete own company)
-- - notifications: 1 table with 4 policies (view, insert, update, delete)
-- ============================================================================
