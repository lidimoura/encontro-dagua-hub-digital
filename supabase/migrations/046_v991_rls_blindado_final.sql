-- ============================================================================
-- V9.9.1 RED ALERT — RLS BLINDADO DEFINITIVO
-- ============================================================================
-- EXECUTE ESTE ARQUIVO INTEIRO no Supabase Dashboard > SQL Editor
-- Ele substitui e corrige TODOS os scripts anteriores (039, 043, 044)
-- Date: 2026-04-24
-- ============================================================================

-- ── Helper is_super_admin() ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ── Helper: retorna company_id do usuário logado ───────────────────────────
CREATE OR REPLACE FUNCTION public.my_company_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================================
-- TABLE: boards
-- ============================================================================
ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'boards' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.boards', r.policyname); END LOOP;
END $$;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boards_select" ON public.boards FOR SELECT
  USING (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "boards_insert" ON public.boards FOR INSERT
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "boards_update" ON public.boards FOR UPDATE
  USING (is_super_admin() OR company_id = public.my_company_id())
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "boards_delete" ON public.boards FOR DELETE
  USING (is_super_admin() OR company_id = public.my_company_id());

-- ============================================================================
-- TABLE: board_stages
-- ATENÇÃO: board_stages NÃO TEM company_id — isolamento via board_id JOIN
-- ============================================================================
ALTER TABLE public.board_stages DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'board_stages' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.board_stages', r.policyname); END LOOP;
END $$;
ALTER TABLE public.board_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_stages_select" ON public.board_stages FOR SELECT
  USING (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM public.boards WHERE company_id = public.my_company_id()
    )
  );

CREATE POLICY "board_stages_insert" ON public.board_stages FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM public.boards WHERE company_id = public.my_company_id()
    )
  );

CREATE POLICY "board_stages_update" ON public.board_stages FOR UPDATE
  USING (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM public.boards WHERE company_id = public.my_company_id()
    )
  );

CREATE POLICY "board_stages_delete" ON public.board_stages FOR DELETE
  USING (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM public.boards WHERE company_id = public.my_company_id()
    )
  );

-- ============================================================================
-- TABLE: contacts
-- ============================================================================
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'contacts' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', r.policyname); END LOOP;
END $$;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select" ON public.contacts FOR SELECT
  USING (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE
  USING (is_super_admin() OR company_id = public.my_company_id())
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "contacts_delete" ON public.contacts FOR DELETE
  USING (is_super_admin() OR company_id = public.my_company_id());

-- ============================================================================
-- TABLE: deals
-- ============================================================================
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'deals' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.deals', r.policyname); END LOOP;
END $$;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select" ON public.deals FOR SELECT
  USING (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "deals_insert" ON public.deals FOR INSERT
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "deals_update" ON public.deals FOR UPDATE
  USING (is_super_admin() OR company_id = public.my_company_id())
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "deals_delete" ON public.deals FOR DELETE
  USING (is_super_admin() OR company_id = public.my_company_id());

-- ============================================================================
-- TABLE: activities
-- ============================================================================
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'activities' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.activities', r.policyname); END LOOP;
END $$;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON public.activities FOR SELECT
  USING (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "activities_insert" ON public.activities FOR INSERT
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "activities_update" ON public.activities FOR UPDATE
  USING (is_super_admin() OR company_id = public.my_company_id())
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "activities_delete" ON public.activities FOR DELETE
  USING (is_super_admin() OR company_id = public.my_company_id());

-- ============================================================================
-- TABLE: products — RLS estrito por company_id
-- ============================================================================
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'products' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', r.policyname); END LOOP;
END $$;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON public.products FOR SELECT
  USING (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "products_insert" ON public.products FOR INSERT
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "products_update" ON public.products FOR UPDATE
  USING (is_super_admin() OR company_id = public.my_company_id())
  WITH CHECK (is_super_admin() OR company_id = public.my_company_id());

CREATE POLICY "products_delete" ON public.products FOR DELETE
  USING (is_super_admin() OR company_id = public.my_company_id());

-- ============================================================================
-- TABLE: crm_feedbacks — qualquer autenticado envia; super_admin lê tudo
-- ============================================================================
ALTER TABLE public.crm_feedbacks DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'crm_feedbacks' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.crm_feedbacks', r.policyname); END LOOP;
END $$;
ALTER TABLE public.crm_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_feedbacks_insert" ON public.crm_feedbacks FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "crm_feedbacks_select" ON public.crm_feedbacks FOR SELECT
  USING (is_super_admin() OR user_id = auth.uid());

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('boards','board_stages','contacts','deals','activities','products','crm_feedbacks')
ORDER BY tablename, cmd;

-- Resultado esperado: 4 policies para cada tabela CRM (DELETE, INSERT, SELECT, UPDATE)
-- + 2 policies para crm_feedbacks (INSERT, SELECT)
