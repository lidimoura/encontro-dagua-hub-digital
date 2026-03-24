-- ============================================================
-- 034_add_is_demo_data_column.sql
-- Add is_demo_data boolean to sandbox-persistent tables.
-- This allows the provadagua (DEMO) branch to read AND write
-- Supabase rows while being 100% isolated from production data.
--
-- Rules enforced in application code (not RLS), so the column
-- must NOT have a default RLS policy — the app layer controls it.
-- ============================================================

-- Activities
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

-- Products (catalog)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

-- QR Codes
ALTER TABLE public.qr_codes
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

-- Saved Prompts
ALTER TABLE public.saved_prompts
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

-- Contacts (mark existing QA/test contacts as demo data)
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

-- Mark known QA test contacts automatically
UPDATE public.contacts
SET is_demo_data = true
WHERE
  tags @> ARRAY['🤖 sdr']::text[]
  OR email ILIKE '%@teste%'
  OR email ILIKE '%0000000000%'
  OR name ILIKE '%Gamer pc%'
  OR name ILIKE '%Lilas%'
  OR is_test = true;

-- Deals (mark deals linked to demo contacts)
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false;

UPDATE public.deals d
SET is_demo_data = true
FROM public.contacts c
WHERE d.contact_id = c.id AND c.is_demo_data = true;

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_activities_is_demo ON public.activities (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_products_is_demo ON public.products (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_demo ON public.qr_codes (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_is_demo ON public.saved_prompts (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_contacts_is_demo ON public.contacts (is_demo_data);
CREATE INDEX IF NOT EXISTS idx_deals_is_demo ON public.deals (is_demo_data);
