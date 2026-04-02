-- ============================================================
-- Migration 038: Super Admin Promotion + Company Isolation
-- ============================================================
-- Run in: Supabase Dashboard → SQL Editor
-- Author: Antigravity AI (Manager — Provadágua V3.0)
-- Date: 2026-04-01
--
-- GOD MODE ACTIVATION:
--   1. Promote lidimfc@gmail.com to Super Admin
--   2. Add is_super_admin column if not exists
--   3. Add access_expires_at column if not exists
--   4. Add company_id to contacts if not exists
--   5. Verify isolation between leads (Amanda, Médica, etc.)
-- ============================================================

BEGIN;

-- ── Step 1: Add is_super_admin column ─────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT false;

    COMMENT ON COLUMN public.profiles.is_super_admin IS
      'True for the canonical Super Admin (lidimfc@gmail.com). Bypasses company_id RLS.';

    RAISE NOTICE 'Column is_super_admin added to profiles.';
  ELSE
    RAISE NOTICE 'Column is_super_admin already exists — skipping.';
  END IF;
END $$;

-- ── Step 2: Add access_expires_at column ──────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'access_expires_at'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN access_expires_at TIMESTAMPTZ DEFAULT NULL;

    COMMENT ON COLUMN public.profiles.access_expires_at IS
      'NULL = permanent access. When set, user loses access after this timestamp.';

    RAISE NOTICE 'Column access_expires_at added to profiles.';
  ELSE
    RAISE NOTICE 'Column access_expires_at already exists — skipping.';
  END IF;
END $$;

-- ── Step 3: Add company_id to contacts ────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contacts'
      AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.contacts
      ADD COLUMN company_id UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL;

    COMMENT ON COLUMN public.contacts.company_id IS
      'Tenant isolation key. NULL = system-wide (accessible by Super Admin only).';

    RAISE NOTICE 'Column company_id added to contacts.';
  ELSE
    RAISE NOTICE 'Column company_id already exists in contacts — skipping.';
  END IF;
END $$;

-- ── Step 4: GOD MODE — Promote lidimfc@gmail.com ────────────
UPDATE public.profiles
SET
  role          = 'admin',
  is_super_admin = true,
  access_expires_at = NULL   -- permanent access
WHERE email = 'lidimfc@gmail.com';

-- Verify exactly 1 row was updated
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM public.profiles
  WHERE email = 'lidimfc@gmail.com'
    AND role = 'admin'
    AND is_super_admin = true;

  IF updated_count = 1 THEN
    RAISE NOTICE '✅ GOD MODE ACTIVATED: lidimfc@gmail.com is now Super Admin.';
  ELSIF updated_count = 0 THEN
    RAISE WARNING '⚠️ lidimfc@gmail.com not found in profiles. User may not have logged in yet.';
    RAISE WARNING '   Run again after the first login, OR insert via Supabase Auth.';
  ELSE
    RAISE EXCEPTION '❌ ANOMALY: Multiple rows matched for lidimfc@gmail.com. Investigate!';
  END IF;
END $$;

-- ── Step 5: Lead Isolation Audit ──────────────────────────────
-- Report the current lead distribution (read-only diagnostic)
DO $$
DECLARE
  demo_count    INTEGER;
  sdr_count     INTEGER;
  total_count   INTEGER;
BEGIN
  SELECT COUNT(*) INTO demo_count  FROM public.contacts WHERE is_demo_data = true;
  SELECT COUNT(*) INTO sdr_count   FROM public.contacts WHERE tags::text LIKE '%sdr%';
  SELECT COUNT(*) INTO total_count FROM public.contacts;

  RAISE NOTICE '── Lead Isolation Audit ──────────────────────';
  RAISE NOTICE '  Total contacts    : %', total_count;
  RAISE NOTICE '  Demo leads        : % (is_demo_data = true)', demo_count;
  RAISE NOTICE '  SDR leads (Link d''Água): %', sdr_count;
  RAISE NOTICE '  Production leads  : %', total_count - demo_count;
  RAISE NOTICE '─────────────────────────────────────────────';
END $$;

COMMIT;

-- ── Final Verification Query (run separately to confirm) ──────
-- SELECT
--   email,
--   role,
--   is_super_admin,
--   access_expires_at,
--   created_at
-- FROM public.profiles
-- WHERE email = 'lidimfc@gmail.com';
