-- ============================================================================
-- MIGRATION 060: NUCLEAR — KILL ALL RLS RECURSION (XX000 OOM FIX)
-- ============================================================================
-- DATE: 2026-05-13
--
-- ROOT CAUSE CONFIRMED:
--   PostgreSQL XX000 "Out of Memory" on INSERT/SELECT to contacts.
--   The OOM is caused by RECURSIVE RLS EVALUATION in the database:
--
--   1. Migration 999_concierge_mvp_admin.sql ADDED a policy on profiles:
--      "Admins can view all profiles" with:
--        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
--      This is profiles reading profiles = INFINITE RECURSION.
--
--   2. Migration 053 profiles_select also had a self-referencing subquery:
--        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid())
--      Inside a policy ON profiles. Same recursion.
--
--   3. When contacts_select fires, it reads profiles (for company_id check).
--      If profiles has RLS with a self-referencing subquery, the check on
--      profiles triggers profiles' own RLS → which reads profiles again → OOM.
--
--   Even though Migration 054 fixed profiles and 056 fixed contacts/deals/crm_companies,
--   the 999_concierge_mvp_admin.sql was run AFTER 054 and re-introduced the recursion.
--   Additionally, boards, board_stages, and activities still use
--   SELECT ... FROM profiles inside their RLS (from Migration 053).
--
-- SOLUTION:
--   This migration is TOTAL and DEFINITIVE. It:
--   1. NUKES every policy on ALL CRM tables (contacts, deals, boards,
--      board_stages, crm_companies, activities, profiles)
--   2. Recreates ALL policies using ONLY JWT claims — ZERO subqueries
--   3. Verifies no policy references public.profiles
--
-- GOLDEN RULE:
--   NO RLS POLICY ON ANY TABLE may contain:
--     SELECT ... FROM public.profiles
--   ALL access checks use:
--     company_id  = (auth.jwt() ->> 'company_id')::uuid
--     super_admin = (auth.jwt() ->> 'is_super_admin') = 'true'
--
-- EXECUTE: Supabase Dashboard > SQL Editor > New Query > Run ALL
-- ============================================================================

BEGIN;

-- ============================================================
-- STEP 0: NUKE EVERY POLICY ON ALL CRM TABLES
-- This is the only way to guarantee no zombie policies survive.
-- ============================================================

DO $$
DECLARE
  t TEXT;
  r RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'contacts', 'deals', 'boards', 'board_stages',
    'crm_companies', 'activities', 'profiles'
  ]
  LOOP
    FOR r IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
      RAISE NOTICE '[060] DROPPED policy "%" on "%"', r.policyname, t;
    END LOOP;
  END LOOP;
END $$;

RAISE NOTICE '[060] ═══════════════════════════════════════════════';
RAISE NOTICE '[060] ALL OLD POLICIES DESTROYED. Recreating with pure JWT...';
RAISE NOTICE '[060] ═══════════════════════════════════════════════';


-- ============================================================
-- STEP 1: PROFILES — The critical table. ZERO self-references.
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: own profile OR super_admin OR same company — ALL via JWT
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (
    id = auth.uid()
    OR (auth.jwt() ->> 'is_super_admin') = 'true'
    OR (
      company_id IS NOT NULL
      AND company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );

-- INSERT: only own profile or super_admin
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    id = auth.uid()
    OR (auth.jwt() ->> 'is_super_admin') = 'true'
  );

-- UPDATE: own profile or super_admin
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR (auth.jwt() ->> 'is_super_admin') = 'true'
  )
  WITH CHECK (
    id = auth.uid()
    OR (auth.jwt() ->> 'is_super_admin') = 'true'
  );

-- DELETE: super_admin only
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
  );


-- ============================================================
-- STEP 2: CONTACTS — Pure JWT, zero subqueries
-- ============================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select" ON public.contacts
  FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "contacts_insert" ON public.contacts
  FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "contacts_update" ON public.contacts
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  )
  WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "contacts_delete" ON public.contacts
  FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );


