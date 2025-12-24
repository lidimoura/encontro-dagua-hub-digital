-- Migration 006: Add Referral System
-- Description: Add referral tracking and discount credits to profiles table
-- Date: 2025-12-23

-- Add referral columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS discount_credits INTEGER DEFAULT 0 NOT NULL;

-- Add discount flag to company_invites table
ALTER TABLE public.company_invites 
ADD COLUMN IF NOT EXISTS offer_discount BOOLEAN DEFAULT false NOT NULL;

-- Create index for faster referral queries
CREATE INDEX IF NOT EXISTS profiles_referred_by_idx ON public.profiles(referred_by);

-- Create function to increment discount credits atomically
CREATE OR REPLACE FUNCTION increment_discount_credits(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET discount_credits = discount_credits + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_discount_credits(UUID) TO authenticated;

-- Comments for documentation
COMMENT ON COLUMN public.profiles.referred_by IS 'UUID of the user who referred this user';
COMMENT ON COLUMN public.profiles.discount_credits IS 'Number of 20% discount coupons accumulated through referrals';
COMMENT ON COLUMN public.company_invites.offer_discount IS 'Whether this invite includes a 20% discount offer';
COMMENT ON FUNCTION increment_discount_credits(UUID) IS 'Atomically increments discount credits for a user when they successfully refer someone';
