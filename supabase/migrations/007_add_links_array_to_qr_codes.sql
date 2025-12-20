-- =============================================================================
-- QR d'água Card Digital - Add Links Array (Mini-Linktree)
-- =============================================================================
-- Migration: 007_add_links_array_to_qr_codes.sql
-- Description: Adds JSONB column for multiple links in Card Digital type
-- Execute in: Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ADD LINKS_ARRAY COLUMN
-- -----------------------------------------------------------------------------

-- Add JSONB column for storing multiple links
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS links_array JSONB DEFAULT '[]';

-- Add column comment for documentation
COMMENT ON COLUMN public.qr_codes.links_array IS 
'Array of links for Card Digital (Mini-Linktree). 
Structure: [{"id": "uuid", "type": "whatsapp|link|email", "label": "Text", "url": "...", "icon": "emoji", "active": true}]';

-- -----------------------------------------------------------------------------
-- 2. CREATE INDEX FOR JSONB QUERIES
-- -----------------------------------------------------------------------------

-- GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS qr_codes_links_array_idx ON public.qr_codes USING GIN (links_array);

-- -----------------------------------------------------------------------------
-- 3. CREATE VALIDATION FUNCTION
-- -----------------------------------------------------------------------------

-- Function to validate links_array structure
CREATE OR REPLACE FUNCTION public.validate_links_array(links JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    link JSONB;
BEGIN
    -- Allow empty array
    IF jsonb_array_length(links) = 0 THEN
        RETURN true;
    END IF;
    
    -- Validate each link object
    FOR link IN SELECT * FROM jsonb_array_elements(links)
    LOOP
        -- Check required fields exist
        IF NOT (
            link ? 'id' AND
            link ? 'type' AND
            link ? 'label' AND
            link ? 'url' AND
            link ? 'active'
        ) THEN
            RETURN false;
        END IF;
        
        -- Validate type is one of allowed values
        IF NOT (link->>'type' IN ('whatsapp', 'link', 'email', 'phone', 'instagram', 'linkedin', 'custom')) THEN
            RETURN false;
        END IF;
        
        -- Validate active is boolean
        IF NOT (jsonb_typeof(link->'active') = 'boolean') THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -----------------------------------------------------------------------------
-- 4. ADD CHECK CONSTRAINT
-- -----------------------------------------------------------------------------

-- Add constraint to ensure links_array is valid
ALTER TABLE public.qr_codes
ADD CONSTRAINT links_array_valid_structure 
CHECK (validate_links_array(links_array));

-- =============================================================================
-- ✅ MIGRATION COMPLETE!
-- =============================================================================
-- 
-- ADDED TO qr_codes TABLE:
-- • Column: links_array (JSONB, default: [])
-- • Index: GIN index for JSONB queries
-- • Validation: Function + constraint for data integrity
--
-- LINKS_ARRAY STRUCTURE:
-- [
--   {
--     "id": "550e8400-e29b-41d4-a716-446655440000",
--     "type": "whatsapp",
--     "label": "Falar no WhatsApp",
--     "url": "5511999999999",
--     "icon": "💬",
--     "active": true
--   },
--   {
--     "id": "550e8400-e29b-41d4-a716-446655440001",
--     "type": "link",
--     "label": "Visite nosso site",
--     "url": "https://example.com",
--     "icon": "🌐",
--     "active": true
--   }
-- ]
--
-- SUPPORTED TYPES:
-- • whatsapp - WhatsApp link (url should be phone number)
-- • link - Generic URL
-- • email - Email address
-- • phone - Phone number
-- • instagram - Instagram profile
-- • linkedin - LinkedIn profile
-- • custom - Custom link type
--
-- USAGE EXAMPLE:
-- UPDATE qr_codes 
-- SET links_array = '[
--   {"id": "uuid-1", "type": "whatsapp", "label": "WhatsApp", "url": "5511999999999", "icon": "💬", "active": true},
--   {"id": "uuid-2", "type": "link", "label": "Website", "url": "https://example.com", "icon": "🌐", "active": true}
-- ]'::jsonb
-- WHERE slug = 'my-card';
--
-- NEXT STEPS:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update QRdaguaPage.tsx to add links editor for CARD type
-- 3. Update BridgePage.tsx to render multiple links from links_array
-- =============================================================================
