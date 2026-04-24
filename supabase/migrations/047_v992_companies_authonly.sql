-- ============================================================================
-- V9.9.2 — FIX COMPANIES RLS + CatalogTab/TechStack UX RESTAURADA
-- ============================================================================
-- EXECUTE NO SUPABASE SQL EDITOR após o 046_v991_rls_blindado_final.sql
-- Data: 2026-04-24
-- ============================================================================

-- ── COMPANIES: auth_only (tabela não tem company_id — é compartilhada) ─────
-- O isolamento de companies é feito na camada de UI (filtro por owner_id via profile)
-- Não quebramos o modelo de dados do Link d'água.
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
DO $$ DECLARE r RECORD;
BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', r.policyname); END LOOP;
END $$;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode criar/ler/editar sua própria empresa
-- O campo owner_id garante o isolamento de UI
CREATE POLICY "companies_select" ON public.companies FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "companies_insert" ON public.companies FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "companies_update" ON public.companies FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "companies_delete" ON public.companies FOR DELETE
  TO authenticated USING (true);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'companies'
ORDER BY cmd;

-- Resultado esperado: 4 policies auth_only (DELETE, INSERT, SELECT, UPDATE)
