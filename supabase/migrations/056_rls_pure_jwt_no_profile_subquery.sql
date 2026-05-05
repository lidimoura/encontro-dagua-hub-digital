-- =============================================================================
-- MIGRATION 056: RLS PURE JWT — ZERO PROFILE SUBQUERIES
-- =============================================================================
-- Problem: Migration 053 still uses SELECT ... FROM public.profiles inside
--          RLS policies for contacts, deals and crm_companies.
--          This triggers cascading RLS evaluation → OOM on INSERT.
--
-- Solution: Read company_id and is_super_admin DIRECTLY from the JWT claims:
--   company_id    → (auth.jwt() ->> 'company_id')::uuid
--   is_super_admin → (auth.jwt() ->> 'is_super_admin')::boolean
--
-- These values are set by the Supabase Auth hook when the user signs in and
-- are always present in the JWT — no database round-trip required.
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: extract claims safely (avoids null-cast errors)
-- ─────────────────────────────────────────────────────────────────────────────
-- company_id  : (auth.jwt() ->> 'company_id')::uuid
-- super_admin : (auth.jwt() ->> 'is_super_admin') = 'true'
-- ─────────────────────────────────────────────────────────────────────────────

-- =============================================================================
-- TABLE: contacts
-- =============================================================================
DROP POLICY IF EXISTS "contacts_select"  ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert"  ON public.contacts;
DROP POLICY IF EXISTS "contacts_update"  ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete"  ON public.contacts;

CREATE POLICY "contacts_select" ON public.contacts
  FOR SELECT USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "contacts_insert" ON public.contacts
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "contacts_update" ON public.contacts
  FOR UPDATE USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "contacts_delete" ON public.contacts
  FOR DELETE USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

-- =============================================================================
-- TABLE: deals
-- =============================================================================
DROP POLICY IF EXISTS "deals_select"  ON public.deals;
DROP POLICY IF EXISTS "deals_insert"  ON public.deals;
DROP POLICY IF EXISTS "deals_update"  ON public.deals;
DROP POLICY IF EXISTS "deals_delete"  ON public.deals;

CREATE POLICY "deals_select" ON public.deals
  FOR SELECT USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "deals_insert" ON public.deals
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "deals_delete" ON public.deals
  FOR DELETE USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

-- =============================================================================
-- TABLE: crm_companies
-- =============================================================================
DROP POLICY IF EXISTS "crm_companies_select"  ON public.crm_companies;
DROP POLICY IF EXISTS "crm_companies_insert"  ON public.crm_companies;
DROP POLICY IF EXISTS "crm_companies_update"  ON public.crm_companies;
DROP POLICY IF EXISTS "crm_companies_delete"  ON public.crm_companies;

CREATE POLICY "crm_companies_select" ON public.crm_companies
  FOR SELECT USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "crm_companies_insert" ON public.crm_companies
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "crm_companies_update" ON public.crm_companies
  FOR UPDATE USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "crm_companies_delete" ON public.crm_companies
  FOR DELETE USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

-- =============================================================================
-- VERIFICATION AUDIT (run as comment — execute manually to confirm)
-- =============================================================================
-- SELECT tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('contacts','deals','crm_companies')
-- AND (qual LIKE '%profiles%' OR with_check LIKE '%profiles%');
-- → Must return 0 rows after this migration runs.
-- =============================================================================

COMMIT;
