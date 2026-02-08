-- ============================================
-- SPRINT FINAL: SQL SCRIPT COMPLETO
-- Execute este script no Editor SQL do Supabase
-- ============================================

-- ============================================
-- 1. CRIAÇÃO DA TABELA PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their company products" ON products;
CREATE POLICY "Users can view their company products"
  ON products FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. DEMO ISOLATION FLAGS
-- ============================================

-- Add demo flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Add demo data flag to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.is_demo IS 'Flag to isolate demo users from real production data';
COMMENT ON COLUMN deals.is_demo_data IS 'Flag to mark deals created in demo mode';

-- ============================================
-- 3. TECH STACK ENHANCEMENTS (AI-READY)
-- ============================================

ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS features_inclusas JSONB DEFAULT '[]';
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS beneficios_plano TEXT;
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS limites TEXT;
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS pricing_page_url TEXT;
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS last_ai_check_at TIMESTAMPTZ;

COMMENT ON COLUMN tech_stack.features_inclusas IS 'Array of features included in this tool/service (e.g., ["API Access", "3 Users", "10GB Storage"])';
COMMENT ON COLUMN tech_stack.beneficios_plano IS 'Plan benefits description for sales proposals';
COMMENT ON COLUMN tech_stack.limites IS 'Usage limits (e.g., "Até 3 users", "API Ilimitada", "100 requests/day")';
COMMENT ON COLUMN tech_stack.pricing_page_url IS 'URL for AI to check current pricing automatically';
COMMENT ON COLUMN tech_stack.last_ai_check_at IS 'Last time AI verified pricing from the URL';

-- ============================================
-- 4. CRIAR USUÁRIO DEMO (provadagua@hub.com)
-- ============================================

-- IMPORTANTE: Substitua 'YOUR_COMPANY_ID' pelo ID real da sua company
-- Para descobrir, execute: SELECT id FROM companies LIMIT 1;

DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
BEGIN
  -- Pegar o primeiro company_id disponível (ou criar um específico para demo)
  SELECT id INTO demo_company_id FROM companies LIMIT 1;
  
  -- Se não houver company, criar uma para demo
  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, industry, size)
    VALUES ('Demo Company', 'Technology', 'small')
    RETURNING id INTO demo_company_id;
  END IF;

  -- Criar usuário no auth.users (se não existir)
  -- NOTA: A senha será 'provadagua' (hash bcrypt)
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
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO demo_user_id;

  -- Se o usuário já existia, pegar o ID
  IF demo_user_id IS NULL THEN
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'provadagua@hub.com';
  END IF;

  -- Criar profile para o usuário demo
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    company_id,
    is_demo
  )
  VALUES (
    demo_user_id,
    'provadagua@hub.com',
    'Prova D''água Demo',
    'user',
    demo_company_id,
    true  -- FLAG DE DEMO
  )
  ON CONFLICT (id) DO UPDATE
  SET is_demo = true;

  RAISE NOTICE 'Demo user created with ID: %', demo_user_id;
  RAISE NOTICE 'Demo company ID: %', demo_company_id;
END $$;

-- ============================================
-- 5. SEED DATA: PRODUTOS DE EXEMPLO
-- ============================================

-- Pegar o company_id do usuário demo
DO $$
DECLARE
  demo_company_id UUID;
BEGIN
  SELECT company_id INTO demo_company_id 
  FROM profiles 
  WHERE email = 'provadagua@hub.com';

  -- Inserir produtos de exemplo
  INSERT INTO products (company_id, name, description, base_price, category, is_active)
  VALUES
    (
      demo_company_id,
      'Consultoria CRM Completa',
      'Implementação completa de CRM personalizado com integração de sistemas',
      15000.00,
      'Consultoria',
      true
    ),
    (
      demo_company_id,
      'Setup Inicial + Treinamento',
      'Configuração inicial do Hub e treinamento da equipe (2 sessões)',
      3500.00,
      'Serviço',
      true
    ),
    (
      demo_company_id,
      'Prompt Lab - Plano Mensal',
      'Acesso ao Prompt Lab com 100 gerações de prompts por mês',
      297.00,
      'Assinatura',
      true
    ),
    (
      demo_company_id,
      'QR d''água Premium',
      'Geração ilimitada de QR Codes personalizados + Analytics',
      197.00,
      'Assinatura',
      true
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Produtos de exemplo criados para company_id: %', demo_company_id;
END $$;

-- ============================================
-- 6. SEED DATA: DEALS FICTÍCIOS (DEMO)
-- ============================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
  demo_board_id UUID;
  first_stage_id TEXT;
  product_consultoria_id UUID;
  product_setup_id UUID;
  product_promptlab_id UUID;
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
  
  IF first_stage_id IS NULL THEN
    first_stage_id := 'LEAD';  -- Fallback para stage padrão
  END IF;

  -- Pegar IDs dos produtos
  SELECT id INTO product_consultoria_id FROM products WHERE name = 'Consultoria CRM Completa' AND company_id = demo_company_id;
  SELECT id INTO product_setup_id FROM products WHERE name = 'Setup Inicial + Treinamento' AND company_id = demo_company_id;
  SELECT id INTO product_promptlab_id FROM products WHERE name = 'Prompt Lab - Plano Mensal' AND company_id = demo_company_id;

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
    true,  -- MARCADO COMO DEMO
    NOW() - INTERVAL '5 days'
  );

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
  );

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
  );

  RAISE NOTICE 'Deals fictícios criados para demo user';
END $$;

-- ============================================
-- 7. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se tudo foi criado corretamente
DO $$
DECLARE
  products_count INT;
  deals_count INT;
  demo_user_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO products_count FROM products;
  SELECT COUNT(*) INTO deals_count FROM deals WHERE is_demo_data = true;
  SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'provadagua@hub.com') INTO demo_user_exists;

  RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
  RAISE NOTICE 'Produtos cadastrados: %', products_count;
  RAISE NOTICE 'Deals demo criados: %', deals_count;
  RAISE NOTICE 'Usuário demo existe: %', demo_user_exists;
  RAISE NOTICE '========================';
END $$;

-- ============================================
-- SCRIPT CONCLUÍDO
-- ============================================
-- Login: provadagua@hub.com
-- Senha: provadagua
-- ============================================
