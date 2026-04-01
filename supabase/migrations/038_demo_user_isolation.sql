-- ============================================================
-- 038_demo_user_isolation.sql
-- Date: 2026-03-31
-- Purpose:
--   Enable true per-lead isolation on the provadagua branch.
--   Each demo user gets their own company_id UUID so existing
--   RLS (company_id-based) isolates them automatically.
--
--   Additionally creates global_template flag on boards so
--   the platform can share onboarding template boards with
--   all demo users (visible to everyone).
-- ============================================================

-- ─── 1. global_template flag on boards ──────────────────────
ALTER TABLE public.boards
  ADD COLUMN IF NOT EXISTS global_template boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_boards_global_template
  ON public.boards (global_template) WHERE global_template = true;

-- ─── 2. global_template flag on contacts ────────────────────
-- For shared demo contact examples (e.g., "Amanda – Demo Lead")
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS global_template boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_contacts_global_template
  ON public.contacts (global_template) WHERE global_template = true;

-- ─── 3. Update RLS on boards to allow global templates ───────
-- Drop existing policy that only uses company_id
DROP POLICY IF EXISTS "boards_select_own" ON public.boards;
DROP POLICY IF EXISTS "Users can view their company boards" ON public.boards;
DROP POLICY IF EXISTS "select_own_boards" ON public.boards;

-- Recreate: own company OR global template
CREATE POLICY "boards_select_company_or_template" ON public.boards
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR global_template = true
  );

-- ─── 4. Update RLS on contacts ───────────────────────────────
DROP POLICY IF EXISTS "contacts_select_own" ON public.contacts;
DROP POLICY IF EXISTS "Users can view their company contacts" ON public.contacts;
DROP POLICY IF EXISTS "select_own_contacts" ON public.contacts;

CREATE POLICY "contacts_select_company_or_template" ON public.contacts
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR global_template = true
  );

-- ─── 5. Seed: mark existing QA boards as global templates ────
-- So every new demo user sees at least one starting board
UPDATE public.boards
  SET global_template = true
WHERE name ILIKE '%template%'
   OR name ILIKE '%demo%'
   OR name ILIKE '%exemplo%';

-- ─── VERIFY ──────────────────────────────────────────────────
SELECT
  'global_template boards' AS label,
  COUNT(*) AS total
FROM public.boards
WHERE global_template = true;

SELECT 'Migration 038 complete: per-lead demo isolation' AS result;
