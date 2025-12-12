-- =============================================================================
-- PostgREST Schema Cache Refresh
-- =============================================================================
-- Execute this if you're still getting 400 errors after adding columns
-- This forces PostgREST to reload the schema cache
-- =============================================================================

-- Option 1: Notify PostgREST to reload (preferred)
NOTIFY pgrst, 'reload schema';

-- Option 2: If Option 1 doesn't work, restart PostgREST from Supabase Dashboard
-- Go to: Settings > API > Restart PostgREST

-- =============================================================================
-- Verification Query
-- =============================================================================
-- Run this to confirm all columns exist:

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'qr_codes' 
ORDER BY ordinal_position;

-- Expected columns (20 total):
-- id, project_type, client_name, destination_url, slug, color, description,
-- page_title, button_text, image_url, whatsapp,
-- qr_logo_url, qr_text_top, qr_text_bottom,
-- in_portfolio, in_gallery,
-- created_at, updated_at, owner_id, company_id
