-- =============================================================================
-- QR d'água Analytics - Add QR Scans Tracking Table
-- =============================================================================
-- Migration: 006_add_qr_scans_table.sql
-- Description: Creates table to track QR code scans for analytics
-- Execute in: Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREATE TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    
    -- Scan Data
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Device Info (parsed from User-Agent)
    device_type TEXT, -- 'mobile', 'tablet', 'desktop', 'unknown'
    os TEXT, -- 'iOS', 'Android', 'Windows', 'macOS', 'Linux', etc.
    browser TEXT, -- 'Chrome', 'Safari', 'Firefox', etc.
    
    -- Location (from IP geolocation - optional, can be added later)
    city TEXT,
    region TEXT,
    country TEXT,
    
    -- Technical Data
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- -----------------------------------------------------------------------------
-- 2. CREATE INDEXES FOR ANALYTICS QUERIES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS qr_scans_qr_id_idx ON public.qr_scans(qr_id);
CREATE INDEX IF NOT EXISTS qr_scans_scanned_at_idx ON public.qr_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS qr_scans_device_type_idx ON public.qr_scans(device_type);
CREATE INDEX IF NOT EXISTS qr_scans_city_idx ON public.qr_scans(city);
CREATE INDEX IF NOT EXISTS qr_scans_country_idx ON public.qr_scans(country);

-- Composite index for time-series analytics
CREATE INDEX IF NOT EXISTS qr_scans_qr_id_scanned_at_idx ON public.qr_scans(qr_id, scanned_at DESC);

-- -----------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. CREATE RLS POLICIES
-- -----------------------------------------------------------------------------

-- SELECT: Users can view scans for their company's QR codes
CREATE POLICY "Users can view scans for their QR codes" ON public.qr_scans
FOR SELECT TO authenticated
USING (
    qr_id IN (
        SELECT id FROM public.qr_codes 
        WHERE company_id = (auth.jwt()->>'company_id')::uuid
    )
);

-- INSERT: Anyone can insert scan records (public tracking)
-- This allows anonymous users to be tracked when they scan QR codes
CREATE POLICY "Anyone can insert scan records" ON public.qr_scans
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- No UPDATE or DELETE policies - scans are immutable for data integrity

-- -----------------------------------------------------------------------------
-- 5. CREATE HELPER FUNCTION FOR DEVICE DETECTION
-- -----------------------------------------------------------------------------

-- Function to parse User-Agent and extract device type
CREATE OR REPLACE FUNCTION public.detect_device_type(user_agent TEXT)
RETURNS TEXT AS $$
BEGIN
    IF user_agent IS NULL THEN
        RETURN 'unknown';
    END IF;
    
    -- Mobile detection
    IF user_agent ~* 'Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini' THEN
        IF user_agent ~* 'iPad|Tablet' THEN
            RETURN 'tablet';
        ELSE
            RETURN 'mobile';
        END IF;
    END IF;
    
    -- Desktop
    RETURN 'desktop';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to extract OS from User-Agent
CREATE OR REPLACE FUNCTION public.detect_os(user_agent TEXT)
RETURNS TEXT AS $$
BEGIN
    IF user_agent IS NULL THEN
        RETURN 'unknown';
    END IF;
    
    IF user_agent ~* 'iPhone|iPad|iPod' THEN
        RETURN 'iOS';
    ELSIF user_agent ~* 'Android' THEN
        RETURN 'Android';
    ELSIF user_agent ~* 'Windows' THEN
        RETURN 'Windows';
    ELSIF user_agent ~* 'Macintosh|Mac OS X' THEN
        RETURN 'macOS';
    ELSIF user_agent ~* 'Linux' THEN
        RETURN 'Linux';
    ELSE
        RETURN 'unknown';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to extract browser from User-Agent
CREATE OR REPLACE FUNCTION public.detect_browser(user_agent TEXT)
RETURNS TEXT AS $$
BEGIN
    IF user_agent IS NULL THEN
        RETURN 'unknown';
    END IF;
    
    IF user_agent ~* 'Edg/' THEN
        RETURN 'Edge';
    ELSIF user_agent ~* 'Chrome' THEN
        RETURN 'Chrome';
    ELSIF user_agent ~* 'Safari' AND user_agent !~* 'Chrome' THEN
        RETURN 'Safari';
    ELSIF user_agent ~* 'Firefox' THEN
        RETURN 'Firefox';
    ELSIF user_agent ~* 'Opera|OPR' THEN
        RETURN 'Opera';
    ELSE
        RETURN 'unknown';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- ✅ MIGRATION COMPLETE!
-- =============================================================================
-- 
-- CREATED:
-- • Table: qr_scans
-- • Indexes: 6 (qr_id, scanned_at, device_type, city, country, composite)
-- • RLS Policies: 2 (select for authenticated, insert for all)
-- • Helper Functions: 3 (detect_device_type, detect_os, detect_browser)
--
-- USAGE EXAMPLE:
-- INSERT INTO qr_scans (qr_id, user_agent, ip_address, device_type, os, browser)
-- VALUES (
--     'qr-uuid-here',
--     'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...',
--     '192.168.1.1',
--     detect_device_type('Mozilla/5.0 (iPhone...)'),
--     detect_os('Mozilla/5.0 (iPhone...)'),
--     detect_browser('Mozilla/5.0 (iPhone...)')
-- );
--
-- NEXT STEPS:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update BridgePage.tsx to track scans on page load
-- 3. Create analytics dashboard to visualize scan data
-- =============================================================================
