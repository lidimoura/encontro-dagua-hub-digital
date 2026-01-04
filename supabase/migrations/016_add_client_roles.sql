-- Migration: Add client roles support to profiles table
-- Date: 2026-01-04
-- Purpose: Enable cliente and cliente_restrito roles for customer access

-- Drop existing role constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with client roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'vendedor', 'cliente', 'cliente_restrito'));

-- Add user_type column to distinguish team members from clients
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'team_member' 
CHECK (user_type IN ('team_member', 'client'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON profiles(user_type);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Update existing profiles to have user_type
UPDATE profiles 
SET user_type = 'team_member' 
WHERE user_type IS NULL;

-- Verify changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_role_check'
    AND check_clause LIKE '%cliente%'
  ) THEN
    RAISE NOTICE '✅ Role constraint updated successfully - client roles enabled';
  ELSE
    RAISE EXCEPTION '❌ Failed to update role constraint';
  END IF;
END $$;

-- Show current role distribution
SELECT role, user_type, COUNT(*) as count
FROM profiles
GROUP BY role, user_type
ORDER BY role, user_type;
