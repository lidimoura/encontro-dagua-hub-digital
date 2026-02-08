-- ============================================================================
-- NUCLEAR FIX: Obliterate ALL Contacts RLS Policies & Recreate Clean
-- ============================================================================
-- Purpose: Drop EVERY policy on contacts table (by name and pattern)
--          Recreate SINGLE restrictive policy based on company_id
-- Execute: Run this ONCE in Supabase SQL Editor
-- Date: 2026-02-07
-- Critical: This is the FINAL fix for data leak
-- ============================================================================

-- ============================================================================
-- 1. DISABLE RLS TEMPORARILY (CRITICAL: DO NOT SKIP)
-- ============================================================================
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP ALL POLICIES BY NAME (KNOWN ZOMBIES)
-- ============================================================================

-- Drop all known policy names (old and new)
DROP POLICY IF EXISTS "tenant_isolation" ON contacts;
DROP POLICY IF EXISTS "Individual insert access" ON contacts;
DROP POLICY IF EXISTS "Individual read access" ON contacts;
DROP POLICY IF EXISTS "Individual update access" ON contacts;
DROP POLICY IF EXISTS "Individual delete access" ON contacts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Users can view own company contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert own company contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own company contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own company contacts" ON contacts;
DROP POLICY IF EXISTS "Ver meus contatos" ON contacts;
DROP POLICY IF EXISTS "Adicionar contatos" ON contacts;
DROP POLICY IF EXISTS "Atualizar meus contatos" ON contacts;
DROP POLICY IF EXISTS "Deletar meus contatos" ON contacts;
DROP POLICY IF EXISTS "Company isolation for contacts" ON contacts;
DROP POLICY IF EXISTS "Allow company members to view contacts" ON contacts;
DROP POLICY IF EXISTS "Allow company members to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow company members to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow company members to delete contacts" ON contacts;

-- ============================================================================
-- 3. NUCLEAR OPTION: Drop ALL remaining policies (pattern-based)
-- ============================================================================

-- This query generates DROP statements for ANY remaining policies
-- Execute the output of this query if needed:
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'contacts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON contacts', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- ============================================================================
-- 4. VERIFY ALL POLICIES ARE GONE
-- ============================================================================

-- This should return 0 rows
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'contacts';

-- ============================================================================
-- 5. RE-ENABLE RLS
-- ============================================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE SINGLE, RESTRICTIVE POLICY (COMPANY_ID ISOLATION)
-- ============================================================================

-- SELECT: Users can ONLY view contacts from their own company
CREATE POLICY "strict_company_isolation_select"
  ON contacts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- INSERT: Users can ONLY insert contacts for their own company
CREATE POLICY "strict_company_isolation_insert"
  ON contacts FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- UPDATE: Users can ONLY update contacts from their own company
CREATE POLICY "strict_company_isolation_update"
  ON contacts FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- DELETE: Users can ONLY delete contacts from their own company
CREATE POLICY "strict_company_isolation_delete"
  ON contacts FOR DELETE
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- 7. FINAL VERIFICATION
-- ============================================================================

-- Should show EXACTLY 4 policies (select, insert, update, delete)
SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING clause present'
    ELSE 'No USING clause'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK clause present'
    ELSE 'No WITH CHECK clause'
  END as check_status
FROM pg_policies
WHERE tablename = 'contacts'
ORDER BY cmd;

-- Expected output:
-- strict_company_isolation_delete  | DELETE | USING clause present | No WITH CHECK clause
-- strict_company_isolation_insert  | INSERT | No USING clause      | WITH CHECK clause present
-- strict_company_isolation_select  | SELECT | USING clause present | No WITH CHECK clause
-- strict_company_isolation_update  | UPDATE | USING clause present | WITH CHECK clause present

-- ============================================================================
-- 8. TEST QUERY (RUN AS DEMO USER)
-- ============================================================================

-- After running this script, login as provadagua and run:
-- SELECT id, name, email, company_id FROM contacts;
-- 
-- Expected: Should ONLY see contacts where company_id matches provadagua's company
-- Should NOT see Gislaine or Nina (admin's contacts)

-- ============================================================================
-- NUCLEAR FIX COMPLETE
-- ============================================================================
-- Next Steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify final verification query shows exactly 4 policies
-- 3. Login as provadagua (Demo user)
-- 4. Verify Gislaine and Nina are NOT visible
-- 5. Verify only Demo company contacts are visible
-- ============================================================================
