-- Migration: Add Feature Flags and Plan Management
-- Date: 2025-12-21
-- Description: Adds granular feature control per user for manual plan activation

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_prompt_lab_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_code_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_landing_page_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_crm_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'monthly', 'annual')),
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Create index for faster plan queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_coupon_code ON profiles(coupon_code) WHERE coupon_code IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_prompt_lab_active IS 'Manual toggle for Prompt Lab access';
COMMENT ON COLUMN profiles.qr_code_limit IS 'Number of QR codes user can create (0 = unlimited for pro)';
COMMENT ON COLUMN profiles.is_landing_page_active IS 'Access to landing page builder';
COMMENT ON COLUMN profiles.is_crm_active IS 'Access to CRM features';
COMMENT ON COLUMN profiles.plan_type IS 'Current plan: free, monthly, or annual';
COMMENT ON COLUMN profiles.coupon_code IS 'Applied coupon code for discounts';
COMMENT ON COLUMN profiles.plan_activated_at IS 'When the current plan was activated';
COMMENT ON COLUMN profiles.plan_expires_at IS 'When the current plan expires (NULL for lifetime)';
