-- Migration: Fix RLS SELECT Policy for Contacts - Allow Admins to View All Leads
-- Date: 2026-01-03
-- Purpose: Allow authenticated users (especially admins) to view ALL contacts including public leads with NULL user_id

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Enable read for authenticated users" ON contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON contacts;

-- Create new SELECT policy that allows viewing all contacts
CREATE POLICY "Admins can view all contacts"
ON contacts
FOR SELECT
TO authenticated
USING (true);  -- Allows viewing ALL contacts regardless of owner

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Admins can view all contacts'
  ) THEN
    RAISE NOTICE '✅ Policy created successfully - Admins can now view ALL contacts including public leads';
  ELSE
    RAISE EXCEPTION '❌ Failed to create policy';
  END IF;
END $$;

-- Show current policies for verification
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'contacts'
ORDER BY policyname;
