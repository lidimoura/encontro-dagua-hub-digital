-- ════════════════════════════════════════════════════════════════════════════
-- Migration 028: Auto Push Notifications via pg_net
-- Date: 2026-03-11
-- Purpose: Trigger send-push-notification Edge Function automatically when:
--   1. A new lead is captured via LP (INSERT on contacts with source='Hub LP')
--   2. A new activity is created (INSERT on activities)
--
-- Requires: pg_net extension + push_subscriptions table (migration 027)
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Enable pg_net extension (HTTP calls from Postgres) ───────────────────
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─── 2. Trigger function: notify on new LP lead ──────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_lead_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url TEXT := current_setting('app.settings.supabase_url', TRUE);
  v_service_key  TEXT := current_setting('app.settings.service_role_key', TRUE);
  v_payload      JSONB;
BEGIN
  -- Only notify for leads coming from external sources (LP, SDR forms)
  IF NEW.source IN ('Hub LP', 'Prompt Lab', 'cta', 'landing_page') 
     OR (NEW.stage IN ('LEAD', 'NEW') AND OLD IS NULL) THEN

    v_payload := jsonb_build_object(
      'title',     '🔔 Novo Lead Capturado!',
      'notifBody', format('%s acabou de se cadastrar pelo Hub. Veja no CRM agora.', COALESCE(NEW.name, NEW.email)),
      'url',       '/boards'
    );

    -- Fire HTTP call to Edge Function (non-blocking)
    PERFORM net.http_post(
      url     := COALESCE(v_supabase_url, '') || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || COALESCE(v_service_key, '')
      ),
      body    := v_payload
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ─── 3. Attach trigger to contacts table ─────────────────────────────────────
DROP TRIGGER IF EXISTS trg_push_new_lead ON public.contacts;
CREATE TRIGGER trg_push_new_lead
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead_push();

-- ─── 4. Trigger function: notify on new activity (reminders) ─────────────────
CREATE OR REPLACE FUNCTION notify_new_activity_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url TEXT := current_setting('app.settings.supabase_url', TRUE);
  v_service_key  TEXT := current_setting('app.settings.service_role_key', TRUE);
  v_payload      JSONB;
  v_activity_date DATE;
  v_tomorrow      DATE := CURRENT_DATE + 1;
BEGIN
  v_activity_date := (NEW.date AT TIME ZONE 'America/Manaus')::DATE;

  -- Only notify for activities scheduled for today or tomorrow (upcoming reminders)
  IF v_activity_date BETWEEN CURRENT_DATE AND v_tomorrow THEN
    v_payload := jsonb_build_object(
      'title',     format('📅 %s agendado pelo Mazô', 
                          CASE NEW.type 
                            WHEN 'CALL'    THEN 'Ligação'
                            WHEN 'MEETING' THEN 'Reunião'
                            WHEN 'EMAIL'   THEN 'Email'
                            ELSE 'Tarefa'
                          END),
      'notifBody', COALESCE(NEW.title, 'Nova atividade agendada'),
      'url',       '/activities'
    );

    PERFORM net.http_post(
      url     := COALESCE(v_supabase_url, '') || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || COALESCE(v_service_key, '')
      ),
      body    := v_payload
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ─── 5. Attach trigger to activities table ───────────────────────────────────
DROP TRIGGER IF EXISTS trg_push_new_activity ON public.activities;
CREATE TRIGGER trg_push_new_activity
  AFTER INSERT ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_activity_push();

-- ─── 6. Set app.settings so the triggers know the Supabase URL ───────────────
-- (Run this section ONCE manually with your actual values, or set via Supabase dashboard)
-- IMPORTANT: Replace the values below with your actual Supabase project details
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://YOUR_PROJECT_REF.supabase.co';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT 
  trigger_name, 
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name IN ('trg_push_new_lead', 'trg_push_new_activity')
ORDER BY trigger_name;

NOTIFY pgrst, 'reload schema';
SELECT 'Migration 028 complete: push triggers for leads + activities' AS result;
