-- ============================================================================
-- V9.9 ACTION 1: products — RLS Estrito por company_id
-- ============================================================================
-- CONTEXTO CRÍTICO:
--   A migration 003 criou products COM company_id (UUID).
--   As migrations 042 e 043 aplicaram auth_only, destruindo o isolamento.
--   Esta migration RESTAURA o RLS estrito por company_id.
--
-- SEGURANÇA Link d'água:
--   O Link d'água usa a tabela products do mesmo banco.
--   A policy is_super_admin() garante que a Lidi vê TUDO.
--   Leads veem APENAS os seus produtos (company_id matching).
--   Dados do Link d'água não têm company_id do CRM → não vazam.
--
-- Execute em: Supabase Dashboard > SQL Editor > New Query
-- Date: 2026-04-23
-- ============================================================================

-- Garantir que a função is_super_admin exista (criada no 043, idempotente)
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
-- TABLE: products — DROP e recreate com RLS estrito
-- ============================================================================
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'products'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON products', r.policyname); END LOOP;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Super admin vê tudo; lead vê apenas os seus produtos
CREATE POLICY "products_select"
  ON products FOR SELECT
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- INSERT: apenas para o company_id do usuário
CREATE POLICY "products_insert"
  ON products FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "products_update"
  ON products FOR UPDATE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "products_delete"
  ON products FOR DELETE
  USING (
    is_super_admin()
    OR company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'products'
ORDER BY cmd;
-- Esperado: 4 policies (DELETE, INSERT, SELECT, UPDATE)
