-- =============================================================================
-- QR d'água Module - Add Direct Redirect Feature (PRO Plan)
-- =============================================================================
-- Migration: 003_add_direct_redirect.sql
-- Description: Adds direct_redirect boolean field for PRO users
-- Execute in: Supabase SQL Editor
-- =============================================================================

-- Add direct_redirect field for PRO plan feature
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS direct_redirect BOOLEAN DEFAULT false;

-- Add index for performance (partial index for true values only)
CREATE INDEX IF NOT EXISTS qr_codes_direct_redirect_idx ON public.qr_codes(direct_redirect) WHERE direct_redirect = true;

-- Add column comment for documentation
COMMENT ON COLUMN public.qr_codes.direct_redirect IS 'PRO feature: Skip BridgePage and redirect directly to destination_url. Only works for admin users.';

-- =============================================================================
-- ✅ MIGRATION COMPLETE!
-- =============================================================================
-- 
-- BUSINESS LOGIC:
-- • FREE users (role='vendedor'): Always show BridgePage with "Powered by" footer
-- • PRO users (role='admin'): Can enable direct_redirect to skip BridgePage
-- • When direct_redirect=true AND owner is admin: Immediate redirect
-- • When direct_redirect=false OR owner is not admin: Show BridgePage
--
-- NEXT STEPS:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update frontend code to add checkbox (PRO only)
-- 3. Update BridgePage.tsx to check owner role and direct_redirect
-- =============================================================================
