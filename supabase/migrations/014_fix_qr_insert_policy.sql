-- Migration: Fix QR Codes RLS Policies (Authenticated Users INSERT)
-- Date: 2026-01-02
-- Purpose: Allow authenticated users to create their own QR codes

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON qr_codes;

-- Create new policy that allows INSERT when owner_id matches auth.uid()
-- This allows users to create QR codes and automatically set themselves as owner
CREATE POLICY "Enable insert for authenticated users"
ON qr_codes
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow insert if owner_id is set to the current user
  owner_id = auth.uid()
  OR
  -- OR allow insert if owner_id is NULL (will be set by trigger/default)
  owner_id IS NULL
);

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'qr_codes' 
    AND policyname = 'Enable insert for authenticated users'
  ) THEN
    RAISE NOTICE '✅ Policy updated successfully - Users can now create QR codes';
  ELSE
    RAISE EXCEPTION '❌ Failed to update policy';
  END IF;
END $$;

-- Show current policies for verification
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'qr_codes'
ORDER BY policyname;
