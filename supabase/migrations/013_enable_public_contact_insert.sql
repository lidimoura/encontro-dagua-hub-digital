 -- Migration: Enable Public Contact Insert (Landing Page Form)
-- Date: 2026-01-02
-- Purpose: Allow anonymous users to insert leads via landing page form

-- Drop existing policy if exists (to avoid conflicts)
DROP POLICY IF EXISTS "Public Enable Insert" ON contacts;

-- Create policy to allow anonymous (public) inserts
-- This is safe because:
-- 1. Only allows INSERT (not UPDATE/DELETE)
-- 2. Leads are created with stage='LEAD' and require admin approval
-- 3. No sensitive data exposure (anon users can't SELECT)
CREATE POLICY "Public Enable Insert"
ON contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- Verify policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Public Enable Insert'
  ) THEN
    RAISE NOTICE '✅ Policy "Public Enable Insert" created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create policy';
  END IF;
END $$;

-- IMPORTANT: This policy only allows INSERT
-- Anonymous users still CANNOT:
-- - SELECT (read) contacts
-- - UPDATE existing contacts
-- - DELETE contacts
-- All those operations require authentication
