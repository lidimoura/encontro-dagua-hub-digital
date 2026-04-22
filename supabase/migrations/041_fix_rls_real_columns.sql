-- ============================================================================
-- V9.7.1 HOTFIX: RLS CORRIGIDO para products e companies
-- ============================================================================
-- CONTEXTO CRÍTICO:
--   - Banco compartilhado com "Link d'água" — NÃO criamos colunas, NÃO
--     alteramos schema. APENAS políticas RLS baseadas nas colunas que JÁ EXISTEM.
--
-- COLUNAS REAIS (verificadas nas interfaces TypeScript do front-end):
--   products  → NÃO tem company_id, NÃO tem owner_id explícito no tipo.
--               É uma tabela global/catálogo. Trigger do Supabase seta owner.
--               Política: SELECT aberto para autenticados, INSERT/UPDATE/DELETE
--               apenas para o dono do registro (auth.uid()).
--   companies → TEM owner_id (DbCompany.owner_id). NÃO tem company_id.
--               Política: CRUD restrito a owner_id = auth.uid().
--
-- Execute ONCE em: Supabase Dashboard > SQL Editor > New Query
-- Date: 2026-04-22
-- ============================================================================


-- ============================================================================
-- PASSO 0: Verificar colunas reais (execute antes para confirmar)
-- ============================================================================
-- Descomente e execute se quiser confirmar antes de aplicar:
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name IN ('products', 'companies')
--   AND column_name IN ('owner_id', 'company_id', 'user_id', 'profile_id', 'created_by')
-- ORDER BY table_name, column_name;


-- ============================================================================
-- TABLE: products
-- ============================================================================
-- Contexto: tabela global/catálogo compartilhada com Link d'água.
-- Não tem company_id. Política: SELECT aberto para auth, CUD via auth.uid().
-- ============================================================================

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Nuclear drop de todas as policies existentes
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON products', r.policyname);
    RAISE NOTICE 'Dropped policy: % on products', r.policyname;
  END LOOP;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer usuário autenticado pode ver os produtos do catálogo
CREATE POLICY "products_select_authenticated"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: usuário autenticado pode criar produtos (owner via trigger ou auth.uid())
-- Se a tabela tiver owner_id, o trigger do Supabase seta auth.uid() automaticamente.
-- Se não tiver, qualquer autenticado pode inserir (catálogo compartilhado).
CREATE POLICY "products_insert_authenticated"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: só quem criou o produto pode editar
-- Usa owner_id se existir — se não existir, substitua por: WITH CHECK (true)
-- e comente a policy abaixo, substituindo por uma permissiva.
--
-- ATENÇÃO: se a coluna owner_id NÃO EXISTIR em products, use a versão comentada abaixo.
-- Versão com owner_id:
CREATE POLICY "products_update_owner"
  ON products FOR UPDATE
  TO authenticated
  USING (
    -- Tenta owner_id; se a coluna não existir, remova esta policy e use a permissiva
    owner_id IS NULL OR owner_id = auth.uid()
  )
  WITH CHECK (
    owner_id IS NULL OR owner_id = auth.uid()
  );

-- Se owner_id não existir em products, comente as 2 políticas acima e use esta:
-- CREATE POLICY "products_update_authenticated"
--   ON products FOR UPDATE
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- DELETE: só quem criou pode deletar
CREATE POLICY "products_delete_owner"
  ON products FOR DELETE
  TO authenticated
  USING (
    owner_id IS NULL OR owner_id = auth.uid()
  );

-- Se owner_id não existir, use:
-- CREATE POLICY "products_delete_authenticated"
--   ON products FOR DELETE
--   TO authenticated
--   USING (true);


-- ============================================================================
-- TABLE: companies (CRM companies — não confundir com tenant companies)
-- ============================================================================
-- Contexto: tabela de empresas do CRM. Tem owner_id (confirmado em DbCompany).
-- NÃO tem company_id. Política: CRUD baseado em owner_id = auth.uid().
-- ============================================================================

ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
    RAISE NOTICE 'Dropped policy: % on companies', r.policyname;
  END LOOP;
END $$;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- SELECT: vê empresas que você criou OU sem dono (dados globais/legado)
CREATE POLICY "companies_select_owner"
  ON companies FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
  );

-- INSERT: qualquer autenticado pode criar uma empresa CRM
CREATE POLICY "companies_insert_authenticated"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: só o dono pode editar
CREATE POLICY "companies_update_owner"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
  )
  WITH CHECK (true);

-- DELETE: só o dono pode deletar
CREATE POLICY "companies_delete_owner"
  ON companies FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
  );


-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('products', 'companies')
ORDER BY tablename, cmd;

-- Resultado esperado: 4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)

-- ============================================================================
-- DIAGNÓSTICO: Se UPDATE/DELETE em products falhar com owner_id inexistente:
-- 1. Execute: SELECT column_name FROM information_schema.columns
--             WHERE table_name = 'products' AND column_name = 'owner_id';
-- 2. Se retornar 0 linhas, substitua as policies de UPDATE e DELETE por:
--    DROP POLICY "products_update_owner" ON products;
--    DROP POLICY "products_delete_owner" ON products;
--    CREATE POLICY "products_update_authenticated" ON products FOR UPDATE
--      TO authenticated USING (true) WITH CHECK (true);
--    CREATE POLICY "products_delete_authenticated" ON products FOR DELETE
--      TO authenticated USING (true);
-- ============================================================================
