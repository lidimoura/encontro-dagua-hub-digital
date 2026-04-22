-- ============================================================================
-- V9.7 HOTFIX: Fix RLS 403 on products + companies tables
-- ============================================================================
-- Execute ONCE in Supabase Dashboard > SQL Editor > New Query
-- Date: 2026-04-22
-- ============================================================================


-- ============================================================================
-- TABLE: products
-- ============================================================================
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON products', r.policyname);
  END LOOP;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- SELECT: see products of your company OR global (is_internal=true has no company_id)
CREATE POLICY "products_select"
  ON products FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL -- global/shared products visible to all
  );

-- INSERT: create products under your company_id
CREATE POLICY "products_insert"
  ON products FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL -- allow insert without company_id (internal tools)
  );

-- UPDATE: edit your company's products OR global products (super_admin)
CREATE POLICY "products_update"
  ON products FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

-- DELETE: delete your company's products OR global
CREATE POLICY "products_delete"
  ON products FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );


-- ============================================================================
-- TABLE: companies (CRM companies — distinct from user companies/tenants)
-- ============================================================================
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
  END LOOP;
END $$;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- SELECT: see CRM companies owned by your tenant
CREATE POLICY "companies_select"
  ON companies FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
    OR owner_id = auth.uid()
  );

-- INSERT: create CRM companies under your tenant
CREATE POLICY "companies_insert"
  ON companies FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

-- UPDATE: edit your tenant's CRM companies
CREATE POLICY "companies_update"
  ON companies FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR owner_id = auth.uid()
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

-- DELETE: delete your tenant's CRM companies
CREATE POLICY "companies_delete"
  ON companies FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR owner_id = auth.uid()
  );


-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('products', 'companies')
ORDER BY tablename, cmd;
-- Expected: 4 policies per table
