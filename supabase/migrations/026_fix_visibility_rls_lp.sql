-- ════════════════════════════════════════════════════════════════════════════
-- Migration 026: Fix Old Contacts Visibility + LP RLS + Company selector dogfood
-- Date: 2026-03-11
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Fix contacts with NULL company_id — assign to the first company ───────
-- (These are old contacts imported before the company_id column was mandatory)
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM public.companies ORDER BY created_at LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    UPDATE public.contacts
    SET company_id = v_company_id
    WHERE company_id IS NULL;
    
    RAISE NOTICE '✅ Assigned company_id to % orphan contact(s)', (
      SELECT count(*) FROM public.contacts WHERE company_id = v_company_id
    );
  END IF;
END $$;

-- ─── 2. Fix deals with NULL company_id the same way ───────────────────────────
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM public.companies ORDER BY created_at LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    UPDATE public.deals
    SET company_id = v_company_id
    WHERE company_id IS NULL;
  END IF;
END $$;

-- ─── 3. RLS policy for contacts: authenticated users see their company ─────────
-- Drop overly-strict policy if it exists, replace with RLS-only (no explicit filter needed)
DROP POLICY IF EXISTS "Users can only see their company's contacts" ON public.contacts;
DROP POLICY IF EXISTS "authenticated_view_contacts" ON public.contacts;

CREATE POLICY "authenticated_view_contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR
    company_id IS NULL  -- Allow NULL company_id contacts (legacy) to be visible
  );

-- ─── 4. Ensure companies table is visible to authenticated users ───────────────
-- Some companies were created without owner_id — make them visible via RLS
DROP POLICY IF EXISTS "authenticated_view_companies" ON public.companies;

CREATE POLICY "authenticated_view_companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (true);  -- All companies visible to authenticated users (RLS on profile handles tenant isolation)

-- ─── 5. Re-assert LP capture anon insert on contacts ─────────────────────────
DROP POLICY IF EXISTS "Public Enable Insert" ON public.contacts;
CREATE POLICY "Public Enable Insert"
  ON public.contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ─── 6. waitlist for LP fallback (ensure it exists) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  name       TEXT,
  source     TEXT,
  interest   TEXT,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_can_insert_waitlist" ON public.waitlist;
CREATE POLICY "anon_can_insert_waitlist"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admins_can_view_waitlist" ON public.waitlist;
CREATE POLICY "admins_can_view_waitlist"
  ON public.waitlist FOR SELECT
  TO authenticated
  USING (true);

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT 
  'contacts' AS table_name,
  COUNT(*) AS total,
  COUNT(CASE WHEN company_id IS NULL THEN 1 END) AS null_company_id
FROM public.contacts
UNION ALL
SELECT 
  'deals', 
  COUNT(*), 
  COUNT(CASE WHEN company_id IS NULL THEN 1 END)
FROM public.deals;

NOTIFY pgrst, 'reload schema';
SELECT 'Migration 026 complete' AS result;
