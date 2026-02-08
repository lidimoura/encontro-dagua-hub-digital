-- ============================================
-- CORREÇÃO URGENTE: PROMOVER DEMO USER PARA ADMIN
-- Execute este script no Editor SQL do Supabase
-- ============================================

-- 1. PROMOVER USUÁRIO PARA ADMIN
DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
BEGIN
  -- Pegar ID do usuário demo
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'provadagua@hub.com';
  
  -- Pegar ID da Demo Company
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Company';
  
  -- Se não encontrar Demo Company, criar
  IF demo_company_id IS NULL THEN
    INSERT INTO companies (name, industry, size)
    VALUES ('Demo Company', 'Technology', 'small')
    RETURNING id INTO demo_company_id;
    RAISE NOTICE 'Demo Company criada com ID: %', demo_company_id;
  END IF;
  
  -- Update profile: ADMIN + Demo Company
  UPDATE profiles
  SET 
    role = 'admin',
    user_type = 'team_member',
    company_id = demo_company_id,
    has_seen_onboarding = false  -- Reset onboarding
  WHERE id = demo_user_id;
  
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'role', 'admin',
    'full_name', 'Prova D''água Demo',
    'company_id', demo_company_id::text
  )
  WHERE id = demo_user_id;
  
  RAISE NOTICE '✅ Usuário promovido para ADMIN';
  RAISE NOTICE 'User ID: %', demo_user_id;
  RAISE NOTICE 'Company ID: %', demo_company_id;
  RAISE NOTICE 'Onboarding resetado: has_seen_onboarding = false';
END $$;

-- 2. VERIFICAÇÃO
SELECT 
  p.id,
  p.email,
  p.role,
  p.user_type,
  p.company_id,
  c.name as company_name,
  p.has_seen_onboarding,
  au.raw_user_meta_data->>'role' as metadata_role
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'provadagua@hub.com';

-- ============================================
-- RESULTADO ESPERADO:
-- role: admin
-- user_type: team_member
-- company_name: Demo Company
-- has_seen_onboarding: false
-- metadata_role: admin
-- ============================================
