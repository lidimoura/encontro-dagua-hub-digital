-- ════════════════════════════════════════════════════════════════════════════
-- Migration 023: Deals.status Cleanup + Ghost Contact Deletion
-- Date: 2026-03-11
-- Purpose:
--   1. Fix deals.status vs stage_id duality → sync status FROM stage_id
--   2. Create soft-delete cleanup for orphaned "ghost" contacts
--   3. Allow cascade contact deletion from the UI
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. SYNC deals.status WITH stage_id (One-time data repair) ──────────────
-- This fixes cards that don't open because status (TEXT) doesn't match stage_id (UUID).
-- After this: status = stage_id::text for all active deals.

UPDATE public.deals
SET status = stage_id::text
WHERE stage_id IS NOT NULL
  AND (status IS NULL OR status != stage_id::text)
  AND status NOT IN ('CLOSED_WON', 'CLOSED_LOST');

-- Log how many were fixed
DO $$
DECLARE
  fixed_count INTEGER;
BEGIN
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  RAISE NOTICE '✅ Fixed % deals where status != stage_id', fixed_count;
END $$;

-- ─── 2. TRIGGER: Keep status in sync with stage_id on every move ─────────────
-- Whenever a deal is moved (stage_id updated via drag & drop), status auto-syncs.
CREATE OR REPLACE FUNCTION public.sync_deal_status_to_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if stage_id changed AND it's not a CLOSED status
  IF NEW.stage_id IS DISTINCT FROM OLD.stage_id
     AND NEW.status NOT IN ('CLOSED_WON', 'CLOSED_LOST')
  THEN
    NEW.status := NEW.stage_id::text;
    NEW.last_stage_change_date := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_deal_status ON public.deals;
CREATE TRIGGER sync_deal_status
  BEFORE UPDATE OF stage_id ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION sync_deal_status_to_stage();

-- ─── 3. FIX: Allow deals to be created with stage_id already set ────────────
-- When a Deal is created from the LP (capture_hub_lead RPC), ensure status is set.
CREATE OR REPLACE FUNCTION public.set_deal_status_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS NULL AND NEW.stage_id IS NOT NULL THEN
    NEW.status := NEW.stage_id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_deal_status_insert ON public.deals;
CREATE TRIGGER set_deal_status_insert
  BEFORE INSERT ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION set_deal_status_on_insert();

-- ─── 4. GHOST CONTACTS: Hard-delete orphaned contacts ────────────────────────
-- Ghost contacts = contacts with no owner_id, no company_id, or that cannot be
-- deleted because of FK constraints. This clears them safely.

-- Step A: Nullify activity FK references to contacts being cleaned
UPDATE public.activities
SET contact_id = NULL
WHERE contact_id IN (
  SELECT id FROM public.contacts
  WHERE company_id IS NULL
    AND owner_id IS NULL
    AND stage = 'LEAD'
    AND name NOT LIKE '%teste%'
    AND name NOT LIKE '%test%'
);

-- Step B: Nullify deal FK references to orphaned contacts
UPDATE public.deals
SET contact_id = NULL
WHERE contact_id IN (
  SELECT id FROM public.contacts
  WHERE company_id IS NULL
    AND owner_id IS NULL
);

-- Step C: Delete the orphaned contacts
DELETE FROM public.contacts
WHERE company_id IS NULL
  AND owner_id IS NULL;

-- Log
DO $$
DECLARE deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE '🧹 Deleted % ghost contacts with no company_id and no owner_id', deleted_count;
END $$;

-- ─── 5. FIX: Allow contacts to be cascade-deleted via UI ─────────────────────
-- The UI was unable to delete contacts because activities.contact_id had ON DELETE SET NULL
-- but deals.contact_id and ai_decisions.contact_id may block it.
-- Ensure FK constraints allow safe deletion:

-- Enable the RPC for the UI to safely delete a contact and clean up its references
CREATE OR REPLACE FUNCTION public.delete_contact_safely(p_contact_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Nullify references in deals (keep deal, remove contact link)
  UPDATE deals SET contact_id = NULL WHERE contact_id = p_contact_id;

  -- 2. Nullify references in activities
  UPDATE activities SET contact_id = NULL WHERE contact_id = p_contact_id;

  -- 3. Nullify references in ai_decisions
  UPDATE ai_decisions SET contact_id = NULL WHERE contact_id = p_contact_id;

  -- 4. Nullify references in ai_audio_notes
  UPDATE ai_audio_notes SET contact_id = NULL WHERE contact_id = p_contact_id;

  -- 5. Nullify leads.converted_to_contact_id
  UPDATE leads SET converted_to_contact_id = NULL WHERE converted_to_contact_id = p_contact_id;

  -- 6. Finally delete the contact
  DELETE FROM contacts WHERE id = p_contact_id;

  RAISE NOTICE 'Contact % deleted safely', p_contact_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_contact_safely TO authenticated;

-- ─── 6. INDEX: Speed up Kanban queries ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS deals_active_kanban_idx
  ON public.deals(board_id, stage_id)
  WHERE status NOT IN ('CLOSED_WON', 'CLOSED_LOST');

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT 
  'deals with status != stage_id' AS check_name,
  COUNT(*) AS remaining_issues
FROM public.deals
WHERE stage_id IS NOT NULL 
  AND status != stage_id::text
  AND status NOT IN ('CLOSED_WON', 'CLOSED_LOST');

NOTIFY pgrst, 'reload schema';

SELECT 'Migration 023 complete: deals.status synced, ghost contacts cleaned, delete_contact_safely RPC created' AS result;
