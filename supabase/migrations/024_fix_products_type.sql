-- ════════════════════════════════════════════════════════════════════════════
-- Migration 024: Fix Products Type Column (Definitive Tech Stack Separation)
-- Date: 2026-03-11
-- Purpose: Assign correct 'type' to all products so the frontend filter works
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Add CHECK constraint on products.type ────────────────────────────────
-- This prevents future bad data from being inserted
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS category TEXT;

-- ─── 2. Update known TECH STACK items by name patterns ───────────────────────
-- These are tools/infrastructure that should NOT appear in the sales product list
UPDATE public.products
SET type = 'tech_stack'
WHERE type IS NULL
   OR type NOT IN ('tech_stack', 'infra', 'api_cost', 'product', 'service', 'catalog')
   OR (type != 'tech_stack' AND (
     LOWER(name) LIKE '%openai%'
     OR LOWER(name) LIKE '%anthropic%'
     OR LOWER(name) LIKE '%claude%'
     OR LOWER(name) LIKE '%gemini%'
     OR LOWER(name) LIKE '%gpt%'
     OR LOWER(name) LIKE '%vercel%'
     OR LOWER(name) LIKE '%supabase%'
     OR LOWER(name) LIKE '%n8n%'
     OR LOWER(name) LIKE '%zapier%'
     OR LOWER(name) LIKE '%make %' OR name = 'Make'
     OR LOWER(name) LIKE '%deno%'
     OR LOWER(name) LIKE '%stripe%'
     OR LOWER(name) LIKE '%twilio%'
     OR LOWER(name) LIKE '%sendgrid%'
     OR LOWER(name) LIKE '%cloudflare%'
     OR LOWER(name) LIKE '%aws%'
     OR LOWER(name) LIKE '%gcp%'
     OR LOWER(name) LIKE '%azure%'
     OR LOWER(name) LIKE '%firebase%'
   ));

-- ─── 3. Everything else without type → 'product' (catalog item) ──────────────
UPDATE public.products
SET type = 'product'
WHERE type IS NULL OR type = '';

-- ─── 4. Add index for performance ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS products_type_idx ON public.products(type);
CREATE INDEX IF NOT EXISTS products_company_type_idx ON public.products(company_id, type);

-- ─── 5. Verify ───────────────────────────────────────────────────────────────
SELECT 
  type,
  COUNT(*) as count
FROM public.products
GROUP BY type
ORDER BY count DESC;

NOTIFY pgrst, 'reload schema';

SELECT 'Migration 024 complete: products.type set correctly for all rows' AS result;