-- ============================================================
-- STEP 3: DEALS — Pure JWT
-- ============================================================
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select" ON public.deals
  FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "deals_insert" ON public.deals
  FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  )
  WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "deals_delete" ON public.deals
  FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );


-- ============================================================
-- STEP 4: BOARDS — Pure JWT
-- ============================================================
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boards_select" ON public.boards
  FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "boards_insert" ON public.boards
  FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "boards_update" ON public.boards
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  )
  WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "boards_delete" ON public.boards
  FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );


-- ============================================================
-- STEP 5: BOARD_STAGES — Pure JWT via board lookup
-- board_stages has no company_id, so we JOIN to boards.
-- This is safe: boards' RLS uses JWT (no profiles subquery),
-- and board_stages' policy doesn't read profiles either.
-- The chain is: board_stages → boards (JWT) → done.
-- ============================================================
ALTER TABLE public.board_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_stages_select" ON public.board_stages
  FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );

CREATE POLICY "board_stages_insert" ON public.board_stages
  FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );

CREATE POLICY "board_stages_update" ON public.board_stages
  FOR UPDATE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );

CREATE POLICY "board_stages_delete" ON public.board_stages
  FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (auth.jwt() ->> 'company_id')::uuid
    )
  );


-- ============================================================
-- STEP 6: CRM_COMPANIES — Pure JWT
-- ============================================================
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_companies_select" ON public.crm_companies
  FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "crm_companies_insert" ON public.crm_companies
  FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "crm_companies_update" ON public.crm_companies
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  )
  WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "crm_companies_delete" ON public.crm_companies
  FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );


-- ============================================================
-- STEP 7: ACTIVITIES — Pure JWT
-- ============================================================
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON public.activities
  FOR SELECT TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "activities_insert" ON public.activities
  FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "activities_update" ON public.activities
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  )
  WITH CHECK (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );

CREATE POLICY "activities_delete" ON public.activities
  FOR DELETE TO authenticated USING (
    (auth.jwt() ->> 'is_super_admin') = 'true'
    OR company_id = (auth.jwt() ->> 'company_id')::uuid
  );


-- ============================================================
-- STEP 8: Ensure auto_set_company_id trigger uses JWT-first
-- (re-applying from Migration 055 for safety)
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_set_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_jwt_company text;
BEGIN
  IF NEW.company_id IS NULL THEN
    -- PRIMARY: Read from JWT claim (zero query, zero loop risk)
    v_jwt_company := auth.jwt() ->> 'company_id';
    IF v_jwt_company IS NOT NULL AND v_jwt_company != '' THEN
      BEGIN
        v_company_id := v_jwt_company::uuid;
      EXCEPTION WHEN others THEN
        v_company_id := NULL;
      END;
    END IF;

    -- FALLBACK: SECURITY DEFINER bypasses RLS, safe to read profiles
    IF v_company_id IS NULL THEN
      SELECT p.company_id INTO v_company_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
      LIMIT 1;
    END IF;

    NEW.company_id := v_company_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-apply triggers (idempotent)
DROP TRIGGER IF EXISTS auto_company_id ON public.contacts;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.crm_companies;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.deals;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.boards;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.activities;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();


COMMIT;


-- ============================================================
-- VERIFICATION (execute AFTER commit in Supabase SQL Editor)
-- ============================================================

-- 1. MUST return 0 rows — NO policy should reference profiles
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('contacts','deals','boards','board_stages','crm_companies','activities','profiles')
  AND (
    qual LIKE '%public.profiles%'
    OR with_check LIKE '%public.profiles%'
    OR qual LIKE '%FROM profiles%'
    OR with_check LIKE '%FROM profiles%'
  );

-- 2. Should show exactly 4 policies per CRM table + 4 for profiles = 28 total
SELECT tablename, count(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('contacts','deals','boards','board_stages','crm_companies','activities','profiles')
GROUP BY tablename
ORDER BY tablename;

-- 3. Quick sanity check — this query MUST NOT hang or OOM
-- SELECT id, name, email FROM public.contacts LIMIT 3;
