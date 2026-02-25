-- ============================================================================
-- FIX VISIBILITY: Orphan Contacts & Super Admin Access
-- ============================================================================
-- Purpose:
-- 1. Assign 'company_id' to orphan contacts (based on owner_id)
-- 2. Restore global access for Super Admins (bypassing strict isolation)
-- 3. Ensure Demo User has correct access
-- ============================================================================

-- 1. FIX ORPHAN CONTACTS
-- Link contacts with NULL company_id to the company of their owner
UPDATE contacts c
SET company_id = p.company_id
FROM profiles p
WHERE c.owner_id = p.id
AND c.company_id IS NULL
AND p.company_id IS NOT NULL;

-- 2. ADD SUPER ADMIN POLICIES (Bypass strict isolation)

-- SELECT
DROP POLICY IF EXISTS "super_admin_select_all" ON contacts;
CREATE POLICY "super_admin_select_all"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- INSERT
DROP POLICY IF EXISTS "super_admin_insert_all" ON contacts;
CREATE POLICY "super_admin_insert_all"
  ON contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- UPDATE
DROP POLICY IF EXISTS "super_admin_update_all" ON contacts;
CREATE POLICY "super_admin_update_all"
  ON contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- DELETE
DROP POLICY IF EXISTS "super_admin_delete_all" ON contacts;
CREATE POLICY "super_admin_delete_all"
  ON contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- 3. ENSURE DEMO USER IS SUPER ADMIN (OPTIONAL - FOR DEMO ONLY)
-- Uncomment if you want to force the demo user to see everything
-- UPDATE profiles SET is_super_admin = true WHERE email = 'provadagua@hub.com';
