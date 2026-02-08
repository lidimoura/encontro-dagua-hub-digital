-- ============================================
-- SPRINT FINAL: SQL SCRIPT V6 (TYPE-FIXED)
-- Execute este script no Editor SQL do Supabase
-- ============================================
-- CORREÇÃO: first_stage_id UUID (não TEXT)
-- Usa schema REAL do banco (products table, não tech_stack separada)
-- ============================================

-- ============================================
-- 1. DEMO ISOLATION FLAGS (se não existirem)
-- ============================================

-- Add demo flag to profiles (idempotent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Add demo data flag to deals (idempotent)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.is_demo IS 'Flag to isolate demo users from real production data';
COMMENT ON COLUMN deals.is_demo_data IS 'Flag to mark deals created in demo mode';

-- ============================================
-- 2. CRIAR USUÁRIO DEMO (provadagua@hub.com)
-- ============================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Verificar se usuário já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'provadagua@hub.com') INTO user_exists;
  
  -- Pegar o primeiro company_id disponível (ou criar um específico para demo)
  SELECT id INTO demo_company_id FROM companies LIMIT 1;
  
  -- Se não houver company, criar uma para demo
  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, industry, size)
    VALUES ('Demo Company', 'Technology', 'small')
    RETURNING id INTO demo_company_id;
  END IF;

  -- Criar usuário apenas se não existir
  IF NOT user_exists THEN
    -- CORREÇÃO CRÍTICA: raw_user_meta_data com role='cliente'
    -- Evita que trigger handle_new_user() use COALESCE fallback 'user'
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'provadagua@hub.com',
      crypt('provadagua', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'cliente',
        'full_name', 'Prova D''água Demo',
        'company_id', demo_company_id::text
      ),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO demo_user_id;
    
    RAISE NOTICE 'Demo user created with ID: %', demo_user_id;
  ELSE
    -- Usuário já existe, pegar o ID
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'provadagua@hub.com';
    RAISE NOTICE 'Demo user already exists with ID: %', demo_user_id;
  END IF;

  -- Atualizar profile se necessário (trigger handle_new_user já criou)
  UPDATE profiles
  SET 
    is_demo = true,
    role = 'cliente',
    user_type = 'client',
    company_id = demo_company_id
  WHERE id = demo_user_id;

  RAISE NOTICE 'Demo company ID: %', demo_company_id;
END $$;

-- ============================================
-- 3. SEED DATA: PRODUTOS DE EXEMPLO (DEMO)
-- ============================================

DO $$
DECLARE
  demo_company_id UUID;
