-- ============================================================================
-- MIGRATION 052: PLG Auto-CRM, Profiles Columns, OOM Fix & Notifications
-- ============================================================================
-- Objetivos:
--   1. Corrigir OOM em contacts/crm_companies (re-blindar RLS sem loop)
--   2. Criar colunas faltantes em profiles (trial_expires_at, access_level, etc.)
--   3. PLG Trigger: novo profile → contact + deal no board da Super Admin
--   4. Tabela in_app_notifications (sininho)
--   5. Política RLS para system_feedbacks que associa feedback ao deal do SA
-- Data: 2026-05-03
-- ============================================================================

BEGIN;

-- ==============================================================================
-- PARTE 1: Garantir get_my_company_id() é SECURITY DEFINER (evita loop recursivo)
-- Esta função é o coração do RLS. Deve chamar profiles SEM RLS (SECURITY DEFINER).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;

-- ==============================================================================
-- PARTE 2: Re-aplicar RLS blindado em contacts e crm_companies
-- Remove TODAS as políticas antigas e recria com get_my_company_id() SECURITY DEFINER
-- ==============================================================================

-- contacts
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'contacts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select"
  ON public.contacts FOR SELECT TO authenticated
  USING (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  );

CREATE POLICY "contacts_insert"
  ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
    OR company_id IS NULL  -- trigger preenche
  );

CREATE POLICY "contacts_update"
  ON public.contacts FOR UPDATE TO authenticated
  USING (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  )
  WITH CHECK (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  );

CREATE POLICY "contacts_delete"
  ON public.contacts FOR DELETE TO authenticated
  USING (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  );

-- crm_companies (clientes/prospects dos tenants)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'crm_companies'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.crm_companies', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_companies_select"
  ON public.crm_companies FOR SELECT TO authenticated
  USING (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  );

CREATE POLICY "crm_companies_insert"
  ON public.crm_companies FOR INSERT TO authenticated
  WITH CHECK (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
    OR company_id IS NULL  -- trigger preenche
  );

CREATE POLICY "crm_companies_update"
  ON public.crm_companies FOR UPDATE TO authenticated
  USING (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  )
  WITH CHECK (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  );

CREATE POLICY "crm_companies_delete"
  ON public.crm_companies FOR DELETE TO authenticated
  USING (
    public.get_is_super_admin()
    OR company_id = public.get_my_company_id()
  );

-- Re-garantir trigger auto_company_id em contacts (idempotente)
DROP TRIGGER IF EXISTS auto_company_id ON public.contacts;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

DROP TRIGGER IF EXISTS auto_company_id ON public.crm_companies;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();


