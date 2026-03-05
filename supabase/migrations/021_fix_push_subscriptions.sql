-- ============================================================
-- MIGRATION 021: Push Subscriptions + Fix Trigger pg_net
-- Sprint: 2026-03-04 | Projeto: Encontro d'Água Hub Digital
-- ============================================================
-- Garante a tabela push_subscriptions com RLS seguro.
-- Adiciona trigger que notifica via Edge Function quando
-- um novo lead do SDR (source = 'Amazô SDR') é inserido.
-- NOTA: Requer pg_net extension habilitada no Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1. EXTENSÃO pg_net (habilitar se ainda não estiver)
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ------------------------------------------------------------
-- 2. TABELA push_subscriptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    TEXT        NOT NULL,
  p256dh      TEXT        NOT NULL,
  auth        TEXT        NOT NULL,
  device_name TEXT        DEFAULT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Owner pode ler/inserir/deletar suas próprias subscriptions
DROP POLICY IF EXISTS "own_push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "own_push_subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Supabase service_role pode ler todas (para disparo de notificações)
DROP POLICY IF EXISTS "service_read_all" ON public.push_subscriptions;
CREATE POLICY "service_read_all" ON public.push_subscriptions
  FOR SELECT TO service_role USING (true);

-- Índice
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx
  ON public.push_subscriptions(user_id);

-- ------------------------------------------------------------
-- 3. FUNÇÃO: notify_sdr_lead_push
--    Trigger que chama a Edge Function send-push-notification
--    quando um novo lead com source='Amazô SDR' é inserido
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_sdr_lead_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url  TEXT;
  v_service_key   TEXT;
  v_payload       JSONB;
  v_lead_name     TEXT;
BEGIN
  -- Só dispara para leads do SDR
  IF NEW.source IS DISTINCT FROM 'Amazô SDR' THEN
    RETURN NEW;
  END IF;

  -- Nome do lead (tenta briefing_json primeiro)
  v_lead_name := COALESCE(
    NEW.briefing_json->>'name',
    NEW.name,
    'Novo lead'
  );

  -- Payload para a Edge Function
  v_payload := jsonb_build_object(
    'title',  '🔔 Novo Lead SDR!',
    'body',   v_lead_name || ' entrou pelo Amazô SDR',
    'url',    '/boards',
    'lead_id', NEW.id
  );

  -- Chamada assíncrona via pg_net à Edge Function
  -- A URL e a key são lidas das configurações do Supabase Vault
  -- (substitua pelos valores reais caso o Vault não esteja configurado)
  PERFORM extensions.http_post(
    url     := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body    := v_payload::text
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Não bloquear o INSERT em caso de falha no push
  RAISE WARNING 'notify_sdr_lead_push: erro ao enviar notificação: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 4. TRIGGER no INSERT de leads
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS on_sdr_lead_inserted ON public.leads;
CREATE TRIGGER on_sdr_lead_inserted
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_sdr_lead_push();

-- ------------------------------------------------------------
-- 5. CONFIGURAÇÕES do App (facilita troca de URL/key)
-- ------------------------------------------------------------
-- Execute estes comandos separados no SQL Editor caso precise
-- reconfigurar:
--
--   ALTER DATABASE postgres SET app.supabase_url = 'https://<project>.supabase.co';
--   ALTER DATABASE postgres SET app.service_role_key = '<service_role_jwt>';
--
-- Ou configure via Supabase Vault (recomendado para produção).

-- ------------------------------------------------------------
-- 6. VERIFICAÇÃO
-- ------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION 021 CONCLUÍDA ===';
  RAISE NOTICE 'Tabela push_subscriptions: OK';
  RAISE NOTICE 'Trigger on_sdr_lead_inserted: OK';
  RAISE NOTICE '';
  RAISE NOTICE 'PRÓXIMO PASSO: Configure app.supabase_url e app.service_role_key';
  RAISE NOTICE 'no banco OU ative via Supabase Vault.';
  RAISE NOTICE '';
  RAISE NOTICE 'ATENÇÃO: A Edge Function send-push-notification ainda precisa';
  RAISE NOTICE 'ser deployada com: supabase functions deploy send-push-notification';
END $$;
