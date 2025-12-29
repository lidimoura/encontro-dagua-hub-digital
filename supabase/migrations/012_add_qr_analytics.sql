-- Migration: Add QR Code Analytics
-- Description: Add scan tracking columns to qr_codes table for analytics and performance monitoring

-- Add analytics columns to qr_codes table
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance on scan queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_scan_count ON public.qr_codes(scan_count DESC);
CREATE INDEX IF NOT EXISTS idx_qr_codes_last_scan_at ON public.qr_codes(last_scan_at DESC);

-- Add owner_id column for Super Admin assignment (assign QR to specific user)
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for owner queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_owner_id ON public.qr_codes(owner_id);

-- Update RLS policies to allow owner access
DROP POLICY IF EXISTS "Users can view their own QR codes" ON public.qr_codes;
CREATE POLICY "Users can view their own QR codes"
ON public.qr_codes FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = owner_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Allow admins to assign QR codes to any user
DROP POLICY IF EXISTS "Admins can manage all QR codes" ON public.qr_codes;
CREATE POLICY "Admins can manage all QR codes"
ON public.qr_codes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Create function to increment scan count (will be called by redirect endpoint)
CREATE OR REPLACE FUNCTION public.increment_qr_scan(qr_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.qr_codes
  SET 
    scan_count = COALESCE(scan_count, 0) + 1,
    last_scan_at = NOW()
  WHERE id = qr_id;
END;
$$;

-- Grant execute permission to authenticated users (for public redirect)
GRANT EXECUTE ON FUNCTION public.increment_qr_scan(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_qr_scan(UUID) TO authenticated;

COMMENT ON COLUMN public.qr_codes.scan_count IS 'Total number of scans/clicks on this QR code';
COMMENT ON COLUMN public.qr_codes.last_scan_at IS 'Timestamp of the most recent scan';
COMMENT ON COLUMN public.qr_codes.owner_id IS 'User who owns this QR code (for Super Admin assignment)';
COMMENT ON FUNCTION public.increment_qr_scan IS 'Increments scan count and updates last scan timestamp';
