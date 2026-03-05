-- ============================================================
-- MIGRATION 019: CRM Lead JSON Enriched
-- Sprint: 2026-03-04 | Projeto: Encontro d'Água Hub Digital
-- ============================================================
-- Adiciona briefing_json e linkdagua_user_id nas tabelas
-- contacts e leads para integração com Amazô SDR e Hub LP.
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABELA contacts
-- ------------------------------------------------------------

-- Campo JSON com dados do briefing do SDR/LP
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS briefing_json JSONB DEFAULT NULL;

COMMENT ON COLUMN public.contacts.briefing_json IS
  'Payload do lead vindo do SDR ou LP. Schema: {name, whatsapp, services[], source, landed_via}';

-- ID do usuário no sistema Link d''Água (para buscar qr_codes)
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS linkdagua_user_id TEXT DEFAULT NULL;

COMMENT ON COLUMN public.contacts.linkdagua_user_id IS
  'user_id externo no Link d''Água (linkdagua.com). Usado para vincular qr_codes ao contato.';

-- Índice para buscas rápidas por linkdagua_user_id
CREATE INDEX IF NOT EXISTS contacts_linkdagua_user_id_idx
  ON public.contacts(linkdagua_user_id)
  WHERE linkdagua_user_id IS NOT NULL;

-- Índice GIN para queries no JSON
CREATE INDEX IF NOT EXISTS contacts_briefing_json_idx
  ON public.contacts USING GIN(briefing_json)
  WHERE briefing_json IS NOT NULL;

-- ------------------------------------------------------------
-- 2. TABELA leads
-- ------------------------------------------------------------

-- Campo JSON com dados do briefing (pré-conversão)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS briefing_json JSONB DEFAULT NULL;

COMMENT ON COLUMN public.leads.briefing_json IS
  'Payload do lead antes de ser convertido em contact. Schema: {name, whatsapp, services[], source, landed_via}';

-- ID do usuário no sistema Link d''Água
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS linkdagua_user_id TEXT DEFAULT NULL;

COMMENT ON COLUMN public.leads.linkdagua_user_id IS
  'user_id externo no Link d''Água. Transferido para contacts na conversão.';

CREATE INDEX IF NOT EXISTS leads_linkdagua_user_id_idx
  ON public.leads(linkdagua_user_id)
  WHERE linkdagua_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_source_idx
  ON public.leads(source);

-- Índice para source em contacts (analytics de canal)
CREATE INDEX IF NOT EXISTS contacts_source_idx
  ON public.contacts(source);

-- ------------------------------------------------------------
-- 3. VERIFICAÇÃO
-- ------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION 019 CONCLUÍDA ===';
  RAISE NOTICE 'contacts.briefing_json: %',
    (SELECT column_name FROM information_schema.columns
     WHERE table_name = 'contacts' AND column_name = 'briefing_json');
  RAISE NOTICE 'contacts.linkdagua_user_id: %',
    (SELECT column_name FROM information_schema.columns
     WHERE table_name = 'contacts' AND column_name = 'linkdagua_user_id');
  RAISE NOTICE 'leads.briefing_json: %',
    (SELECT column_name FROM information_schema.columns
     WHERE table_name = 'leads' AND column_name = 'briefing_json');
  RAISE NOTICE 'leads.linkdagua_user_id: %',
    (SELECT column_name FROM information_schema.columns
     WHERE table_name = 'leads' AND column_name = 'linkdagua_user_id');
END $$;
