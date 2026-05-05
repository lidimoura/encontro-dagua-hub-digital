-- ============================================================================
-- MIGRATION 055: FIX OOM NO INSERT DE CONTATOS — JWT company_id NO TRIGGER
-- ============================================================================
-- DATA: 2026-05-05
-- CAUSA RAIZ:
--   O trigger auto_set_company_id() fazia SELECT em public.profiles durante
--   o INSERT de contacts. Isso ativava as políticas RLS de contacts (para
--   verificar o acesso), que por sua vez tentavam ler profiles → loop de
--   avaliação de políticas encadeadas, causando OOM (Out of Memory) ou
--   recursão infinita somente no INSERT (não no SELECT, pois o path é diferente).
--
--   A empresa (crm_companies) era salva com sucesso porque o trigger de companies
--   completava antes do contacts entrar em loop. Isso explicava as empresas
--   duplicadas: o insert de contato falhava após o insert de empresa ter
--   sido commitado.
--
-- SOLUÇÃO:
--   Substituir o SELECT em profiles por leitura direta do JWT claim:
--
--     auth.jwt() ->> 'company_id'
--
--   O JWT já contém o company_id do usuário (preenchido pelo trigger
--   handle_new_user e pelo hook de auth do Supabase). Zero queries
--   adicionais. Zero risco de loop.
--
-- REGRA DE OURO (complementar à Migration 054):
--   Triggers BEFORE INSERT em tabelas com RLS ativo NUNCA devem fazer
--   SELECT em outra tabela que tenha RLS, pois o PostgreSQL avalia as
--   políticas RLS durante o SELECT interno, potencialmente criando
--   cadeias de avaliação que causam OOM.
--   Use sempre JWT claims para dados de sessão disponíveis no token.
-- ============================================================================

BEGIN;

RAISE NOTICE '[055] Corrigindo trigger auto_set_company_id — substituindo SELECT profiles por JWT claim...';

-- ============================================================
-- Recriar a função com JWT claim em vez de SELECT em profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_set_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_jwt_company text;
BEGIN
  -- Só preenche se o campo estiver nulo
  IF NEW.company_id IS NULL THEN
    -- MÉTODO 1: Leitura direta do JWT claim (zero query, zero loop)
    v_jwt_company := auth.jwt() ->> 'company_id';

    IF v_jwt_company IS NOT NULL AND v_jwt_company != '' THEN
      BEGIN
        v_company_id := v_jwt_company::uuid;
      EXCEPTION WHEN others THEN
        v_company_id := NULL;
        RAISE NOTICE '[auto_set_company_id] JWT company_id inválido: %', v_jwt_company;
      END;
    END IF;

    -- MÉTODO 2: Fallback — se o JWT não tiver company_id (ex: Super Admin
    -- inserindo manualmente), usa SECURITY DEFINER para ler profiles SEM
    -- acionar RLS (a função já é SECURITY DEFINER, então bypass RLS automático).
    -- Isso é seguro: apenas o trigger interno usa essa leitura.
    IF v_company_id IS NULL THEN
      SELECT p.company_id INTO v_company_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
      LIMIT 1;
    END IF;

    NEW.company_id := v_company_id;
  END IF;

  RETURN NEW;
END;
$$;

RAISE NOTICE '[055] Função auto_set_company_id atualizada com JWT-first strategy.';

-- ============================================================
-- Garantir que os triggers estão aplicados (idempotente)
-- ============================================================
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

DROP TRIGGER IF EXISTS auto_company_id ON public.activities;
CREATE TRIGGER auto_company_id
  BEFORE INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id();

RAISE NOTICE '[055] Triggers re-aplicados em contacts, crm_companies, deals, boards, activities.';

-- ============================================================
-- Também garantir que a policy contacts_insert não bloqueia
-- leads que enviam company_id válido diretamente
-- ============================================================
-- A policy contacts_insert da Migration 053 já permite:
--   company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
-- Com o JWT, o company_id chega preenchido no NEW antes da política ser avaliada,
-- então a cláusula "OR company_id IS NULL" não é mais necessária para leads normais.
-- Mantemos para compatibilidade com inserts externos (webhooks).

RAISE NOTICE '[055] Políticas de contacts_insert inalteradas — compatíveis com JWT flow.';

COMMIT;

-- ============================================================
-- VERIFICAÇÃO (execute após COMMIT no SQL Editor)
-- ============================================================
-- Confirmar que a função foi atualizada
SELECT proname, prosecdef AS security_definer, prosrc
FROM pg_proc
WHERE proname = 'auto_set_company_id'
  AND pronamespace = 'public'::regnamespace;

-- Confirmar triggers ativos
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'auto_company_id'
  AND trigger_schema = 'public'
ORDER BY event_object_table;
