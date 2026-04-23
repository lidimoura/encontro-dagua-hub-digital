-- ============================================================================
-- V9.8 HOTFIX DEFINITIVO: RLS Estrito + Fix boards_stages INSERT
-- ============================================================================
-- CONTEXTO CRÍTICO:
--   1. Supabase enviou alerta rls_disabled_in_public (tabelas sem RLS)
--   2. "OR company_id IS NULL" nas policies do 039 permite leak cross-tenant
--   3. board_stages_insert no 039 referencia company_id que NÃO existe na tabela
--
-- ESTRATÉGIA:
--   - CRM tables (boards, board_stages, deals, activities, contacts):
--     RLS ESTRITO por company_id. Super_admin bypassa via is_super_admin=true.
--   - products + companies (banco compartilhado, sem company_id):
--     RLS auth_only (bloqueia anonimos, isolamento feito no front-end).
--
-- Execute em: Supabase Dashboard > SQL Editor > New Query
-- Date: 2026-04-23
-- ============================================================================


-- ============================================================================
-- HELPER: função para verificar super_admin (evita repetição)
-- ============================================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;


-- ============================================================================
-- TABLE: boards
-- company_id EXISTE (confirmado em DbBoard e boards.ts:124)
-- ============================================================================
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'boards'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON boards', r.policyname); END LOOP;
END $$;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Super admin vê tudo; lead vê apenas a sua empresa
CREATE POLICY "boards_select"
  ON boards FOR SELECT
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- INSERT: apenas para company_id do usuário
CREATE POLICY "boards_insert"
  ON boards FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "boards_update"
  ON boards FOR UPDATE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "boards_delete"
  ON boards FOR DELETE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );


-- ============================================================================
-- TABLE: board_stages
-- NÃO tem company_id — isolamento via board_id → boards.company_id
-- FIX do bug no 039: removido "OR (company_id IN ...)" que causava 403
-- ============================================================================
ALTER TABLE board_stages DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'board_stages'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON board_stages', r.policyname); END LOOP;
END $$;
ALTER TABLE board_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_stages_select"
  ON board_stages FOR SELECT
  USING (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

-- FIX CRÍTICO: removido o "OR (company_id IN ...)" do 039 que referenciava coluna inexistente
CREATE POLICY "board_stages_insert"
  ON board_stages FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "board_stages_update"
  ON board_stages FOR UPDATE
  USING (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "board_stages_delete"
  ON board_stages FOR DELETE
  USING (
    is_super_admin()
    OR board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );


-- ============================================================================
-- TABLE: contacts
-- company_id EXISTE (confirmado em NUCLEAR_contacts_rls_fix.sql e contacts.ts)
-- ============================================================================
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'contacts'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON contacts', r.policyname); END LOOP;
END $$;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select"
  ON contacts FOR SELECT
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "contacts_insert"
  ON contacts FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "contacts_update"
  ON contacts FOR UPDATE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "contacts_delete"
  ON contacts FOR DELETE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );


-- ============================================================================
-- TABLE: deals
-- company_id EXISTE (confirmado em deals.ts e migration 039)
-- ============================================================================
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'deals'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON deals', r.policyname); END LOOP;
END $$;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select"
  ON deals FOR SELECT
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "deals_insert"
  ON deals FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "deals_update"
  ON deals FOR UPDATE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "deals_delete"
  ON deals FOR DELETE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );


-- ============================================================================
-- TABLE: activities
-- company_id EXISTE (confirmado em activities.ts e migration 039)
-- ============================================================================
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'activities'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON activities', r.policyname); END LOOP;
END $$;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select"
  ON activities FOR SELECT
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "activities_insert"
  ON activities FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "activities_update"
  ON activities FOR UPDATE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "activities_delete"
  ON activities FOR DELETE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );


-- ============================================================================
-- TABLE: products (banco compartilhado — sem company_id)
-- Isolamento feito no front-end (TechStackPage guard + CatalogTab guard)
-- ============================================================================
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'products'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON products', r.policyname); END LOOP;
END $$;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_auth_only"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================================
-- TABLE: companies (banco compartilhado — sem company_id)
-- Isolamento feito no front-end
-- ============================================================================
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname); END LOOP;
END $$;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_auth_only"
  ON companies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN (
  'boards', 'board_stages', 'contacts', 'deals', 'activities', 'products', 'companies'
)
ORDER BY tablename, cmd;

-- Esperado:
--   boards          → 4 policies (DELETE, INSERT, SELECT, UPDATE)
--   board_stages    → 4 policies
--   contacts        → 4 policies
--   deals           → 4 policies
--   activities      → 4 policies
--   products        → 1 policy (ALL)
--   companies       → 1 policy (ALL)
