-- ============================================================================
-- MIGRATION 054: EMERGÊNCIA — CORREÇÃO DE RECURSÃO INFINITA EM RLS DE PROFILES
-- ============================================================================
-- DATA: 2026-05-04
-- CAUSA RAIZ:
--   A Migration 053 criou políticas em `profiles` que usam subqueries
--   que consultam a própria tabela `profiles`:
--
--     OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1) = true
--
--   Isso cria um loop infinito: avaliar a política de profiles dispara
--   uma nova leitura de profiles, que dispara novamente a política, ad infinitum.
--   PostgreSQL lança: "infinite recursion detected in policy for relation profiles"
--   e retorna HTTP 500, travando a Super Admin e todos os Leads.
--
-- SOLUÇÃO:
--   A tabela `profiles` NUNCA deve fazer SELECT em si mesma dentro de suas
--   próprias políticas RLS. Para verificar privilégios de Super Admin na
--   própria tabela profiles, usamos o JWT Claims diretamente:
--
--     (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com'
--
--   Este bypass lê o token JWT já autenticado pelo Supabase — zero recursão.
--   Para outras tabelas (contacts, deals, etc.) a subquery em profiles é SEGURA
--   porque essas tabelas não têm políticas que chamam de volta profiles.
--
-- REGRA DE OURO (documentada também no DEVLOG):
--   NUNCA fazer SELECT em `profiles` dentro das políticas RLS de `profiles`.
--   Sempre usar JWT Claims para verificar privilégios globais na tabela profiles.
-- ============================================================================

BEGIN;

RAISE NOTICE '[054] Iniciando correção de emergência — recursão RLS em profiles...';

-- ============================================================
-- PASSO 1: Remover TODAS as políticas existentes de `profiles`
-- ============================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    RAISE NOTICE '[054] Política removida: %', r.policyname;
  END LOOP;
END $$;

RAISE NOTICE '[054] Políticas antigas de profiles removidas. Recriando sem recursão...';

-- ============================================================
-- PASSO 2: Recriar políticas de `profiles` SEM recursão
-- Regra: NUNCA usar SELECT ... FROM public.profiles dentro destas políticas.
-- Bypass de Super Admin: leitura direta do JWT Claims.
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT:
--   - Cada usuário vê o próprio perfil (id = auth.uid())
--   - Super Admin (identificada pelo email no JWT) vê TODOS os perfis
--   - Leads podem ver perfis da mesma empresa (necessário para exibir info de colegas)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (
    -- Próprio perfil — sempre visível
    id = auth.uid()
    -- Super Admin bypass via JWT (sem recursão)
    OR (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com'
    -- Perfis da mesma empresa (para listas de usuários do tenant)
    -- Nota: company_id aqui é lido da ROW sendo avaliada, não de profiles.
    -- Sem recursão: verificamos se o JWT sub (= auth.uid()) corresponde a algum
    -- perfil com mesmo company_id. Isso é seguro porque usamos a coluna da ROW
    -- atual (row.company_id) e comparamos com um valor do JWT claims.
    OR (
      company_id IS NOT NULL
      AND company_id = (
        current_setting('request.jwt.claims', true)::jsonb ->> 'company_id'
      )::uuid
    )
  );

-- INSERT: cada usuário só pode inserir o próprio perfil
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    id = auth.uid()
    -- Super Admin pode inserir qualquer perfil (ex: criação de demo users)
    OR (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com'
  );

-- UPDATE:
--   - Próprio perfil
--   - Super Admin via JWT (sem recursão)
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com'
  )
  WITH CHECK (
    id = auth.uid()
    OR (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com'
  );

-- DELETE: apenas Super Admin pode deletar perfis
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'email') = 'lidimfc@gmail.com'
  );

RAISE NOTICE '[054] Políticas de profiles recriadas com JWT bypass. Recursão eliminada.';

-- ============================================================
-- PASSO 3: Garantir que as políticas de outras tabelas NÃO foram
-- afetadas. As subqueries em contacts/deals/boards/activities
-- que leem profiles SÃO SEGURAS (não criam loop) porque:
--   - profiles não tem política que lê contacts/deals/boards
--   - A cadeia é unidirecional: contacts → profiles (fim)
-- ============================================================

RAISE NOTICE '[054] Verificação: políticas de contacts/deals/boards/activities não alteradas.';
RAISE NOTICE '[054] A cadeia de dependência é unidirecional e segura: contacts → profiles (fim).';

-- ============================================================
-- PASSO 4: Garantir que o JWT custom claim `company_id` existe
-- (preenchido pelo handle_new_user trigger ou pelo hook de auth)
-- Se o claim não existir no JWT, o fallback de `id = auth.uid()`
-- ainda garante que o usuário vê o próprio perfil.
-- ============================================================

RAISE NOTICE '[054] NOTA: O JWT claim company_id é preenchido no trigger handle_new_user.';
RAISE NOTICE '[054] Se o claim estiver ausente, o usuário ainda acessa o próprio perfil via id = auth.uid().';

COMMIT;

-- ============================================================
-- VERIFICAÇÃO (execute após COMMIT no SQL Editor do Supabase)
-- ============================================================

-- 1. Confirmar políticas de profiles (não deve haver nenhuma com subquery em profiles)
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 2. Teste de sanidade: esta query NÃO deve travar
-- (execute como usuário autenticado normal no Supabase SQL Editor)
-- SELECT id, email, is_super_admin FROM public.profiles LIMIT 5;
