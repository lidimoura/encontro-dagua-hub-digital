-- ============================================================================
-- MIGRATION 061: KILL TRIGGER RECURSION — pg_trigger_depth() GUARD
-- ============================================================================
-- DATE: 2026-05-13
--
-- ROOT CAUSE OF XX000 OOM (CONFIRMED):
--   The OOM is NOT RLS (fixed in 060). It's a TRIGGER CHAIN that creates
--   a recursive INSERT loop:
--
--   auth.users INSERT
--     → handle_new_user() [AFTER INSERT on auth.users]
--       → INSERT INTO profiles
--         → plg_new_lead_trigger [AFTER INSERT on profiles]
--           → INSERT INTO contacts (SA's company_id)
--             → auto_company_id trigger [BEFORE INSERT on contacts]
--               → SELECT FROM profiles (reads SA's company_id)
--               → This SELECT triggers profiles RLS evaluation
--               → Profiles RLS evaluates JWT claims for the NEW user
--               → The NEW user's profile row may not be committed yet
--               → PostgreSQL enters recursive evaluation → OOM
--
--   ADDITIONALLY:
--     → trg_push_new_lead [AFTER INSERT on contacts]
--       → net.http_post() to Edge Function
--       → If pg_net is misconfigured → blocks the transaction
--
-- SOLUTION:
--   1. Add pg_trigger_depth() guards to ALL triggers that can chain:
--      - auto_set_company_id: only fire at depth <= 1
--      - plg_new_lead_to_super_admin_crm: only fire at depth <= 1
--      - notify_new_lead_push: only fire at depth <= 1
--   2. These guards break the chain: if a trigger is already inside
--      another trigger, it returns immediately without doing work.
--   3. Also disable trg_push_new_lead since pg_net may not be available.
--
-- GOLDEN RULE:
--   ANY trigger that does INSERT/SELECT on another RLS-enabled table
--   MUST check pg_trigger_depth() < 2 before executing.
-- ============================================================================

BEGIN;

RAISE NOTICE '[061] ═══════════════════════════════════════════════';
RAISE NOTICE '[061] KILLING TRIGGER RECURSION — pg_trigger_depth() GUARDS';
RAISE NOTICE '[061] ═══════════════════════════════════════════════';


-- ============================================================
-- FIX 1: auto_set_company_id — DEPTH GUARD + JWT-first
-- This trigger fires on BEFORE INSERT for contacts, deals,
-- boards, crm_companies, activities. It must NEVER recursively
-- read profiles when called from inside another trigger.
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_set_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_jwt_company text;
BEGIN
  -- DEPTH GUARD: if we're inside a nested trigger (depth >= 2),
  -- skip the profiles lookup entirely. The caller (e.g. PLG trigger)
  -- should have already set company_id explicitly.
  IF NEW.company_id IS NOT NULL THEN
    RETURN NEW;  -- already set, nothing to do
  END IF;

  -- Only attempt auto-fill at trigger depth <= 1
  -- (depth 0 = direct INSERT, depth 1 = one level of trigger nesting)
  IF pg_trigger_depth() > 1 THEN
    RAISE NOTICE '[auto_set_company_id] Skipping at trigger depth % — company_id must be set by caller', pg_trigger_depth();
    RETURN NEW;  -- let the INSERT proceed without company_id (nullable)
  END IF;

  -- PRIMARY: Read from JWT claim (zero query, zero loop risk)
  v_jwt_company := auth.jwt() ->> 'company_id';
  IF v_jwt_company IS NOT NULL AND v_jwt_company != '' THEN
    BEGIN
      v_company_id := v_jwt_company::uuid;
    EXCEPTION WHEN others THEN
      v_company_id := NULL;
    END;
  END IF;

  -- FALLBACK: SECURITY DEFINER bypasses RLS, safe to read profiles
  -- BUT only at depth 0 (direct user INSERT)
  IF v_company_id IS NULL AND pg_trigger_depth() <= 0 THEN
    SELECT p.company_id INTO v_company_id
    FROM public.profiles p
    WHERE p.id = auth.uid()
    LIMIT 1;
  END IF;

  NEW.company_id := v_company_id;
  RETURN NEW;
END;
$$;

RAISE NOTICE '[061] ✅ auto_set_company_id rebuilt with depth guard.';


-- ============================================================
-- FIX 2: plg_new_lead_to_super_admin_crm — DEPTH GUARD
-- This is the PRIMARY culprit. It fires AFTER INSERT on profiles
-- and does INSERT INTO contacts + INSERT INTO deals.
-- Those INSERTs fire auto_company_id + trg_push_new_lead triggers,
-- creating the recursion chain.
-- ============================================================

CREATE OR REPLACE FUNCTION public.plg_new_lead_to_super_admin_crm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sa_user_id      UUID;
  v_sa_company_id   UUID;
  v_board_id        UUID;
  v_first_stage_id  UUID;
  v_contact_id      UUID;
  v_deal_id         UUID;
  v_lead_name       TEXT;
  v_lead_email      TEXT;
BEGIN
  -- ═══ DEPTH GUARD ═══
  -- If we're already inside a trigger chain (e.g. handle_new_user → profiles INSERT),
  -- AND we're deeper than 1, skip to prevent recursive INSERT loops.
  -- Normal signup chain: auth.users (depth 0) → handle_new_user (depth 1) → profiles INSERT → this trigger (depth 2)
  -- So depth 2 is expected. But if this trigger causes ANOTHER trigger at depth 3+, that's the loop.
  -- We allow depth <= 2 but guard against depth > 2.
  IF pg_trigger_depth() > 2 THEN
    RAISE NOTICE '[PLG] Skipping at trigger depth % to prevent recursion', pg_trigger_depth();
    RETURN NEW;
  END IF;

  -- Skip for super admins
  IF NEW.is_super_admin = true OR NEW.role = 'super_admin' THEN
    RETURN NEW;
  END IF;

  -- Find Super Admin
  SELECT id, company_id
  INTO v_sa_user_id, v_sa_company_id
  FROM public.profiles
  WHERE is_super_admin = true
  LIMIT 1;

  IF v_sa_user_id IS NULL OR v_sa_company_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find SA's first board
  SELECT id INTO v_board_id
  FROM public.boards
  WHERE company_id = v_sa_company_id
    AND deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_board_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find first stage
  SELECT id INTO v_first_stage_id
  FROM public.board_stages
  WHERE board_id = v_board_id
  ORDER BY position ASC
  LIMIT 1;

  v_lead_name  := COALESCE(NEW.full_name, split_part(NEW.email, '@', 1), 'Lead SaaS');
  v_lead_email := COALESCE(NEW.email, '');

  -- Insert contact — company_id is SET EXPLICITLY to avoid auto_company_id trigger
  -- doing a profiles lookup at depth 3
  INSERT INTO public.contacts (
    name, email, source, notes, company_id, status,
    last_purchase_date, created_at, updated_at
  )
  VALUES (
    v_lead_name,
    v_lead_email,
    'SaaS Trial',
    'Lead cadastrado automaticamente pelo PLG auto-CRM.',
    v_sa_company_id,  -- EXPLICIT: no trigger needed
    'ACTIVE',
    now(), now(), now()
  )
  RETURNING id INTO v_contact_id;

  -- Insert deal — company_id is SET EXPLICITLY
  INSERT INTO public.deals (
    title, contact_name, contact_email, company_id, board_id, stage_id,
    status, tags, source, notes, created_at, updated_at
  )
  VALUES (
    '[SaaS Trial] ' || v_lead_name,
    v_lead_name,
    v_lead_email,
    v_sa_company_id,  -- EXPLICIT: no trigger needed
    v_board_id,
    v_first_stage_id,
    'OPEN',
    ARRAY['SaaS Trial', 'PLG', 'Auto-CRM'],
    'SaaS Trial',
    'Deal criado automaticamente pelo PLG trigger.',
    now(), now()
  )
  RETURNING id INTO v_deal_id;

  -- Notification — safe, no RLS triggers
  INSERT INTO public.in_app_notifications (
    user_id, company_id, type, title, body, link, source_id
  )
  VALUES (
    v_sa_user_id,
    v_sa_company_id,
    'novo_lead',
    '🌿 Novo Lead SaaS: ' || v_lead_name,
    'Lead cadastrado via Provadágua Showcase. E-mail: ' || v_lead_email,
    '/boards',
    v_deal_id
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[PLG] Erro no trigger plg_new_lead (não-fatal): % [%]', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

RAISE NOTICE '[061] ✅ plg_new_lead_to_super_admin_crm rebuilt with depth guard.';


-- ============================================================
-- FIX 3: DISABLE trg_push_new_lead on contacts
-- This trigger calls net.http_post() which can block/fail if
-- pg_net is not configured. It fires AFTER INSERT on contacts,
-- including the INSERT from the PLG trigger above.
-- We disable it to break the chain. Push notifications should
-- be handled by the frontend or a separate Edge Function.
-- ============================================================

DROP TRIGGER IF EXISTS trg_push_new_lead ON public.contacts;
RAISE NOTICE '[061] ✅ trg_push_new_lead DISABLED on contacts (was calling pg_net inside trigger chain).';


-- ============================================================
-- FIX 4: DISABLE on_sdr_lead_inserted on leads
-- Same issue: calls net.http_post() which may block.
-- ============================================================

DROP TRIGGER IF EXISTS on_sdr_lead_inserted ON public.leads;
RAISE NOTICE '[061] ✅ on_sdr_lead_inserted DISABLED on leads.';


-- ============================================================
-- FIX 5: Re-apply all auto_company_id triggers (with new depth-guarded function)
-- ============================================================

DROP TRIGGER IF EXISTS auto_company_id ON public.contacts;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.crm_companies;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.deals;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.boards;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.activities;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

RAISE NOTICE '[061] ✅ auto_company_id triggers re-applied (depth-guarded).';


-- ============================================================
-- FIX 6: Re-apply PLG trigger (with depth-guarded function)
-- ============================================================

DROP TRIGGER IF EXISTS plg_new_lead_trigger ON public.profiles;
CREATE TRIGGER plg_new_lead_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.plg_new_lead_to_super_admin_crm();

RAISE NOTICE '[061] ✅ plg_new_lead_trigger re-applied (depth-guarded).';


COMMIT;


-- ============================================================
-- VERIFICATION (execute AFTER commit)
-- ============================================================

-- 1. List ALL triggers on CRM tables — confirm no push triggers remain
SELECT
  trigger_name,
  event_object_table AS "table",
  action_timing || ' ' || event_manipulation AS "when",
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('contacts', 'deals', 'boards', 'profiles', 'crm_companies', 'activities', 'leads')
ORDER BY event_object_table, trigger_name;

-- 2. Confirm auto_set_company_id has pg_trigger_depth() guard
SELECT prosrc LIKE '%pg_trigger_depth%' AS has_depth_guard
FROM pg_proc
WHERE proname = 'auto_set_company_id'
  AND pronamespace = 'public'::regnamespace;

-- 3. Confirm PLG function has depth guard
SELECT prosrc LIKE '%pg_trigger_depth%' AS has_depth_guard
FROM pg_proc
WHERE proname = 'plg_new_lead_to_super_admin_crm'
  AND pronamespace = 'public'::regnamespace;

-- 4. SMOKE TEST: This INSERT must NOT hang or OOM
-- (run as authenticated user in SQL Editor)
-- INSERT INTO public.contacts (name, email, company_id, status, last_purchase_date)
-- VALUES ('Test OOM Fix', 'test@oom.fix', (auth.jwt() ->> 'company_id')::uuid, 'ACTIVE', now());
-- DELETE FROM public.contacts WHERE email = 'test@oom.fix';
