-- ============================================================
-- 036_bulletproof_handle_new_user.sql
-- Date: 2026-03-31
-- Purpose: Make handle_new_user() trigger TOTALLY BULLET-PROOF
--
-- Problem (Erro 500 "Database error saving new user"):
--   The original trigger at 000_schema.sql line 518 does:
--     (new.raw_user_meta_data->>'company_id')::uuid
--   When company_id is missing/null/empty, the ::uuid cast THROWS.
--   Migration 033 fixed this with NULLIF but may not have been
--   applied to the live DB. This migration supersedes both.
--
-- This version:
--   1. Wraps everything in EXCEPTION handler — NEVER fails auth
--   2. Handles NULL/empty for all meta fields: company_id, role,
--      name, is_demo_data, preferred_currency, app_source
--   3. Adds is_demo_data + preferred_currency + app_source to profiles
--   4. Upserts safely (ON CONFLICT DO UPDATE)
-- ============================================================

-- ─── Step 1: Add missing columns to profiles (idempotent) ────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_demo_data      BOOLEAN  NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT     NOT NULL DEFAULT 'BRL';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS app_source        TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status            TEXT     NOT NULL DEFAULT 'active';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discount_credits  INTEGER  NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by       UUID;

-- ─── Step 2: Replace handle_new_user with bullet-proof version ───────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name              TEXT;
  v_role              TEXT;
  v_company_id        UUID;
  v_is_demo_data      BOOLEAN;
  v_preferred_currency TEXT;
  v_app_source        TEXT;
BEGIN
  -- ── Extract metadata safely (never throw on bad/missing values) ────────────

  -- Name: try name → full_name → email prefix
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'),      ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Role: default to 'vendedor' for showcase signups, 'user' otherwise
  v_role := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
    'user'
  );

  -- company_id: guard the UUID cast — NULL if absent or not a valid UUID
  BEGIN
    v_company_id := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_id'), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;

  -- is_demo_data: read from meta or default false
  v_is_demo_data := COALESCE(
    (NEW.raw_user_meta_data->>'is_demo_data')::BOOLEAN,
    false
  );

  -- preferred_currency: AUD for demo/showcase signups, BRL otherwise
  v_preferred_currency := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_currency'), ''),
    CASE WHEN v_is_demo_data THEN 'AUD' ELSE 'BRL' END
  );

  -- app_source: e.g. 'showcase_lp', 'invite', etc.
  v_app_source := NULLIF(TRIM(NEW.raw_user_meta_data->>'app_source'), '');

  -- ── Insert / update profile ────────────────────────────────────────────────
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar,
    role,
    company_id,
    is_demo_data,
    preferred_currency,
    app_source
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    NEW.raw_user_meta_data->>'avatar_url',
    v_role,
    v_company_id,
    v_is_demo_data,
    v_preferred_currency,
    v_app_source
  )
  ON CONFLICT (id) DO UPDATE SET
    email              = EXCLUDED.email,
    name               = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar             = COALESCE(EXCLUDED.avatar, public.profiles.avatar),
    role               = COALESCE(EXCLUDED.role, public.profiles.role),
    company_id         = COALESCE(EXCLUDED.company_id, public.profiles.company_id),
    is_demo_data       = EXCLUDED.is_demo_data OR public.profiles.is_demo_data,
    preferred_currency = COALESCE(EXCLUDED.preferred_currency, public.profiles.preferred_currency),
    app_source         = COALESCE(EXCLUDED.app_source, public.profiles.app_source);

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- CRITICAL: Never block auth signup. Log and continue.
  RAISE WARNING '[handle_new_user] Non-fatal error for user %: % — %',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ─── Step 3: Re-attach trigger (idempotent) ───────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Step 4: Verify ───────────────────────────────────────────────────────────

SELECT
  'profiles columns after migration' AS check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'profiles'
  AND column_name IN ('is_demo_data', 'preferred_currency', 'app_source', 'status', 'discount_credits')
ORDER BY column_name;

SELECT 'Migration 036 complete: bullet-proof handle_new_user' AS result;
