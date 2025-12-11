-- =============================================================================
-- QR d'água Module - Add Missing Columns to Existing Table
-- =============================================================================
-- Migration: 001_add_qr_codes_table.sql
-- Description: Adds missing columns to the existing qr_codes table
-- Execute in: Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ADD MISSING COLUMNS (IF NOT EXISTS)
-- -----------------------------------------------------------------------------

-- Core Fields
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'LINK';
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS destination_url TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#620939';
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- BRIDGE/CARD Fields
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS page_title TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS button_text TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- QR Pro Fields
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS qr_logo_url TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS qr_text_top TEXT;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS qr_text_bottom TEXT;

-- Portfolio/Gallery Fields
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS in_portfolio BOOLEAN DEFAULT false;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS in_gallery BOOLEAN DEFAULT false;

-- System Fields
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 2. CREATE INDEXES (IF NOT EXISTS)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS qr_codes_company_id_idx ON public.qr_codes(company_id);
CREATE INDEX IF NOT EXISTS qr_codes_owner_id_idx ON public.qr_codes(owner_id);
CREATE INDEX IF NOT EXISTS qr_codes_slug_idx ON public.qr_codes(slug);
CREATE INDEX IF NOT EXISTS qr_codes_in_portfolio_idx ON public.qr_codes(in_portfolio) WHERE in_portfolio = true;
CREATE INDEX IF NOT EXISTS qr_codes_in_gallery_idx ON public.qr_codes(in_gallery) WHERE in_gallery = true;

-- -----------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY (IF NOT ALREADY ENABLED)
-- -----------------------------------------------------------------------------
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. DROP EXISTING POLICIES (IF ANY) AND RECREATE
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "tenant_isolation_select" ON public.qr_codes;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON public.qr_codes;
DROP POLICY IF EXISTS "tenant_isolation_update" ON public.qr_codes;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON public.qr_codes;
DROP POLICY IF EXISTS "public_portfolio_select" ON public.qr_codes;

-- SELECT: Users can view QR codes from their company
CREATE POLICY "tenant_isolation_select" ON public.qr_codes
FOR SELECT TO authenticated
USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- INSERT: Users can create QR codes in their company
CREATE POLICY "tenant_isolation_insert" ON public.qr_codes
FOR INSERT TO authenticated
WITH CHECK (company_id = (auth.jwt()->>'company_id')::uuid);

-- UPDATE: Users can update QR codes from their company
CREATE POLICY "tenant_isolation_update" ON public.qr_codes
FOR UPDATE TO authenticated
USING (company_id = (auth.jwt()->>'company_id')::uuid)
WITH CHECK (company_id = (auth.jwt()->>'company_id')::uuid);

-- DELETE: Users can delete QR codes from their company
CREATE POLICY "tenant_isolation_delete" ON public.qr_codes
FOR DELETE TO authenticated
USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- PUBLIC SELECT: Allow public access to portfolio/gallery items (for landing page)
CREATE POLICY "public_portfolio_select" ON public.qr_codes
FOR SELECT TO anon, authenticated
USING (in_portfolio = true OR in_gallery = true);

-- -----------------------------------------------------------------------------
-- 5. CREATE/REPLACE TRIGGERS
-- -----------------------------------------------------------------------------

-- Auto-set company_id trigger (reuse existing function)
DROP TRIGGER IF EXISTS auto_company_id ON public.qr_codes;
CREATE TRIGGER auto_company_id BEFORE INSERT ON public.qr_codes
FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS update_qr_codes_timestamp ON public.qr_codes;

CREATE OR REPLACE FUNCTION public.update_qr_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qr_codes_timestamp
BEFORE UPDATE ON public.qr_codes
FOR EACH ROW
EXECUTE FUNCTION update_qr_codes_updated_at();

-- =============================================================================
-- ✅ MIGRATION COMPLETE!
-- =============================================================================
-- 
-- ADDED TO qr_codes TABLE:
-- • Columns: project_type, client_name, destination_url, slug, color, description
-- • Columns: page_title, button_text, image_url, whatsapp
-- • Columns: qr_logo_url, qr_text_top, qr_text_bottom
-- • Columns: in_portfolio, in_gallery
-- • Columns: created_at, updated_at, owner_id, company_id
-- • Indexes: 5 (company_id, owner_id, slug, in_portfolio, in_gallery)
-- • RLS Policies: 5 (tenant isolation + public portfolio access)
-- • Triggers: 2 (auto company_id, auto updated_at)
--
-- NEXT STEPS:
-- 1. Verify columns: SELECT * FROM qr_codes LIMIT 1;
-- 2. Test insert: INSERT INTO qr_codes (client_name, destination_url, slug) 
--    VALUES ('Test', 'https://example.com', 'test-slug');
-- 3. Deploy frontend code fixes
-- =============================================================================
