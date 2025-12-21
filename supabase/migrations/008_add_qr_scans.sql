-- Migration: Add QR Code Analytics
-- Date: 2025-12-21
-- Description: Adds scan tracking for QR codes

-- Add scans column to qr_codes table
ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS scans INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_scans ON qr_codes(scans DESC);

-- Add comment for documentation
COMMENT ON COLUMN qr_codes.scans IS 'Number of times this QR code has been scanned/accessed';
