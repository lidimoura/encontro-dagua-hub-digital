-- ============================================
-- CRITICAL FIX: DATA LEAK & DEMO ISOLATION
-- Execute este script no Editor SQL do Supabase
-- ============================================

DO $$
DECLARE
  demo_company_id UUID;
  demo_user_id UUID;
  demo_board_id UUID;
  stage_todo_id UUID;
  stage_progress_id UUID;
  stage_done_id UUID;
BEGIN
  -- Get Demo Company and User
  SELECT id INTO demo_company_id FROM companies WHERE name = 'Demo Company' AND deleted_at IS NULL;
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'provadagua@hub.com';
  
  IF demo_company_id IS NULL OR demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo Company or User not found! Run FIX_promote_demo_user_to_admin_V2.sql first.';
  END IF;
  
  RAISE NOTICE '✅ Demo Company ID: %', demo_company_id;
  RAISE NOTICE '✅ Demo User ID: %', demo_user_id;
  
  -- ============================================
  -- 1. DELETE REAL DATA VISIBLE TO DEMO USER
  -- ============================================
  -- This ensures demo user ONLY sees demo data
  
  DELETE FROM contacts WHERE company_id != demo_company_id;
  DELETE FROM deals WHERE company_id != demo_company_id;
  DELETE FROM boards WHERE company_id != demo_company_id;
  DELETE FROM board_stages WHERE company_id != demo_company_id;
  
  RAISE NOTICE '✅ Cleaned up non-demo data';
  
  -- ============================================
  -- 2. SEED DEMO CONTACTS (ENGLISH)
  -- ============================================
  
  INSERT INTO contacts (name, email, phone, company_name, stage, status, notes, company_id, owner_id, created_at)
  VALUES
    ('John Doe', 'john.doe@example.com', '+1 (555) 123-4567', 'Acme Corp', 'LEAD', 'ACTIVE', 'Interested in our CRM solution. First contact via website form.', demo_company_id, demo_user_id, NOW() - INTERVAL '5 days'),
    ('Jane Smith', 'jane.smith@techstart.io', '+1 (555) 234-5678', 'TechStart Inc', 'PROSPECT', 'ACTIVE', 'Scheduled demo for next week. High potential client.', demo_company_id, demo_user_id, NOW() - INTERVAL '3 days'),
    ('Robert Johnson', 'robert@innovate.com', '+1 (555) 345-6789', 'Innovate Solutions', 'CUSTOMER', 'ACTIVE', 'Closed deal last month. Very satisfied with the product.', demo_company_id, demo_user_id, NOW() - INTERVAL '30 days')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '✅ Seeded 3 demo contacts in English';
  
  -- ============================================
  -- 3. CREATE ONBOARDING BOARD (ENGLISH)
  -- ============================================
  
  INSERT INTO boards (name, description, type, is_default, company_id, owner_id, created_at)
  VALUES ('CRM Onboarding', 'Learn how to use your CRM with this interactive guide', 'SALES', true, demo_company_id, demo_user_id, NOW())
  RETURNING id INTO demo_board_id;
  
  -- Create Stages
  INSERT INTO board_stages (board_id, name, label, color, "order", company_id, created_at)
  VALUES 
    (demo_board_id, 'To Do', 'TO_DO', 'bg-slate-500', 0, demo_company_id, NOW())
  RETURNING id INTO stage_todo_id;
  
  INSERT INTO board_stages (board_id, name, label, color, "order", company_id, created_at)
  VALUES 
    (demo_board_id, 'In Progress', 'IN_PROGRESS', 'bg-blue-500', 1, demo_company_id, NOW())
  RETURNING id INTO stage_progress_id;
  
  INSERT INTO board_stages (board_id, name, label, color, "order", company_id, created_at)
  VALUES 
    (demo_board_id, 'Done', 'DONE', 'bg-green-500', 2, demo_company_id, NOW())
  RETURNING id INTO stage_done_id;
  
  -- Create Demo Deals (Cards)
  INSERT INTO deals (title, value, status, priority, board_id, stage_id, company_id, owner_id, created_at)
  VALUES
    ('Add your first contact', 0, 'OPEN', 'high', demo_board_id, stage_todo_id, demo_company_id, demo_user_id, NOW()),
    ('Create a sales pipeline', 0, 'OPEN', 'medium', demo_board_id, stage_todo_id, demo_company_id, demo_user_id, NOW()),
    ('Explore AI Agents', 0, 'OPEN', 'medium', demo_board_id, stage_progress_id, demo_company_id, demo_user_id, NOW()),
    ('Welcome to your CRM!', 0, 'CLOSED_WON', 'low', demo_board_id, stage_done_id, demo_company_id, demo_user_id, NOW());
  
  RAISE NOTICE '✅ Created Onboarding Board with demo cards';
  
  -- ============================================
  -- 4. VERIFY RLS IS ACTIVE
  -- ============================================
  
  -- Check if RLS is enabled on contacts
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'contacts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '⚠️ RLS was DISABLED on contacts - ENABLED now';
  ELSE
    RAISE NOTICE '✅ RLS already enabled on contacts';
  END IF;
  
END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
SELECT 
  'Contacts visible to demo user' as check_type,
  COUNT(*) as count
FROM contacts
WHERE company_id = (SELECT company_id FROM profiles WHERE email = 'provadagua@hub.com');

SELECT 
  'Demo contacts details' as check_type,
  name, email, stage, status
FROM contacts
WHERE company_id = (SELECT company_id FROM profiles WHERE email = 'provadagua@hub.com')
ORDER BY created_at DESC;

-- ============================================
-- EXPECTED RESULT:
-- Should see ONLY 3 contacts: John Doe, Jane Smith, Robert Johnson
-- ============================================
