-- ============================================================
-- 037_profiles_preferences.sql
-- Date: 2026-03-31
-- Purpose:
--   Add preferred_language and preferred_currency to profiles
--   so user preferences persist across sessions and devices.
--   This powers the "set once, remember forever" UX experience.
-- ============================================================

-- ─── 1. Add columns (idempotent) ─────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT
    DEFAULT 'en'
    CHECK (preferred_language IN ('pt', 'en', 'es'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT
    DEFAULT 'AUD'
    CHECK (preferred_currency IN ('BRL', 'AUD', 'USD'));

-- ─── 2. Performance index ────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
  ON public.profiles (preferred_language);

-- ─── 3. Backfill from localStorage pattern ───────────────────
-- Demo users (no company_id) default to EN/AUD
-- Production users default to PT/BRL

UPDATE public.profiles
  SET preferred_language = 'en',
      preferred_currency = 'AUD'
WHERE is_demo_data = true
  AND preferred_language IS NULL;

-- ─── 4. RLS: users can update their own preferences ──────────
-- The existing profiles RLS policy (id = auth.uid()) already
-- covers UPDATE for own row, so no new policy needed.

-- ─── VERIFY ──────────────────────────────────────────────────

SELECT
  'preferred_language column' AS check,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('preferred_language', 'preferred_currency');

SELECT 'Migration 037 complete: profiles preferences persistence' AS result;
