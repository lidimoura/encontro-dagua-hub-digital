-- ============================================================
-- 044_fix_company_id_auto_generate.sql
-- Data: 2026-04-28
-- Propósito: Garantir que todo novo usuário criado via signup
--            receba um company_id único via gen_random_uuid()
--
-- Problema (V9.9.5 Guards revelaram):
--   O trigger handle_new_user() só atribui company_id se o
--   raw_user_meta_data contiver 'company_id'. O ShowcaseLP
--   não enviava essa chave → v_company_id = NULL → profile
--   inserido com company_id = NULL → front-end em loading
--   infinito aguardando credencial de isolamento que nunca chega.
--
-- Solução:
--   1. Quando v_company_id IS NULL após a leitura do metadata,
--      gerar gen_random_uuid() automaticamente.
--   2. Nunca inserir NULL em company_id — todo tenant DEVE
--      ter seu próprio UUID de isolamento.
--
-- Impacto: ZERO para a Super Admin (is_super_admin=true passa
--          pela leitura do metadata sem alterar company_id existente).
--          ZERO para o Link d'Água (tabela auth.users separada).
-- ============================================================

-- ─── Substituir handle_new_user com geração automática de company_id ─────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name               TEXT;
  v_role               TEXT;
  v_company_id         UUID;
  v_is_demo_data       BOOLEAN;
  v_preferred_currency TEXT;
  v_app_source         TEXT;
BEGIN
  -- ── Extrair metadata com segurança (nunca lança exceção) ─────────────────────

  -- Nome: tenta name → full_name → prefixo do email
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'),      ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Role: padrão 'user' para leads do Showcase
  v_role := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
    'user'
  );

  -- company_id:
  --   1. Tenta ler do metadata (Super Admin, convites com company_id explícito)
  --   2. Se ausente ou inválido: gera UUID novo automaticamente
  --   REGRA DE OURO: company_id NUNCA pode ser NULL em profiles
  BEGIN
    v_company_id := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_id'), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;

  -- V9.9.6 FIX: se ainda NULL, gera UUID próprio para o novo tenant
  IF v_company_id IS NULL THEN
    v_company_id := gen_random_uuid();
    RAISE NOTICE '[handle_new_user] Auto-generated company_id % for user %', v_company_id, NEW.id;
  END IF;

  -- is_demo_data: lê do metadata ou default false
  v_is_demo_data := COALESCE(
    (NEW.raw_user_meta_data->>'is_demo_data')::BOOLEAN,
    false
  );

  -- preferred_currency: AUD para demo, BRL padrão
  v_preferred_currency := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_currency'), ''),
    CASE WHEN v_is_demo_data THEN 'AUD' ELSE 'BRL' END
  );

  -- app_source: ex: 'showcase_lp', 'invite', etc.
  v_app_source := NULLIF(TRIM(NEW.raw_user_meta_data->>'app_source'), '');

  -- ── Insert / update profile ───────────────────────────────────────────────────
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar,
    role,
    company_id,
    is_demo_data,
    preferred_currency,
    app_source
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    NEW.raw_user_meta_data->>'avatar_url',
    v_role,
    v_company_id,       -- V9.9.6: sempre não-nulo
    v_is_demo_data,
    v_preferred_currency,
    v_app_source
  )
  ON CONFLICT (id) DO UPDATE SET
    email              = EXCLUDED.email,
    name               = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar             = COALESCE(EXCLUDED.avatar, public.profiles.avatar),
    role               = COALESCE(EXCLUDED.role, public.profiles.role),
    -- company_id: manter o existente se já preenchido (evitar sobrescrever tenants reais)
    company_id         = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
    is_demo_data       = EXCLUDED.is_demo_data OR public.profiles.is_demo_data,
    preferred_currency = COALESCE(EXCLUDED.preferred_currency, public.profiles.preferred_currency),
    app_source         = COALESCE(EXCLUDED.app_source, public.profiles.app_source);

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- CRÍTICO: nunca bloquear o auth signup. Log e continua.
  RAISE WARNING '[handle_new_user] Erro não-fatal para usuário %: % — %',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ─── Reanexar trigger (idempotente) ──────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Verificação pós-migração ─────────────────────────────────────────────────

-- Verifica usuários sem company_id (devem ser ZERO após esta migration)
SELECT
  'profiles com company_id NULL ANTES do fix de dados' AS check_name,
  COUNT(*) AS total
FROM public.profiles
WHERE company_id IS NULL;

-- Corrige retroativamente profiles existentes sem company_id
UPDATE public.profiles
SET company_id = gen_random_uuid()
WHERE company_id IS NULL;

-- Confirma que zerou
SELECT
  'profiles com company_id NULL APÓS fix retroativo' AS check_name,
  COUNT(*) AS total
FROM public.profiles
WHERE company_id IS NULL;

SELECT '✅ Migration 044 complete: company_id sempre gerado para novos usuários' AS result;
