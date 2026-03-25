-- ============================================================
-- 034_add_is_demo_data_column.sql  (v2 — fixed)
-- Add is_demo_data boolean to sandbox-persistent tables.
--
-- Changes vs v1:
--   • Removed reference to non-existent column `is_test`
--   • Added deals.briefing_json JSONB (required by form-lp-lead edge fn)
--   • Demo contacts identified by email/name pattern only
-- ============================================================

-- ─── 1. ADD is_demo_data to all tables ───────────────────────────────────────

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

ALTER TABLE public.qr_codes
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

ALTER TABLE public.saved_prompts
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

-- ─── 2. ADD briefing_json to deals ───────────────────────────────────────────
-- Required by form-lp-lead edge function (line 224 writes briefing_json to deals)

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS briefing_json jsonb;

-- ─── 3. MARK existing QA/test contacts as demo ───────────────────────────────
-- Identity is determined by email or name patterns only (no is_test column)

UPDATE public.contacts
SET is_demo_data = true
WHERE
  email ILIKE '%@teste%'
  OR email ILIKE '%test%'
  OR email ILIKE '%0000000000%'
  OR email ILIKE '%@sdr.webhook%'
  OR name  ILIKE '%teste%'
  OR name  ILIKE '%Gamer pc%'
  OR name  ILIKE '%Lilas%'
  OR name  ILIKE '%Amanda%';

-- ─── 4. CASCADE: mark deals linked to demo contacts ──────────────────────────

UPDATE public.deals d
SET is_demo_data = true
FROM public.contacts c
WHERE d.contact_id = c.id
  AND c.is_demo_data = true;

-- ─── 5. Performance indexes ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_activities_is_demo    ON public.activities    (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_products_is_demo      ON public.products      (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_demo      ON public.qr_codes      (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_is_demo ON public.saved_prompts (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_contacts_is_demo      ON public.contacts      (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_deals_is_demo         ON public.deals         (is_demo_data);

-- ─── VERIFY ─────────────────────────────────────────────────────────────────

SELECT
  'contacts marked as demo' AS label,
  COUNT(*) AS total
FROM public.contacts
WHERE is_demo_data = true;

SELECT
  'deals marked as demo' AS label,
  COUNT(*) AS total
FROM public.deals
WHERE is_demo_data = true;

SELECT
  'deals with briefing_json' AS label,
  COUNT(*) AS total
FROM public.deals
WHERE briefing_json IS NOT NULL;

SELECT 'Migration 034 v2 complete' AS result;
