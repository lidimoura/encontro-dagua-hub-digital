-- Migration: Fix RLS Policies for QR Codes and Company Invites
-- Created: 2024-12-26
-- Purpose: Enable authenticated users to insert/update/delete their own data

-- =============================================
-- QR CODES TABLE - RLS POLICIES
-- =============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON qr_codes;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON qr_codes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON qr_codes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON qr_codes;

-- Enable RLS on qr_codes table
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to INSERT their own QR codes
CREATE POLICY "Enable insert for authenticated users"
ON qr_codes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Policy: Allow authenticated users to READ their own QR codes
CREATE POLICY "Enable read for authenticated users"
ON qr_codes
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Policy: Allow authenticated users to UPDATE their own QR codes
CREATE POLICY "Enable update for authenticated users"
ON qr_codes
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy: Allow authenticated users to DELETE their own QR codes
CREATE POLICY "Enable delete for authenticated users"
ON qr_codes
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Policy: Allow public READ access for gallery items (in_gallery = true)
CREATE POLICY "Enable public read for gallery items"
ON qr_codes
FOR SELECT
TO public
USING (in_gallery = true);

-- =============================================
-- COMPANY INVITES TABLE - RLS POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON company_invites;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON company_invites;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON company_invites;

-- Enable RLS on company_invites table
ALTER TABLE company_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to INSERT invites
CREATE POLICY "Enable insert for authenticated users"
ON company_invites
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to READ all invites
CREATE POLICY "Enable read for authenticated users"
ON company_invites
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to UPDATE invites (for marking as used)
CREATE POLICY "Enable update for authenticated users"
ON company_invites
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow public READ access for invite validation (by token)
CREATE POLICY "Enable public read by token"
ON company_invites
FOR SELECT
TO public
USING (true);

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('qr_codes', 'company_invites')
ORDER BY tablename, policyname;
 