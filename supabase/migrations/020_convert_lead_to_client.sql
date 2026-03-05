-- ============================================================
-- MIGRATION 020: RPC convert_lead_to_client
-- Sprint: 2026-03-04 | Projeto: Encontro d'Água Hub Digital
-- ============================================================
-- Cria a função RPC que converte um lead em contact + deal,
-- transferindo briefing_json e linkdagua_user_id.
-- ============================================================

-- ------------------------------------------------------------
-- 1. FUNÇÃO: convert_lead_to_client
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.convert_lead_to_client(
  p_lead_id    UUID,
  p_stage_id   UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead              RECORD;
  v_company_id        UUID;
  v_contact_id        UUID;
  v_deal_id           UUID;
  v_board_id          UUID;
  v_stage_id          UUID;
  v_contact_name      TEXT;
BEGIN
  -- --------------------------------------------------------
  -- 1. Buscar o lead e validar
  -- --------------------------------------------------------
  SELECT * INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead % não encontrado', p_lead_id;
  END IF;

  IF v_lead.status = 'CONVERTED' THEN
    RAISE EXCEPTION 'Lead % já foi convertido anteriormente', p_lead_id;
  END IF;

  v_company_id := v_lead.company_id;

  -- --------------------------------------------------------
  -- 2. Resolver o nome do contato
  --    Prioridade: briefing_json.name > lead.name
  -- --------------------------------------------------------
  v_contact_name := COALESCE(
    v_lead.briefing_json->>'name',
    v_lead.name
  );

  -- --------------------------------------------------------
  -- 3. Criar o Contact
  -- --------------------------------------------------------
  INSERT INTO public.contacts (
    company_id,
    name,
    email,
    phone,
    source,
    stage,
    briefing_json,
    linkdagua_user_id,
    owner_id,
    created_at,
    updated_at
  )
  VALUES (
    v_company_id,
    v_contact_name,
    v_lead.email,
    COALESCE(v_lead.briefing_json->>'whatsapp', NULL),
    v_lead.source,
    'CUSTOMER',          -- já entra como cliente
    v_lead.briefing_json,
    v_lead.linkdagua_user_id,
    v_lead.owner_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_contact_id;

  -- --------------------------------------------------------
  -- 4. Resolver board e stage
  -- --------------------------------------------------------
  -- Pegar o primeiro board da empresa
  SELECT id INTO v_board_id
  FROM public.boards
  WHERE company_id = v_company_id
  ORDER BY created_at ASC
  LIMIT 1;

  -- Usar stage passado como parâmetro ou pegar o primeiro
  IF p_stage_id IS NOT NULL THEN
    v_stage_id := p_stage_id;
  ELSE
    SELECT id INTO v_stage_id
    FROM public.board_stages
    WHERE board_id = v_board_id
    ORDER BY "order" ASC
    LIMIT 1;
  END IF;

  -- --------------------------------------------------------
  -- 5. Criar Deal vinculado ao Contact
  -- --------------------------------------------------------
  INSERT INTO public.deals (
    company_id,
    board_id,
    stage_id,
    contact_id,
    title,
    value,
    status,
    tags,
    owner_id,
    created_at,
    updated_at
  )
  VALUES (
    v_company_id,
    v_board_id,
    v_stage_id,
    v_contact_id,
    v_contact_name,
    0,
    v_stage_id,     -- status = stage_id inicial
    ARRAY[v_lead.source],
    v_lead.owner_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_deal_id;

  -- --------------------------------------------------------
  -- 6. Marcar lead como CONVERTIDO
  -- --------------------------------------------------------
  UPDATE public.leads
  SET
    status = 'CONVERTED',
    converted_to_contact_id = v_contact_id,
    updated_at = NOW()
  WHERE id = p_lead_id;

  -- --------------------------------------------------------
  -- 7. Retornar resultado
  -- --------------------------------------------------------
  RETURN jsonb_build_object(
    'success',     true,
    'contact_id',  v_contact_id,
    'deal_id',     v_deal_id,
    'lead_id',     p_lead_id,
    'name',        v_contact_name,
    'source',      v_lead.source
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

-- Grant para usuários autenticados chamarem via RPC
GRANT EXECUTE ON FUNCTION public.convert_lead_to_client(UUID, UUID)
  TO authenticated;

-- ------------------------------------------------------------
-- 2. VERIFICAÇÃO
-- ------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION 020 CONCLUÍDA ===';
  RAISE NOTICE 'Função convert_lead_to_client criada/atualizada.';
  RAISE NOTICE 'Uso: SELECT convert_lead_to_client(''<lead_uuid>''::UUID);';
  RAISE NOTICE 'Ou:  SELECT convert_lead_to_client(''<lead_uuid>''::UUID, ''<stage_uuid>''::UUID);';
END $$;
