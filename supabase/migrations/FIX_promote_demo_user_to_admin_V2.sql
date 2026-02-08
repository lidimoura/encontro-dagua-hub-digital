-- ============================================
-- CORREÇÃO V2: PROMOVER DEMO USER PARA ADMIN
-- Execute este script no Editor SQL do Supabase
-- ============================================
-- SCHEMA REAL:
-- companies: id, name, deleted_at, created_at, updated_at
-- profiles: id, email, name, avatar, role, company_id, ...
-- ============================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
BEGIN
  -- Pegar ID do usuário demo
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'provadagua@hub.com';
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário provadagua@hub.com não encontrado!';
  END IF;
  
  -- Pegar ID da Demo Company (ou criar se não existir)
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Company' AND deleted_at IS NULL;
  
  IF demo_company_id IS NULL THEN
    -- Criar Demo Company (apenas com name)
    INSERT INTO companies (name)
    VALUES ('Demo Company')
    RETURNING id INTO demo_company_id;
    RAISE NOTICE '✅ Demo Company criada com ID: %', demo_company_id;
  ELSE
    RAISE NOTICE '✅ Demo Company encontrada: %', demo_company_id;
  END IF;
  
  -- Update profile: ADMIN + Demo Company + Reset Onboarding
  UPDATE profiles
  SET 
    role = 'admin',
    company_id = demo_company_id
  WHERE id = demo_user_id;
  
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'role', 'admin',
    'full_name', 'Prova D''água Demo',
    'company_id', demo_company_id::text
  )
  WHERE id = demo_user_id;
  
  -- Reset onboarding flag (se existir a coluna)
  UPDATE user_settings
  SET onboarding_completed = false
  WHERE user_id = demo_user_id;
  
  RAISE NOTICE '✅ Usuário promovido para ADMIN';
  RAISE NOTICE 'User ID: %', demo_user_id;
  RAISE NOTICE 'Company ID: %', demo_company_id;
  RAISE NOTICE 'Onboarding resetado (se user_settings existir)';
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.company_id,
  c.name as company_name,
  au.raw_user_meta_data->>'role' as metadata_role,
  us.onboarding_completed
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN user_settings us ON us.user_id = p.id
WHERE p.email = 'provadagua@hub.com';

-- ============================================
-- RESULTADO ESPERADO:
-- role: admin
-- company_name: Demo Company
-- metadata_role: admin
-- onboarding_completed: false (ou null se não existir)
-- ============================================

-- ============================================
-- INSTRUÇÕES PÓS-EXECUÇÃO:
-- 1. Faça LOGOUT do app
-- 2. Faça LOGIN novamente como provadagua@hub.com
-- 3. O usuário deve ver o CRM completo (não /portal)
-- 4. Onboarding tour deve aparecer
-- ============================================
