-- ============================================================================
-- V9.7.2 — RLS FALLBACK SEGURO: products & companies
-- ============================================================================
-- CONTEXTO:
--   As tabelas products e companies nao possuem colunas de ownership
--   (sem company_id, sem owner_id). Sao tabelas legadas compartilhadas
--   com o app "Link d'agua". NAO ALTERAMOS O ESQUEMA.
--
--   Solucao segura para MVP: exigir autenticacao (bloqueia anonimos),
--   mantendo acesso irrestrito para usuarios logados.
--   Filtragem de dados por tenant e feita na camada de UI/servico.
--
-- Backlog pos-MVP: adicionar company_id + owner_id a essas tabelas
--   via migration versionada para isolamento completo de RLS.
--
-- Execute em: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- ── products ─────────────────────────────────────────────────────────────────
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON products', r.policyname);
  END LOOP;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_auth_only"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── companies ────────────────────────────────────────────────────────────────
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
  END LOOP;
END $$;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_auth_only"
  ON companies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── Verificacao ───────────────────────────────────────────────────────────────
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('products', 'companies')
ORDER BY tablename;
-- Esperado: 1 policy "ALL" por tabela
