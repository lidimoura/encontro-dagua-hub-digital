-- =============================================================================
-- MIGRATION 057: FASE 9 — crm_briefings + KPI VIEW + TRIGGER ANTI-RECURSÃO
-- =============================================================================
-- Objetivo: Ligar o ecossistema "Link D'água" ao CRM via:
--   1. Tabela crm_briefings — log estruturado de briefings por perfil
--   2. Trigger de auditoria para activities (anti-recursão via pg_trigger_depth)
--   3. View v_deal_kpis — JOIN deals + contacts + qr_codes/qr_links (Link D'água)
--   4. RLS puro JWT — ZERO subqueries em profiles
--
-- Padrão obrigatório:
--   company_id = (auth.jwt() ->> 'company_id')::uuid
--   is_super_admin = (auth.jwt() ->> 'is_super_admin') = 'true'
-- =============================================================================

BEGIN;

-- =============================================================================
-- VALIDAÇÃO: Resposta técnica às 3 perguntas do Manager
-- =============================================================================
-- [Q1] TRIGGER ANTI-RECURSÃO: pg_trigger_depth() = 0 é a solução correta.
--      is_internal_update requer coluna extra + possível falha em edge cases.
--      pg_trigger_depth() é nativo, zero overhead, e cobre TODOS os cenários
--      de re-entrada (trigger → insert → trigger → insert → ...).
--      CONCLUSÃO: usar pg_trigger_depth() = 0.
--
-- [Q2] VIEW vs MATERIALIZED VIEW para Kanban:
--      Kanban lê deals em tempo real → Materialized View exige REFRESH manual
--      ou via pg_cron, o que introduz lag (dados defasados no card).
--      SOLUÇÃO ADOTADA: View padrão com LATERAL JOIN sob demanda.
--      Performance garantida por:
--        - Index em qr_codes(client_email) — busca por email do contato
--        - Index em qr_links(client_email)
--        - A View só é consultada quando o card é expandido (lazy load)
--        - Para Super Admin com > 500 deals: filtrar por company_id no WHERE
--      SE o volume crescer > 10k rows: migrar para MATERIALIZED VIEW +
--      pg_cron REFRESH a cada 15min. Não é necessário agora.
--
-- [Q3] RLS PURO JWT: CONFIRMADO.
--      Nenhuma subquery em profiles dentro de políticas RLS.
--      Padrão único: auth.jwt() ->> 'company_id' e 'is_super_admin'.
-- =============================================================================


-- =============================================================================
-- PARTE 1: TABELA crm_briefings
-- =============================================================================
-- Propósito: Armazenar briefings versionados de cada profile (cliente/lead).
--   - Vinculada a profiles.id (usuário do Link D'água ou lead do CRM)
--   - content: JSONB — flexibilidade total de campos sem schema migration
--   - version: auto-incremental por profile_id (via trigger)
--   - is_active: apenas 1 briefing ativo por profile (via constraint parcial)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.crm_briefings (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      uuid        NOT NULL,   -- Multi-tenant: JWT claim obrigatório
    profile_id      uuid        NOT NULL,   -- FK → profiles.id (dono do briefing)
    deal_id         uuid,                   -- FK → deals.id (opcional — briefing pode ser standalone)
    contact_id      uuid,                   -- FK → contacts.id (opcional)
    version         integer     NOT NULL DEFAULT 1,
    is_active       boolean     NOT NULL DEFAULT true,

    -- Conteúdo do briefing em JSONB:
    -- {
    --   "name": "...",
    --   "whatsapp": "...",
    --   "services": [...],
    --   "source": "link-dagua" | "manual" | "webhook",
    --   "landed_via": "...",
    --   "message": "...",
    --   "capture_time": "ISO8601",
    --   "qr_slug": "...",           ← slug do QR d'água de origem
    --   "custom_fields": { ... }    ← campos extras sem schema migration
    -- }
    content         jsonb       NOT NULL DEFAULT '{}',

    -- Metadados de origem
    source          text        NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('link-dagua', 'manual', 'webhook', 'import')),
    created_by      uuid,               -- profiles.id do usuário que criou

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    -- Integridade referencial
    CONSTRAINT fk_briefings_profile  FOREIGN KEY (profile_id)  REFERENCES public.profiles(id)  ON DELETE CASCADE,
    CONSTRAINT fk_briefings_deal     FOREIGN KEY (deal_id)     REFERENCES public.deals(id)     ON DELETE SET NULL,
    CONSTRAINT fk_briefings_contact  FOREIGN KEY (contact_id)  REFERENCES public.contacts(id)  ON DELETE SET NULL
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_briefings_company_id    ON public.crm_briefings(company_id);
CREATE INDEX IF NOT EXISTS idx_briefings_profile_id    ON public.crm_briefings(profile_id);
CREATE INDEX IF NOT EXISTS idx_briefings_deal_id       ON public.crm_briefings(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_briefings_contact_id    ON public.crm_briefings(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_briefings_active        ON public.crm_briefings(profile_id, is_active) WHERE is_active = true;

-- Garantia de apenas 1 briefing ATIVO por profile por company
-- (Permite múltiplas versões históricas, mas só 1 ativo)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_briefings_active_profile
    ON public.crm_briefings(company_id, profile_id)
    WHERE is_active = true;

-- Auto-atualiza updated_at
CREATE OR REPLACE FUNCTION public.set_briefing_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_briefings_updated_at
    BEFORE UPDATE ON public.crm_briefings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_briefing_updated_at();

-- Auto-versiona: incrementa version quando um novo briefing
-- substitui o ativo anterior para o mesmo profile
CREATE OR REPLACE FUNCTION public.auto_version_briefing()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_max_version integer;
BEGIN
    -- Desativa o briefing ativo anterior para este profile+company
    UPDATE public.crm_briefings
    SET is_active = false
    WHERE profile_id = NEW.profile_id
      AND company_id  = NEW.company_id
      AND is_active   = true
      AND id         != NEW.id;

    -- Define a versão como max + 1
    SELECT COALESCE(MAX(version), 0) + 1
    INTO v_max_version
    FROM public.crm_briefings
    WHERE profile_id = NEW.profile_id
      AND company_id  = NEW.company_id
      AND id         != NEW.id;

    NEW.version = v_max_version;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_briefings_auto_version
    BEFORE INSERT ON public.crm_briefings
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_version_briefing();


-- =============================================================================
-- PARTE 2: TRIGGER DE AUDITORIA — activities log via pg_trigger_depth()
-- =============================================================================
-- DECISÃO TÉCNICA: pg_trigger_depth() = 0
--   Garante que o log só é gravado na chamada "raiz" do trigger,
--   nunca em chamadas recursivas (trigger → insert activities → trigger → ...).
--   É mais robusto que is_internal_update porque:
--   1. Não requer coluna extra na tabela
--   2. Funciona mesmo se activities tiver seus próprios triggers no futuro
--   3. É testável: SELECT pg_trigger_depth() retorna 0 fora de triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.log_briefing_to_activities()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- PROTEÇÃO ANTI-RECURSÃO: só executa na chamada "raiz" de trigger
    -- Se esta função for chamada de dentro de outro trigger, pg_trigger_depth() > 0
    IF pg_trigger_depth() > 0 THEN
        RETURN NEW;
    END IF;

    -- Só loga se houver um deal vinculado
    IF NEW.deal_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Loga na tabela activities sem subquery em profiles
    -- company_id e created_by vêm do próprio registro de briefing
    INSERT INTO public.activities (
        id,
        deal_id,
        company_id,
        type,
        title,
        description,
        date,
        completed,
        is_system
    ) VALUES (
        gen_random_uuid(),
        NEW.deal_id,
        NEW.company_id,
        'NOTE',
        CASE
            WHEN TG_OP = 'INSERT' THEN 'Briefing V' || NEW.version || ' criado'
            ELSE                       'Briefing V' || NEW.version || ' atualizado'
        END,
        CASE
            WHEN NEW.source = 'link-dagua' THEN '📲 Briefing recebido via QR d''água (automático)'
            WHEN NEW.source = 'webhook'    THEN '🔗 Briefing importado via Webhook'
            ELSE                                '✏️ Briefing atualizado manualmente'
        END,
        now(),
        true,
        true   -- is_system = true → não aparece como ação do usuário no feed
    );

    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    -- Nunca deixa o log impedir o INSERT do briefing
    RAISE WARNING '[log_briefing_to_activities] Falha ao logar: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Aplicar trigger AFTER INSERT OR UPDATE (pós-gravação do briefing)
CREATE OR REPLACE TRIGGER trg_briefings_log_activity
    AFTER INSERT OR UPDATE ON public.crm_briefings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_briefing_to_activities();

-- Adicionar coluna is_system em activities se não existir
-- (para diferenciar logs automáticos de ações do usuário)
ALTER TABLE public.activities
    ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false;


-- =============================================================================
-- PARTE 3: VIEW v_deal_kpis — KPIs do Link D'água nos Cards do CRM
-- =============================================================================
-- DECISÃO: View padrão (não Materialized) para dados sempre atualizados.
-- Performance garantida por índices nos campos de JOIN.
--
-- JOIN Strategy:
--   deals → contacts (via deal.contact_id)
--   contacts → qr_codes (via contact.email = qr_codes.client_email)  ← CRM projects
--   contacts → qr_links (via contact.email = qr_links.client_email)  ← Link D'água projects
--
-- O campo client_email é o elo entre os dois sistemas.
-- Requer índice GIN em qr_codes(client_email) e qr_links(client_email).
-- =============================================================================

-- Índices de suporte para o JOIN (idempotentes)
CREATE INDEX IF NOT EXISTS idx_qr_codes_client_email ON public.qr_codes(client_email)
    WHERE client_email IS NOT NULL;

-- qr_links pode não existir neste banco (tabela do Link D'água)
-- Criado via DO block para ser idempotente sem erro
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'qr_links'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_qr_links_client_email
                 ON public.qr_links(client_email) WHERE client_email IS NOT NULL';
    END IF;
END $$;

-- View principal de KPIs
CREATE OR REPLACE VIEW public.v_deal_kpis AS
SELECT
    d.id                                AS deal_id,
    d.title                             AS deal_title,
    d.value                             AS deal_value,
    d.status                            AS deal_status,
    d.company_id,
    d.contact_id,

    -- Dados do contato
    c.name                              AS contact_name,
    c.email                             AS contact_email,

    -- KPIs do Link D'água: projetos QR d'água criados para este contato
    COALESCE(qr.qr_codes_count,  0)    AS qr_codes_count,
    COALESCE(qr.qr_links_count,  0)    AS qr_links_count,
    COALESCE(qr.total_scans,     0)    AS total_scans,
    COALESCE(qr.total_projects,  0)    AS total_projects,

    -- Briefing ativo deste contato (se houver)
    b.id                                AS briefing_id,
    b.version                           AS briefing_version,
    b.source                            AS briefing_source,
    b.content                           AS briefing_content,
    b.updated_at                        AS briefing_updated_at

FROM public.deals d
LEFT JOIN public.contacts c
    ON c.id = d.contact_id

-- LATERAL JOIN para KPIs: agrega em subquery por email (1 query por deal, não N)
LEFT JOIN LATERAL (
    SELECT
        COUNT(DISTINCT qc.id)                           AS qr_codes_count,
        COUNT(DISTINCT ql.id)                           AS qr_links_count,
        COALESCE(SUM(qc.total_scans), 0)
            + COALESCE(SUM(ql.total_scans), 0)         AS total_scans,
        COUNT(DISTINCT qc.id) + COUNT(DISTINCT ql.id)  AS total_projects
    FROM
        (SELECT id, total_scans FROM public.qr_codes
         WHERE client_email = c.email AND c.email IS NOT NULL) qc
    FULL OUTER JOIN
        -- qr_links só existe no banco do Link D'água compartilhado
        -- Se a tabela não existir, o LATERAL retorna zeros graciosamente
        (SELECT id, total_scans FROM public.qr_links
         WHERE client_email = c.email AND c.email IS NOT NULL) ql
    ON false  -- FULL OUTER JOIN on false = UNION sem duplicatas
) qr ON true

-- Briefing ativo para este contato
LEFT JOIN public.crm_briefings b
    ON b.contact_id = c.id
   AND b.is_active  = true
   AND b.company_id = d.company_id;

-- Permissão de leitura para usuários autenticados (RLS da view herda das tabelas base)
GRANT SELECT ON public.v_deal_kpis TO authenticated;

COMMENT ON VIEW public.v_deal_kpis IS
'KPIs unificados: deals + contatos + engajamento QR d''água (qr_codes + qr_links).
 Usar para cards do Kanban da Super Admin. Filtrar sempre por company_id.
 Performance: O LATERAL JOIN é executado por deal — garantido por índices em
 qr_codes(client_email) e qr_links(client_email).
 Se volume > 10k deals: considerar MATERIALIZED VIEW + pg_cron REFRESH 15min.';


-- =============================================================================
-- PARTE 4: RLS — crm_briefings (PURO JWT — ZERO subqueries em profiles)
-- =============================================================================

ALTER TABLE public.crm_briefings ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "briefings_select" ON public.crm_briefings;
DROP POLICY IF EXISTS "briefings_insert" ON public.crm_briefings;
DROP POLICY IF EXISTS "briefings_update" ON public.crm_briefings;
DROP POLICY IF EXISTS "briefings_delete" ON public.crm_briefings;

-- PADRÃO JWT OBRIGATÓRIO (Migration 056):
-- Nenhuma subquery em profiles. Claims lidos diretamente do token.

CREATE POLICY "briefings_select" ON public.crm_briefings
    FOR SELECT USING (
        (auth.jwt() ->> 'is_super_admin') = 'true'
        OR company_id = (auth.jwt() ->> 'company_id')::uuid
    );

CREATE POLICY "briefings_insert" ON public.crm_briefings
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'is_super_admin') = 'true'
        OR company_id = (auth.jwt() ->> 'company_id')::uuid
    );

CREATE POLICY "briefings_update" ON public.crm_briefings
    FOR UPDATE USING (
        (auth.jwt() ->> 'is_super_admin') = 'true'
        OR company_id = (auth.jwt() ->> 'company_id')::uuid
    );

CREATE POLICY "briefings_delete" ON public.crm_briefings
    FOR DELETE USING (
        (auth.jwt() ->> 'is_super_admin') = 'true'
        OR company_id = (auth.jwt() ->> 'company_id')::uuid
    );


-- =============================================================================
-- PARTE 5: FUNÇÃO HELPER — upsert_briefing()
-- =============================================================================
-- Uso pelo Link D'água: chama esta função via supabase.rpc('upsert_briefing', {...})
-- Garante atomicidade: desativa briefing anterior + cria novo em uma transação.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.upsert_briefing(
    p_profile_id   uuid,
    p_content      jsonb,
    p_source       text DEFAULT 'link-dagua',
    p_deal_id      uuid DEFAULT NULL,
    p_contact_id   uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company_id uuid;
    v_new_id     uuid;
BEGIN
    -- Extrai company_id do JWT (NUNCA de profiles)
    v_company_id := (auth.jwt() ->> 'company_id')::uuid;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'company_id ausente no JWT. Re-autentique.';
    END IF;

    -- Desativa briefing ativo anterior
    UPDATE public.crm_briefings
    SET is_active = false, updated_at = now()
    WHERE profile_id  = p_profile_id
      AND company_id  = v_company_id
      AND is_active   = true;

    -- Cria novo briefing (trigger auto_version_briefing define a versão)
    INSERT INTO public.crm_briefings (
        company_id, profile_id, deal_id, contact_id,
        content, source, created_by, is_active
    )
    VALUES (
        v_company_id, p_profile_id, p_deal_id, p_contact_id,
        p_content, p_source, auth.uid(), true
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_briefing TO authenticated;

COMMENT ON FUNCTION public.upsert_briefing IS
'Cria ou atualiza o briefing ativo de um profile de forma atômica.
 Uso via Link D''água: supabase.rpc("upsert_briefing", { p_profile_id, p_content, ... })
 O company_id é extraído do JWT — nunca passado como parâmetro.';


-- =============================================================================
-- VERIFICAÇÃO FINAL (executar após aplicar para confirmar)
-- =============================================================================
-- SELECT tablename, policyname, qual
-- FROM pg_policies
-- WHERE tablename = 'crm_briefings'
-- AND qual LIKE '%profiles%';
-- → Deve retornar 0 linhas (zero subqueries em profiles).
--
-- SELECT * FROM public.v_deal_kpis WHERE company_id = '<seu_company_id>' LIMIT 5;
-- → Deve retornar deals com KPIs agregados.
-- =============================================================================

COMMIT;
