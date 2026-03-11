-- ════════════════════════════════════════════════════════════════
-- Migration 022: API Keys & Webhook Endpoints tables
-- Date: 2026-03-11
-- Purpose: Enable real API key generation and webhook management
--          from the Settings page (ApiKeysSection + WebhooksSection)
-- ════════════════════════════════════════════════════════════════

-- ── 1. API Keys Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  key_prefix  TEXT NOT NULL,              -- First 16 chars of the key (for display)
  key_hash    TEXT NOT NULL,              -- Full key or hash (MVP: stores full key)
  last_used_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Only company members can see their company's keys
CREATE POLICY "company_members_view_api_keys"
  ON api_keys FOR SELECT
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Only admins can create keys
CREATE POLICY "admins_insert_api_keys"
  ON api_keys FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Only admins can delete keys
CREATE POLICY "admins_delete_api_keys"
  ON api_keys FOR DELETE
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- ── 2. Webhook Endpoints Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  events          TEXT[] NOT NULL DEFAULT ARRAY['lead.created'],
  is_active       BOOLEAN NOT NULL DEFAULT true,
  secret          TEXT DEFAULT NULL,       -- Future: HMAC signing secret
  last_triggered_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for webhook_endpoints
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_members_view_webhooks"
  ON webhook_endpoints FOR SELECT
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "company_members_insert_webhooks"
  ON webhook_endpoints FOR INSERT
  WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "company_members_update_webhooks"
  ON webhook_endpoints FOR UPDATE
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "company_members_delete_webhooks"
  ON webhook_endpoints FOR DELETE
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- ── 3. Helper: capture_hub_lead RPC (for LP Lead Capture) ───────
-- Runs as SECURITY DEFINER to bypass RLS for anonymous form submissions
CREATE OR REPLACE FUNCTION capture_hub_lead(
  p_name        TEXT,
  p_email       TEXT,
  p_phone       TEXT       DEFAULT NULL,
  p_company     TEXT       DEFAULT NULL,
  p_interest    TEXT       DEFAULT 'hub_completo',
  p_source      TEXT       DEFAULT 'cta',
  p_metadata    JSONB      DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id  UUID;
  v_company_id  UUID;
  v_board_id    UUID;
  v_stage_id    UUID;
BEGIN
  -- Get the primary company (owner's company — first company created)
  SELECT id INTO v_company_id FROM companies ORDER BY created_at LIMIT 1;
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'No company found in database';
  END IF;

  -- Check if contact already exists by email
  SELECT id INTO v_contact_id FROM contacts
  WHERE email = p_email AND company_id = v_company_id
  LIMIT 1;

  IF v_contact_id IS NULL THEN
    -- Create new contact
    INSERT INTO contacts (
      name, email, phone, company_name,
      status, stage, source, notes, company_id
    ) VALUES (
      p_name, p_email, p_phone, p_company,
      'ACTIVE', 'LEAD',
      CASE p_source
        WHEN 'cta' THEN 'Hub LP'
        WHEN 'prompt_optimizer' THEN 'Prompt Lab'
        ELSE p_source
      END,
      format('Lead capturado via LP Hub. Interesse: %s.', p_interest),
      v_company_id
    )
    RETURNING id INTO v_contact_id;
  END IF;

  -- Try to create a deal in the first available board
  SELECT id INTO v_board_id FROM boards WHERE company_id = v_company_id ORDER BY created_at LIMIT 1;
  IF v_board_id IS NOT NULL THEN
    SELECT id INTO v_stage_id FROM board_stages WHERE board_id = v_board_id ORDER BY "order" LIMIT 1;
    IF v_stage_id IS NOT NULL THEN
      INSERT INTO deals (
        title, value, contact_id, board_id, stage_id, status,
        company_id, priority, probability, source
      )
      SELECT
        format('%s — %s', p_name, p_interest),
        0,
        v_contact_id,
        v_board_id,
        v_stage_id,
        v_stage_id,
        v_company_id,
        'medium',
        10,
        'Hub LP'
      WHERE NOT EXISTS (
        SELECT 1 FROM deals
        WHERE contact_id = v_contact_id AND company_id = v_company_id
          AND status != 'CLOSED_LOST'
        LIMIT 1
      );
    END IF;
  END IF;

  -- Also save to waitlist for email marketing
  INSERT INTO waitlist (email, name, source, interest, metadata)
  VALUES (p_email, p_name, p_source, p_interest, p_metadata)
  ON CONFLICT (email) DO NOTHING;

  RETURN v_contact_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but don't fail — save to waitlist at minimum
    INSERT INTO waitlist (email, name, source, interest, metadata)
    VALUES (p_email, p_name, p_source, p_interest, p_metadata)
    ON CONFLICT (email) DO NOTHING;
    RETURN NULL;
END;
$$;

-- Grant RPC access to anonymous users (LP form can call it)
GRANT EXECUTE ON FUNCTION capture_hub_lead TO anon;
GRANT EXECUTE ON FUNCTION capture_hub_lead TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

SELECT 'Migration 022 applied: api_keys, webhook_endpoints, capture_hub_lead RPC' AS result;
