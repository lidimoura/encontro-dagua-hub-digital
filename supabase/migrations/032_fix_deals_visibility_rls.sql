-- ════════════════════════════════════════════════════════════════════════════
-- Migration 032: Fix Deals Visibility for Link d'Água 
-- Date: 2026-03-16
-- ════════════════════════════════════════════════════════════════════════════
-- Edge Functions created deals with company_id = NULL, making them invisible
-- to authenticated users due to strict tenant isolation.
-- This migration updates the deals RLS to allow viewing NULL company_id deals,
-- just like what was done for contacts in migration 026.

-- 1. Drop existing policy
DROP POLICY IF EXISTS "tenant_isolation" ON public.deals;
DROP POLICY IF EXISTS "tenant_isolation_deals_all" ON public.deals;

-- 2. Create new inclusive policy
CREATE POLICY "tenant_isolation_deals_all"
  ON public.deals FOR ALL
  TO authenticated
  USING (
    company_id = (auth.jwt()->>'company_id')::uuid
    OR company_id IS NULL
  )
  WITH CHECK (
    company_id = (auth.jwt()->>'company_id')::uuid
    OR company_id IS NULL
  );

-- 3. Also fix any deals that might already exist and are orphan 
-- by assigning them the company_id of their board
UPDATE public.deals d
SET company_id = b.company_id
FROM public.boards b
WHERE d.board_id = b.id AND d.company_id IS NULL;

-- 4. Notify structural changes if necessary
NOTIFY pgrst, 'reload schema';
SELECT 'Migration 032 complete: Deals visibility fixed' AS result;
