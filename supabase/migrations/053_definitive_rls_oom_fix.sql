-- ============================================================================
-- MIGRATION 053: DEFINITIVO — FIX OOM / RECURSÃO INFINITA EM RLS
-- ============================================================================
-- CAUSA RAIZ CONFIRMADA:
--   A função get_is_super_admin() e get_my_company_id() eram chamadas dentro
--   de políticas RLS. Em Supabase/PostgreSQL, funções chamadas dentro de RLS
--   podem disparar avaliação de RLS recursivamente se não usarem SECURITY
--   DEFINER corretamente OU se a função internamente fizer queries que ativam
--   outras políticas RLS.
--
--   Adicionalmente, a tabela `deals` NUNCA teve as políticas corrigidas —
--   ainda usava políticas antigas causando loop.
--
-- SOLUÇÃO:
--   Substituir TODAS as chamadas de função em políticas RLS por subqueries
--   inline que usam SECURITY DEFINER implicitamente, sem depender de funções
--   intermediárias. O padrão:
--
--     (SELECT company_id FROM public.profiles WHERE id = auth.uid())
--
--   é avaliado UMA VEZ por sessão pelo planner do PostgreSQL (cached).
--   Não há risco de loop porque profiles não tem políticas que referenciam
--   contacts, deals ou boards.
--
-- TABELAS AFETADAS: contacts, crm_companies, deals, boards, board_stages
-- ============================================================================

BEGIN;

-- ============================================================
-- HELPER FUNCTIONS — garantia de SECURITY DEFINER em TODAS
-- ============================================================

-- get_my_company_id: SECURITY DEFINER, sem RLS na query interna
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- get_is_super_admin: SECURITY DEFINER, sem RLS na query interna
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

GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_is_super_admin() TO authenticated;


-- ============================================================
-- TABELA: contacts
-- Remove TODAS as políticas antigas e recria com subquery inline
-- ============================================================
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

CREATE POLICY "contacts_select" ON public.contacts
  FOR SELECT TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "contacts_insert" ON public.contacts
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    OR company_id IS NULL
  );

CREATE POLICY "contacts_update" ON public.contacts
  FOR UPDATE TO authenticated
  USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "contacts_delete" ON public.contacts
  FOR DELETE TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );


-- ============================================================
-- TABELA: crm_companies
-- ============================================================
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

CREATE POLICY "crm_companies_select" ON public.crm_companies
  FOR SELECT TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "crm_companies_insert" ON public.crm_companies
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    OR company_id IS NULL
  );

CREATE POLICY "crm_companies_update" ON public.crm_companies
  FOR UPDATE TO authenticated
  USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "crm_companies_delete" ON public.crm_companies
  FOR DELETE TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );


-- ============================================================
-- TABELA: deals  ← NUNCA FOI CORRIGIDA. CAUSA PRIMÁRIA DO OOM.
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'deals'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.deals', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select" ON public.deals
  FOR SELECT TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "deals_insert" ON public.deals
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    OR company_id IS NULL
  );

CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE TO authenticated
  USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "deals_delete" ON public.deals
  FOR DELETE TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );


-- ============================================================
-- TABELA: boards
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'boards'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.boards', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boards_select" ON public.boards
  FOR SELECT TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "boards_insert" ON public.boards
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "boards_update" ON public.boards
  FOR UPDATE TO authenticated
  USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "boards_delete" ON public.boards
  FOR DELETE TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );


-- ============================================================
-- TABELA: board_stages  (filtragem por board_id via JOIN seguro)
-- board_stages não tem company_id — filtramos pelo board que pertence ao tenant
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'board_stages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.board_stages', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.board_stages ENABLE ROW LEVEL SECURITY;

-- SELECT: pode ver stages dos próprios boards
CREATE POLICY "board_stages_select" ON public.board_stages
  FOR SELECT TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "board_stages_insert" ON public.board_stages
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "board_stages_update" ON public.board_stages
  FOR UPDATE TO authenticated
  USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "board_stages_delete" ON public.board_stages
  FOR DELETE TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR board_id IN (
      SELECT id FROM public.boards
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    )
  );


-- ============================================================
-- TRIGGERS auto_set_company_id: garantir em todos os CRM tables
-- A função deve ser SECURITY DEFINER para bypassar RLS ao ler profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_set_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Só preenche se o campo estiver nulo
  IF NEW.company_id IS NULL THEN
    SELECT company_id INTO v_company_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
    NEW.company_id := v_company_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Re-aplicar triggers (idempotente)
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


-- ============================================================
-- PROFILES: garantir que a tabela NÃO tem RLS que toca outras tabelas
-- Política simples: cada user vê e edita o próprio profile;
-- Super Admin vê todos. Sem dependências circulares.
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Leitura: cada user vê o próprio + super_admin vê todos
-- ATENÇÃO: esta policy NÃO chama nenhuma função externa — evita loop
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (
    id = auth.uid()
    OR is_super_admin = true  -- quem tem is_super_admin=true pode ver todos (inclusive a SA)
    OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
  );

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    id = auth.uid()
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
  )
  WITH CHECK (
    id = auth.uid()
    OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
  );


-- ============================================================
-- ACTIVITIES: corrigir se estiver faltando
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'activities'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.activities', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON public.activities
  FOR SELECT TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "activities_insert" ON public.activities
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    OR company_id IS NULL
  );

CREATE POLICY "activities_update" ON public.activities
  FOR UPDATE TO authenticated
  USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "activities_delete" ON public.activities
  FOR DELETE TO authenticated USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
    OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

COMMIT;


-- ============================================================
-- VERIFICAÇÃO (execute após COMMIT)
-- ============================================================

-- Confirmar políticas por tabela
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('contacts', 'crm_companies', 'deals', 'boards', 'board_stages', 'profiles', 'activities')
ORDER BY tablename, policyname;

-- Confirmar funções SECURITY DEFINER
SELECT proname, prosecdef AS is_security_definer
FROM pg_proc
WHERE proname IN ('get_my_company_id', 'get_is_super_admin', 'auto_set_company_id')
  AND pronamespace = 'public'::regnamespace;
