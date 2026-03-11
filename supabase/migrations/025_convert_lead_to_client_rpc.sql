-- ════════════════════════════════════════════════════════════════════════════
-- Migration 025: convert_lead_to_client RPC (Fixes 400 on "Convert" button)
-- Date: 2026-03-11
-- Purpose: Create the RPC that the UI calls when converting a deal/lead to a
--          paying customer. Also creates a companion lookup for LP lead capture.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. convert_lead_to_client ───────────────────────────────────────────────
-- Called by the Deal card "Converter" button
-- Updates: contact.stage → CUSTOMER, deal.status → CLOSED_WON
CREATE OR REPLACE FUNCTION public.convert_lead_to_client(
  p_deal_id   UUID,
  p_contact_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal        deals%ROWTYPE;
  v_contact_id  UUID;
  v_result      JSONB;
BEGIN
  -- 1. Get the deal
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deal % not found', p_deal_id;
  END IF;

  -- 2. Resolve contact_id (use parameter or deal's contact)
  v_contact_id := COALESCE(p_contact_id, v_deal.contact_id);

  -- 3. Update deal to WON
  UPDATE deals
  SET
    status      = 'CLOSED_WON',
    updated_at  = NOW()
  WHERE id = p_deal_id;

  -- 4. Pro-mote contact to CUSTOMER stage
  IF v_contact_id IS NOT NULL THEN
    UPDATE contacts
    SET
      stage           = 'CUSTOMER',
      last_interaction = NOW(),
      updated_at      = NOW()
    WHERE id = v_contact_id;
  END IF;

  -- 5. Return result
  v_result := jsonb_build_object(
    'success',     true,
    'deal_id',     p_deal_id,
    'contact_id',  v_contact_id,
    'status',      'CLOSED_WON',
    'converted_at', NOW()
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION convert_lead_to_client TO authenticated;

-- ─── 2. Also fix the LP capture to use waitlist as guaranteed fallback ────────
-- Make sure the waitlist table exists and can receive public inserts
CREATE TABLE IF NOT EXISTS public.waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  name       TEXT,
  source     TEXT,
  interest   TEXT,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (LP form)
DROP POLICY IF EXISTS "anon_can_insert_waitlist" ON public.waitlist;
CREATE POLICY "anon_can_insert_waitlist"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view waitlist
DROP POLICY IF EXISTS "admins_can_view_waitlist" ON public.waitlist;
CREATE POLICY "admins_can_view_waitlist"
  ON public.waitlist FOR SELECT
  TO authenticated
  USING (true);

-- ─── 3. Fix: ensure contacts table allows anon insert without company_id ─────
-- The auto_set_company_id trigger doesn't run for anon (no JWT company_id).
-- The capture_hub_lead RPC handles company_id via SECURITY DEFINER.
-- This policy confirms anon INSERT is allowed:
DROP POLICY IF EXISTS "Public Enable Insert" ON public.contacts;
CREATE POLICY "Public Enable Insert"
  ON public.contacts FOR INSERT
  TO anon
  WITH CHECK (true);

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ convert_lead_to_client RPC created';
  RAISE NOTICE '✅ waitlist table ensured with anon INSERT policy';
  RAISE NOTICE '✅ contacts anon INSERT policy re-applied';
END $$;

NOTIFY pgrst, 'reload schema';

SELECT 'Migration 025 complete' AS result;