BEGIN
  SELECT company_id INTO demo_company_id 
  FROM profiles 
  WHERE email = 'provadagua@hub.com';

  -- Inserir produtos de exemplo usando schema REAL
  -- Colunas: name, description, price (não base_price), category, is_active
  INSERT INTO products (company_id, name, description, price, category, is_active, unit)
  VALUES
    (
      demo_company_id,
      'Consultoria CRM Completa',
      'Implementação completa de CRM personalizado com integração de sistemas',
      15000.00,
      'Consultoria',
      true,
      'projeto'
    ),
    (
      demo_company_id,
      'Setup Inicial + Treinamento',
      'Configuração inicial do Hub e treinamento da equipe (2 sessões)',
      3500.00,
      'Serviço',
      true,
      'pacote'
    ),
    (
      demo_company_id,
      'Prompt Lab - Plano Mensal',
      'Acesso ao Prompt Lab com 100 gerações de prompts por mês',
      297.00,
      'Assinatura',
      true,
      'mês'
    ),
    (
      demo_company_id,
      'QR d''água Premium',
      'Geração ilimitada de QR Codes personalizados + Analytics',
      197.00,
      'Assinatura',
      true,
      'mês'
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Produtos de exemplo criados para company_id: %', demo_company_id;
END $$;

-- ============================================
-- 4. SEED DATA: TECH STACK (usando products table)
-- ============================================

DO $$
DECLARE
  demo_company_id UUID;
BEGIN
  SELECT company_id INTO demo_company_id 
  FROM profiles 
  WHERE email = 'provadagua@hub.com';

  -- Inserir tech stack usando products table com product_type='tech_stack'
  -- Schema: name, description, price, product_type, is_internal, stack_category, external_url, auto_update_pricing, pricing_model, metadata
  INSERT INTO products (
    company_id, 
    name, 
    description, 
    price, 
    product_type,
    is_internal,
    stack_category,
    external_url,
    auto_update_pricing,
    pricing_model,
    metadata
  )
  VALUES
    (
      demo_company_id,
      'Supabase Pro',
      'Backend as a Service (Database + Auth + Storage + Edge Functions)',
      25.00,
      'tech_stack',
      true,
      'database',
      'https://supabase.com/pricing',
      true,
      'fixed',
      '{"limits": {"database_size": "8GB", "bandwidth": "250GB", "storage": "100GB"}}'::jsonb
    ),
    (
      demo_company_id,
      'Vercel Pro',
      'Plataforma de deploy e hosting para aplicações web',
      20.00,
      'tech_stack',
      true,
      'hosting',
      'https://vercel.com/pricing',
      true,
      'fixed',
      '{"limits": {"bandwidth": "1TB", "builds": "6000/month", "team_members": "unlimited"}}'::jsonb
    ),
    (
      demo_company_id,
      'Google Gemini 2.0 Flash',
      'API de IA Generativa (Google)',
      0.00,
      'tech_stack',
      true,
      'ai',
      'https://ai.google.dev/pricing',
      true,
      'free',
      '{"pricing_model": "free_tier", "limits": "1500 RPD", "paid_tier_available": true}'::jsonb
    ),
    (
      demo_company_id,
      'GitHub Pro',
      'Controle de versão e CI/CD integrado',
      4.00,
      'tech_stack',
      true,
      'other',
      'https://github.com/pricing',
      true,
      'fixed',
      '{"limits": {"repos": "unlimited", "actions_minutes": "3000/month"}}'::jsonb
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Tech stack de exemplo criado para company_id: %', demo_company_id;
END $$;

-- ============================================
-- 5. SEED DATA: DEALS FICTÍCIOS (DEMO)
-- ============================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
  demo_board_id UUID;
  first_stage_id UUID;  -- CORREÇÃO: UUID em vez de TEXT
BEGIN
  -- Pegar IDs do usuário demo
  SELECT id, company_id INTO demo_user_id, demo_company_id
  FROM profiles 
  WHERE email = 'provadagua@hub.com';

  -- Pegar o primeiro board disponível (ou criar um)
  SELECT id INTO demo_board_id FROM boards WHERE company_id = demo_company_id LIMIT 1;
  
  IF demo_board_id IS NULL THEN
    INSERT INTO boards (company_id, name, description)
    VALUES (demo_company_id, 'Pipeline de Vendas', 'Board principal para gestão de vendas')
    RETURNING id INTO demo_board_id;
  END IF;

  -- Pegar o primeiro stage do board
  SELECT id INTO first_stage_id FROM board_stages WHERE board_id = demo_board_id ORDER BY "order" LIMIT 1;
  
  -- Se não houver stage, não criar deals (evita erro)
  IF first_stage_id IS NULL THEN
    RAISE NOTICE 'Nenhum stage encontrado para o board. Deals não serão criados.';
    RETURN;
  END IF;

  -- Deal 1: Consultoria CRM para TechCorp
  INSERT INTO deals (
    company_id,
    board_id,
    stage_id,
    title,
    value,
    probability,
    priority,
    status,
    tags,
    is_demo_data,
    created_at
  )
  VALUES (
    demo_company_id,
    demo_board_id,
    first_stage_id,
    'Implementação CRM - TechCorp',
    15000.00,
    60,
    'high',
    first_stage_id,
    ARRAY['Demo', 'Consultoria', 'Tech'],
    true,
    NOW() - INTERVAL '5 days'
  )
  ON CONFLICT DO NOTHING;

  -- Deal 2: Setup + Treinamento para StartupXYZ
  INSERT INTO deals (
    company_id,
    board_id,
    stage_id,
    title,
    value,
    probability,
    priority,
    status,
    tags,
    is_demo_data,
    created_at
  )
  VALUES (
    demo_company_id,
    demo_board_id,
    first_stage_id,
    'Setup Inicial - StartupXYZ',
    3500.00,
    80,
    'medium',
    first_stage_id,
    ARRAY['Demo', 'Setup', 'Startup'],
    true,
    NOW() - INTERVAL '2 days'
  )
  ON CONFLICT DO NOTHING;

  -- Deal 3: Assinatura Prompt Lab para AgênciaABC
  INSERT INTO deals (
    company_id,
    board_id,
    stage_id,
    title,
    value,
    probability,
    priority,
    status,
    tags,
    is_demo_data,
    created_at
  )
  VALUES (
    demo_company_id,
    demo_board_id,
    first_stage_id,
    'Prompt Lab Mensal - AgênciaABC',
    297.00,
    90,
    'low',
    first_stage_id,
    ARRAY['Demo', 'Assinatura', 'Marketing'],
    true,
    NOW() - INTERVAL '1 day'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Deals fictícios criados para demo user';
END $$;

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  tech_stack_count INT;
  products_count INT;
  deals_count INT;
  demo_user_exists BOOLEAN;
  demo_user_role TEXT;
  demo_metadata JSONB;
BEGIN
  SELECT COUNT(*) INTO tech_stack_count FROM products WHERE product_type = 'tech_stack';
  SELECT COUNT(*) INTO products_count FROM products WHERE product_type != 'tech_stack' OR product_type IS NULL;
  SELECT COUNT(*) INTO deals_count FROM deals WHERE is_demo_data = true;
  SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'provadagua@hub.com') INTO demo_user_exists;
  SELECT role INTO demo_user_role FROM profiles WHERE email = 'provadagua@hub.com';
  SELECT raw_user_meta_data INTO demo_metadata FROM auth.users WHERE email = 'provadagua@hub.com';

  RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
  RAISE NOTICE 'Tech Stack cadastrado: %', tech_stack_count;
  RAISE NOTICE 'Produtos cadastrados: %', products_count;
  RAISE NOTICE 'Deals demo criados: %', deals_count;
  RAISE NOTICE 'Usuário demo existe: %', demo_user_exists;
  RAISE NOTICE 'Role do usuário demo: %', demo_user_role;
  RAISE NOTICE 'Metadata do usuário: %', demo_metadata;
  RAISE NOTICE '========================';
  RAISE NOTICE 'Login: provadagua@hub.com';
  RAISE NOTICE 'Senha: provadagua';
  RAISE NOTICE '========================';
END $$;

-- ============================================
-- SCRIPT V6 CONCLUÍDO (TYPE-FIXED)
-- ============================================
-- CORREÇÕES APLICADAS:
-- 1. first_stage_id UUID (não TEXT) - FIX TYPE MISMATCH
-- 2. Usa products table (não tech_stack separada)
-- 3. Colunas corretas: price (não base_price), name (não nome)
-- 4. Tech stack = product_type='tech_stack'
-- 5. raw_user_meta_data com role='cliente'
-- ============================================
