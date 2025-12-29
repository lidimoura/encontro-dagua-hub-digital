-- Migration: Fix QR Codes RLS - Critical Security Patch
-- Created: 2024-12-29
-- Purpose: Fix data leak - users seeing other users' QR codes
-- Issue: Migration 009 uses owner_id but doesn't account for user_id vs owner_id logic

-- =============================================
-- QR CODES TABLE - SECURITY FIX
-- =============================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON qr_codes;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON qr_codes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON qr_codes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON qr_codes;
DROP POLICY IF EXISTS "Enable public read for gallery items" ON qr_codes;
DROP POLICY IF EXISTS "Users can view their own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Admins can manage all QR codes" ON qr_codes;

-- Ensure RLS is enabled
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- NEW SECURE POLICIES
-- =============================================

-- Policy 1: SELECT - Users can see their own QR codes (created by them OR assigned to them)
CREATE POLICY "Users can view own and assigned QR codes"
ON qr_codes
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id  -- QR codes they created
  OR 
  auth.uid() = owner_id -- QR codes assigned to them (Super Admin feature)
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  ) -- Admins see everything
);

-- Policy 2: INSERT - Users can only create QR codes for themselves
CREATE POLICY "Users can insert own QR codes"
ON qr_codes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id -- Must be the creator
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  ) -- Admins can create for anyone
);

-- Policy 3: UPDATE - Users can update their own QR codes
CREATE POLICY "Users can update own and assigned QR codes"
ON qr_codes
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR
  auth.uid() = owner_id
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  auth.uid() = user_id
  OR
  auth.uid() = owner_id
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy 4: DELETE - Users can delete their own QR codes
CREATE POLICY "Users can delete own and assigned QR codes"
ON qr_codes
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR
  auth.uid() = owner_id
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy 5: PUBLIC SELECT - Gallery items visible to everyone
CREATE POLICY "Public can view gallery items"
ON qr_codes
FOR SELECT
TO public
USING (in_gallery = true);

-- =============================================
-- VERIFICATION
-- =============================================

-- List all policies for qr_codes table
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'qr_codes'
ORDER BY policyname;

-- Test query (run as authenticated user to verify)
-- SELECT id, client_name, user_id, owner_id FROM qr_codes;
