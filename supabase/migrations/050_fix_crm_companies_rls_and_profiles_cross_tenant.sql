-- 050_fix_crm_companies_rls_and_profiles_cross_tenant.sql
-- Data: 2026-05-01
-- Propósito:
--   1. Corrigir policy de companies (tenant) que era impossível de satisfazer
--   2. Criar/corrigir policies de crm_companies (empresas CRM dos clientes)
--   3. CRÍTICO: Corrigir vazamento cross-tenant na rota Admin
--      (admins de outros tenants viam todos os profiles)
--   4. Garantir auto_set_company_id trigger em crm_companies e activities

BEGIN;

-- ==============================================================
-- PARTE 0: Função is_super_admin (usa flag do profile, não email)
-- O campo is_super_admin já existe na tabela profiles.
-- Esta função retorna true APENAS para lidimfc@gmail.com (ou quem
-- tiver is_super_admin = true no profile).
-- ==============================================================

CREATE OR REPLACE FUNCTION public.get_is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_super_admin, false)
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_is_super_admin() TO authenticated;


-- ==============================================================
-- PARTE 1: FIX CRÍTICO — profiles cross-tenant admin leak
--
-- BUG: profiles_admin_all permitia que qualquer role='admin'
-- visse TODOS os profiles do banco (não só do seu tenant).
--
-- FIX: Super Admin (is_super_admin=true) vê tudo.
--      Admin comum vê só o seu tenant.
--      User comum vê só o próprio profile.
-- ==============================================================

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select"    ON public.profiles;

CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.get_is_super_admin()                -- super admin vê tudo
    OR company_id = public.get_my_company_id() -- mesmo tenant (admin ou user)
    OR id = auth.uid()                         -- sempre pode ler o próprio
  );

-- INSERT, UPDATE, DELETE permanecem como na 049 (apenas o próprio profile)
-- Não precisam ser alteradas.


-- ==============================================================
-- PARTE 2: FIX — public.companies (tabela TENANT)
--
-- BUG na 049: policy usava "id = get_my_company_id()"
-- Isso é impossível porque inserir uma NOVA tenant company
-- exigiria que o ID já fosse o ID do tenant — paradoxo.
--
-- CORRETO: companies (tenant) são criadas APENAS pelo trigger
-- handle_new_user (SECURITY DEFINER). Usuários comuns NÃO
-- devem inserir nessa tabela diretamente.
-- Usuários devem apenas SELECT da própria empresa.
-- ==============================================================

DO $$ BEGIN
  PERFORM pg_temp.nuke_policies('companies');
EXCEPTION WHEN undefined_function THEN
  -- helper da 049 pode não existir nesta sessão; dropa manualmente
  DECLARE r RECORD;
  BEGIN
    FOR r IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='companies'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', r.policyname);
    END LOOP;
  END;
END $$;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- SELECT: cada tenant só vê a própria empresa
CREATE POLICY "companies_select"
  ON public.companies FOR SELECT TO authenticated
  USING (
    public.get_is_super_admin()
    OR id = public.get_my_company_id()
  );

-- INSERT: bloqueado para usuários comuns (trigger faz isso)
-- UPDATE: apenas super admin ou o dono da empresa
CREATE POLICY "companies_update"
  ON public.companies FOR UPDATE TO authenticated
  USING (
    public.get_is_super_admin()
    OR id = public.get_my_company_id()
  )
  WITH CHECK (
    public.get_is_super_admin()
    OR id = public.get_my_company_id()
  );

-- DELETE: apenas super admin
CREATE POLICY "companies_delete"
  ON public.companies FOR DELETE TO authenticated
  USING (public.get_is_super_admin());


-- ==============================================================
-- PARTE 3: crm_companies (empresas CRM — clientes/prospects)
--
-- Tabela separada da tenant companies.
-- Tem campo company_id (tenant FK) e trigger auto_company_id.
-- ==============================================================

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
    -- trigger auto_company_id injeta company_id automaticamente
    -- mas garantimos que o valor inserido bate com o tenant
    company_id = public.get_my_company_id()
    OR company_id IS NULL  -- trigger vai preencher
  );

CREATE POLICY "crm_companies_update"
  ON public.crm_companies FOR UPDATE TO authenticated
  USING (company_id = public.get_my_company_id())
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "crm_companies_delete"
  ON public.crm_companies FOR DELETE TO authenticated
  USING (company_id = public.get_my_company_id());


-- ==============================================================
-- PARTE 4: Garantir trigger auto_company_id em crm_companies
-- (idempotente — recria se necessário)
-- ==============================================================

CREATE OR REPLACE FUNCTION public.auto_set_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    SELECT company_id INTO NEW.company_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_company_id ON public.crm_companies;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();


-- ==============================================================
-- PARTE 5: Garantir trigger auto_company_id em outras tabelas
-- que dependem dele (contacts, deals, boards, activities)
-- ==============================================================

-- contacts
DROP TRIGGER IF EXISTS auto_company_id ON public.contacts;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

-- deals
DROP TRIGGER IF EXISTS auto_company_id ON public.deals;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

-- boards
DROP TRIGGER IF EXISTS auto_company_id ON public.boards;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

-- activities
DROP TRIGGER IF EXISTS auto_company_id ON public.activities;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

COMMIT;


-- ==============================================================
-- VERIFICAÇÃO (rode após COMMIT)
-- ==============================================================

SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles','companies','crm_companies')
ORDER BY tablename, cmd;

SELECT proname, prosecdef
FROM pg_proc
WHERE proname IN ('get_my_company_id','get_my_role','get_is_super_admin','auto_set_company_id')
  AND pronamespace = 'public'::regnamespace;

SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'auto_company_id'
ORDER BY event_object_table;
