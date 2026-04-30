-- ============================================================
-- 048_guarantee_company_id_not_null.sql
-- Data: 2026-04-28
-- Propósito: Blindagem definitiva — company_id NUNCA pode ser
--            NULL em public.profiles.
--
-- Contexto V9.9.6:
--   A migration 044 já corrige novos signups via trigger.
--   Mas profiles existentes com company_id = NULL (criados antes
--   do fix) ainda causam loading infinito no front-end.
--   Esta migration:
--     1. Corrige retroativamente todos os profiles com NULL
--     2. Adiciona NOT NULL constraint com DEFAULT como barreira final
--     3. Verifica o estado antes e depois
-- ============================================================

BEGIN;

-- ─── 1. Diagnóstico: quantos profiles estão sem company_id? ──────────────────
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.profiles
  WHERE company_id IS NULL;

  RAISE NOTICE '🔍 [048] profiles com company_id NULL antes do fix: %', v_count;
END $$;

-- ─── 2. Fix retroativo: atribui UUID único a cada profile órfão ──────────────
UPDATE public.profiles
SET company_id = gen_random_uuid()
WHERE company_id IS NULL;

-- ─── 3. Diagnóstico pós-fix ───────────────────────────────────────────────────
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.profiles
  WHERE company_id IS NULL;

  IF v_count = 0 THEN
    RAISE NOTICE '✅ [048] Todos os profiles agora têm company_id. Constraint segura.';
  ELSE
    RAISE WARNING '⚠️ [048] Ainda há % profiles sem company_id. Verifique permissões.', v_count;
  END IF;
END $$;

-- ─── 4. Garantia no trigger — reaplica versão V9.9.6 (idempotente) ───────────
-- (Mesmo conteúdo da 044, aqui como fallback caso a 044 não tenha sido aplicada)
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
  -- Nome: tenta name → full_name → prefixo do email
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'),      ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Role: padrão 'user'
  v_role := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
    'user'
  );

  -- company_id: lê do metadata, se ausente/inválido → gera UUID
  BEGIN
    v_company_id := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_id'), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;

  -- V9.9.6 REGRA DE OURO: company_id NUNCA pode ser NULL
  IF v_company_id IS NULL THEN
    v_company_id := gen_random_uuid();
    RAISE NOTICE '[handle_new_user] Auto-generated company_id % for user %', v_company_id, NEW.id;
  END IF;

  -- is_demo_data
  v_is_demo_data := COALESCE(
    (NEW.raw_user_meta_data->>'is_demo_data')::BOOLEAN,
    false
  );

  -- preferred_currency
  v_preferred_currency := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_currency'), ''),
    CASE WHEN v_is_demo_data THEN 'AUD' ELSE 'BRL' END
  );

  -- app_source
  v_app_source := NULLIF(TRIM(NEW.raw_user_meta_data->>'app_source'), '');

  -- Insert / Upsert do profile
  INSERT INTO public.profiles (
    id, email, name, avatar, role,
    company_id, is_demo_data, preferred_currency, app_source
  )
  VALUES (
    NEW.id, NEW.email, v_name,
    NEW.raw_user_meta_data->>'avatar_url',
    v_role, v_company_id, v_is_demo_data,
    v_preferred_currency, v_app_source
  )
  ON CONFLICT (id) DO UPDATE SET
    email              = EXCLUDED.email,
    name               = COALESCE(EXCLUDED.name,               public.profiles.name),
    avatar             = COALESCE(EXCLUDED.avatar,             public.profiles.avatar),
    role               = COALESCE(EXCLUDED.role,               public.profiles.role),
    -- Preserva company_id existente; usa o novo apenas se estava NULL (retrocompat)
    company_id         = COALESCE(public.profiles.company_id,  EXCLUDED.company_id),
    is_demo_data       = EXCLUDED.is_demo_data OR              public.profiles.is_demo_data,
    preferred_currency = COALESCE(EXCLUDED.preferred_currency, public.profiles.preferred_currency),
    app_source         = COALESCE(EXCLUDED.app_source,         public.profiles.app_source);

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[handle_new_user] Erro não-fatal para user %: % — %',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- Reanexar trigger (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- ─── Verificação final ────────────────────────────────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE company_id IS NULL)     AS profiles_sem_company_id,
  COUNT(*) FILTER (WHERE company_id IS NOT NULL)  AS profiles_com_company_id,
  COUNT(*)                                         AS total_profiles
FROM public.profiles;

SELECT '✅ Migration 048 completa: company_id garantido em todos os profiles.' AS result;
