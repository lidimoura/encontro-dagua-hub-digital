-- ============================================================
-- 035_push_app_source_and_currency.sql
-- Date: 2026-03-25
-- Purpose:
--   1. Add app_source to push_subscriptions for multi-tenant
--      notification routing (crm-hub vs link-dagua).
--   2. Add preferred_currency to user_settings for Demo onboarding.
--   3. Recreate push trigger functions to include app_source payload.
-- ============================================================

-- ─── 1. push_subscriptions.app_source ───────────────────────
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS app_source TEXT NOT NULL DEFAULT 'crm-hub';

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_app_source
  ON public.push_subscriptions (app_source);

-- ─── 2. user_settings.preferred_currency ───────────────────
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'BRL';

-- ─── 3. Recreate notify_new_lead_push with app_source ───────
-- (replaces the version created in migration 028)
CREATE OR REPLACE FUNCTION public.notify_new_lead_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url TEXT := current_setting('app.settings.supabase_url', TRUE);
  v_service_key  TEXT := current_setting('app.settings.service_role_key', TRUE);
  v_payload      JSONB;
BEGIN
  IF NEW.source IN ('Hub LP', 'Prompt Lab', 'cta', 'landing_page')
     OR (NEW.stage IN ('LEAD', 'NEW') AND OLD IS NULL) THEN

    v_payload := jsonb_build_object(
      'title',      '🔔 Novo Lead Capturado!',
      'notifBody',  format('%s acabou de se cadastrar pelo Hub.', COALESCE(NEW.name, NEW.email)),
      'url',        '/boards',
      'app_source', 'crm-hub'
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

-- ─── 4. Recreate notify_new_activity_push with app_source ───
CREATE OR REPLACE FUNCTION public.notify_new_activity_push()
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

  IF v_activity_date BETWEEN CURRENT_DATE AND v_tomorrow THEN
    v_payload := jsonb_build_object(
      'title',      format('📅 %s agendado pelo Mazô',
                          CASE NEW.type
                            WHEN 'CALL'    THEN 'Ligação'
                            WHEN 'MEETING' THEN 'Reunião'
                            WHEN 'EMAIL'   THEN 'Email'
                            ELSE 'Tarefa'
                          END),
      'notifBody',  COALESCE(NEW.title, 'Nova atividade agendada'),
      'url',        '/activities',
      'app_source', 'crm-hub'
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

-- ─── 5. Re-attach triggers (idempotent) ─────────────────────
DROP TRIGGER IF EXISTS trg_push_new_lead ON public.contacts;
CREATE TRIGGER trg_push_new_lead
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_lead_push();

DROP TRIGGER IF EXISTS trg_push_new_activity ON public.activities;
CREATE TRIGGER trg_push_new_activity
  AFTER INSERT ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_activity_push();

-- ─── VERIFY ──────────────────────────────────────────────────
SELECT 'Migration 035 complete: push app_source + preferred_currency' AS result;