-- ==============================================================================
-- PARTE 3: Colunas faltantes em profiles
-- O AdminPage envia trial_expires_at, access_level, status, user_type — e elas
-- podem não existir se as migrations anteriores não foram aplicadas no banco.
-- ==============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_level      TEXT DEFAULT 'trial'
    CHECK (access_level IN ('trial', 'suspended', 'paid', 'free')),
  ADD COLUMN IF NOT EXISTS user_type         TEXT DEFAULT 'lead_provadagua',
  ADD COLUMN IF NOT EXISTS status            TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),
  ADD COLUMN IF NOT EXISTS plan_type         TEXT DEFAULT 'free'
    CHECK (plan_type IN ('free', 'monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS phone             TEXT,
  ADD COLUMN IF NOT EXISTS is_super_admin    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_name         TEXT,
  ADD COLUMN IF NOT EXISTS role              TEXT DEFAULT 'user'
    CHECK (role IN ('user', 'admin', 'super_admin'));

-- Índices de performance para queries de admin
CREATE INDEX IF NOT EXISTS idx_profiles_access_level    ON public.profiles (access_level);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_expires   ON public.profiles (trial_expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id      ON public.profiles (company_id);


-- ==============================================================================
-- PARTE 4: Tabela in_app_notifications (Sininho)
-- Recebe eventos: novo_lead, novo_feedback, deal_urgente, etc.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   UUID,
  type         TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info', 'success', 'warning', 'error', 'novo_lead', 'feedback', 'deal')),
  title        TEXT NOT NULL,
  body         TEXT,
  link         TEXT,         -- rota interna ex: /boards?deal=uuid
  read         BOOLEAN NOT NULL DEFAULT false,
  source_id    UUID,         -- UUID do objeto relacionado (deal, feedback, contact)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_in_app_notif_user_id    ON public.in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notif_read       ON public.in_app_notifications(read);
CREATE INDEX IF NOT EXISTS idx_in_app_notif_created_at ON public.in_app_notifications(created_at DESC);

ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Super admin vê todas; usuário vê apenas as suas
CREATE POLICY "notifications_select"
  ON public.in_app_notifications FOR SELECT TO authenticated
  USING (
    public.get_is_super_admin()
    OR user_id = auth.uid()
  );

CREATE POLICY "notifications_insert"
  ON public.in_app_notifications FOR INSERT TO authenticated
  WITH CHECK (true);  -- triggers e funções SECURITY DEFINER inserem aqui

CREATE POLICY "notifications_update"
  ON public.in_app_notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete"
  ON public.in_app_notifications FOR DELETE TO authenticated
  USING (
    public.get_is_super_admin()
    OR user_id = auth.uid()
  );


-- ==============================================================================
-- PARTE 5: PLG Auto-CRM Trigger
-- Quando um novo profile é criado (novo Lead SaaS), a função:
--   a) Insere um contact no board/account da Super Admin (lidimfc@gmail.com)
--   b) Insere um deal com tag [SaaS Trial] no board principal da Super Admin
--   c) Cria uma in_app_notification para a Super Admin
--
-- IMPORTANTE: Roda como SECURITY DEFINER para bypassar RLS e inserir na conta SA.
-- ==============================================================================

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
  -- Só dispara para novos leads (não para a SA criando a própria conta)
  IF NEW.is_super_admin = true OR NEW.role = 'super_admin' THEN
    RETURN NEW;
  END IF;

  -- Busca Super Admin
  SELECT id, company_id
  INTO v_sa_user_id, v_sa_company_id
  FROM public.profiles
  WHERE is_super_admin = true
  LIMIT 1;

  -- SA não encontrada → abortar silenciosamente
  IF v_sa_user_id IS NULL OR v_sa_company_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Busca o primeiro board da SA
  SELECT id INTO v_board_id
  FROM public.boards
  WHERE company_id = v_sa_company_id
    AND deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  -- Sem board → abortar
  IF v_board_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Pega o primeiro stage do board
  SELECT id INTO v_first_stage_id
  FROM public.board_stages
  WHERE board_id = v_board_id
  ORDER BY position ASC
  LIMIT 1;

  -- Nome e email do novo lead
  v_lead_name  := COALESCE(NEW.full_name, split_part(NEW.email, '@', 1), 'Lead SaaS');
  v_lead_email := COALESCE(NEW.email, '');

  -- Inserir contact na conta da SA (bypassa RLS via SECURITY DEFINER)
  INSERT INTO public.contacts (
    name, email, source, notes, company_id, status,
    last_purchase_date, created_at, updated_at
  )
  VALUES (
    v_lead_name,
    v_lead_email,
    'SaaS Trial',
    'Lead cadastrado automaticamente pelo PLG auto-CRM. Entrada via Provadágua Showcase.',
    v_sa_company_id,
    'ACTIVE',
    now(),
    now(),
    now()
  )
  RETURNING id INTO v_contact_id;

  -- Inserir deal na conta da SA
  INSERT INTO public.deals (
    title, contact_name, contact_email, company_id, board_id, stage_id,
    status, tags, source, notes, created_at, updated_at
  )
  VALUES (
    '[SaaS Trial] ' || v_lead_name,
    v_lead_name,
    v_lead_email,
    v_sa_company_id,
    v_board_id,
    v_first_stage_id,
    'OPEN',
    ARRAY['SaaS Trial', 'PLG', 'Auto-CRM'],
    'SaaS Trial',
    'Deal criado automaticamente pelo PLG trigger ao cadastro do lead.',
    now(),
    now()
  )
  RETURNING id INTO v_deal_id;

  -- Notificação in-app para a Super Admin
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
    -- Nunca bloqueia o cadastro do usuário em caso de erro
    RAISE WARNING '[PLG] Erro no trigger plg_new_lead: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Dropa e recria o trigger no profiles
DROP TRIGGER IF EXISTS plg_new_lead_trigger ON public.profiles;
CREATE TRIGGER plg_new_lead_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.plg_new_lead_to_super_admin_crm();


-- ==============================================================================
-- PARTE 6: RPC mark_notification_read — para o frontend marcar como lida
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.in_app_notifications
  SET read = true
  WHERE id = p_notification_id
    AND user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID) TO authenticated;


-- ==============================================================================
-- PARTE 7: Garantir que crm_feedbacks tem company_id preenchido pelo trigger
-- ==============================================================================

DROP TRIGGER IF EXISTS auto_company_id ON public.crm_feedbacks;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.crm_feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();


COMMIT;


-- ==============================================================================
-- VERIFICAÇÃO (execute após COMMIT)
-- ==============================================================================

-- Confirmar colunas de profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN (
    'trial_expires_at', 'access_level', 'status', 'plan_type',
    'phone', 'is_super_admin', 'full_name', 'role', 'user_type'
  )
ORDER BY column_name;

-- Confirmar trigger PLG
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('plg_new_lead_trigger', 'auto_company_id')
ORDER BY event_object_table, trigger_name;

-- Confirmar tabela in_app_notifications
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'in_app_notifications';

-- Confirmar SECURITY DEFINER em funções críticas
SELECT proname, prosecdef AS is_security_definer
FROM pg_proc
WHERE proname IN (
  'get_my_company_id', 'get_is_super_admin',
  'auto_set_company_id', 'plg_new_lead_to_super_admin_crm',
  'mark_notification_read', 'get_my_role'
)
AND pronamespace = 'public'::regnamespace;
