-- ============================================================================
-- SEED DATA FOR PROVADAGUA DEMO ACCOUNT
-- ============================================================================
-- Purpose: Populate demo data for provadagua@hub.com user
-- Tables: boards, board_stages, contacts, deals
-- Language: English (for international demo)
-- ============================================================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_company_id UUID;
  sales_board_id UUID;
  stage_lead_in_id UUID;
  stage_discovery_id UUID;
  stage_proposal_id UUID;
  stage_negotiation_id UUID;
  stage_closed_won_id UUID;
  contact_amanda_id UUID;
  contact_michael_id UUID;
  contact_sarah_id UUID;
BEGIN
  -- ============================================================================
  -- 1. GET PROVADAGUA USER AND COMPANY IDs
  -- ============================================================================
  
  SELECT id INTO demo_user_id 
  FROM auth.users 
  WHERE email = 'provadagua@hub.com';
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'User provadagua@hub.com not found. Please create user first.';
  END IF;
  
  SELECT company_id INTO demo_company_id 
  FROM profiles 
  WHERE id = demo_user_id;
  
  IF demo_company_id IS NULL THEN
    RAISE EXCEPTION 'Company not found for provadagua user. Please check profiles table.';
  END IF;
  
  RAISE NOTICE 'Found user: % with company: %', demo_user_id, demo_company_id;
  
  -- ============================================================================
  -- 2. CREATE SALES PIPELINE BOARD
  -- ============================================================================
  
  -- Check if board already exists
  SELECT id INTO sales_board_id 
  FROM boards 
  WHERE company_id = demo_company_id 
  AND name = 'Sales Pipeline'
  LIMIT 1;
  
  IF sales_board_id IS NULL THEN
    INSERT INTO boards (
      id,
      name,
      description,
      type,
      is_default,
      goal_description,
      goal_kpi,
      goal_target_value,
      goal_type,
      agent_name,
      agent_role,
      agent_behavior,
      company_id,
      owner_id
    ) VALUES (
      gen_random_uuid(),
      'Sales Pipeline',
      'Main sales pipeline for tracking deals from lead to close',
      'SALES',
      true,
      'Close $50,000 in new business this quarter',
      'Revenue',
      '50000',
      'revenue',
      'Sales AI',
      'Sales Assistant',
      'Professional and results-focused',
      demo_company_id,
      demo_user_id
    ) RETURNING id INTO sales_board_id;
    
    RAISE NOTICE 'Created Sales Pipeline board: %', sales_board_id;
  ELSE
    RAISE NOTICE 'Sales Pipeline board already exists: %', sales_board_id;
  END IF;
  
  -- ============================================================================
  -- 3. CREATE BOARD STAGES (ENGLISH)
  -- ============================================================================
  
  -- Lead In
  INSERT INTO board_stages (id, board_id, name, label, color, "order", is_default, company_id)
  VALUES (
    gen_random_uuid(),
    sales_board_id,
    'Lead In',
    'Lead In',
    '#3B82F6',
    0,
    true,
    demo_company_id
  ) RETURNING id INTO stage_lead_in_id;
  
  -- Discovery
  INSERT INTO board_stages (id, board_id, name, label, color, "order", is_default, company_id)
  VALUES (
    gen_random_uuid(),
    sales_board_id,
    'Discovery',
    'Discovery',
    '#8B5CF6',
    1,
    false,
    demo_company_id
  ) RETURNING id INTO stage_discovery_id;
  
  -- Proposal
  INSERT INTO board_stages (id, board_id, name, label, color, "order", is_default, company_id)
  VALUES (
    gen_random_uuid(),
    sales_board_id,
    'Proposal',
    'Proposal',
    '#F59E0B',
    2,
    false,
    demo_company_id
  ) RETURNING id INTO stage_proposal_id;
  
  -- Negotiation
  INSERT INTO board_stages (id, board_id, name, label, color, "order", is_default, company_id)
  VALUES (
    gen_random_uuid(),
    sales_board_id,
    'Negotiation',
    'Negotiation',
    '#EC4899',
    3,
    false,
    demo_company_id
  ) RETURNING id INTO stage_negotiation_id;
  
  -- Closed Won
  INSERT INTO board_stages (id, board_id, name, label, color, "order", is_default, company_id)
  VALUES (
    gen_random_uuid(),
    sales_board_id,
    'Closed Won',
    'Closed Won',
    '#10B981',
    4,
    false,
    demo_company_id
  ) RETURNING id INTO stage_closed_won_id;
  
  RAISE NOTICE 'Created 5 board stages';
  
  -- ============================================================================
  -- 4. CREATE DEMO CONTACTS
  -- ============================================================================
  
  INSERT INTO contacts (id, name, email, phone, company_name, role, company_id, owner_id)
  VALUES (
    gen_random_uuid(),
    'Amanda Chen',
    'amanda.chen@novamind.ai',
    '+1 (555) 123-4567',
    'NovaMind AI',
    'CEO',
    demo_company_id,
    demo_user_id
  ) RETURNING id INTO contact_amanda_id;
  
  INSERT INTO contacts (id, name, email, phone, company_name, role, company_id, owner_id)
  VALUES (
    gen_random_uuid(),
    'Michael Rodriguez',
    'michael@techstartup.io',
    '+1 (555) 234-5678',
    'TechStartup Inc',
    'CTO',
    demo_company_id,
    demo_user_id
  ) RETURNING id INTO contact_michael_id;
  
  INSERT INTO contacts (id, name, email, phone, company_name, role, company_id, owner_id)
  VALUES (
    gen_random_uuid(),
    'Sarah Johnson',
    'sarah.j@globalcorp.com',
    '+1 (555) 345-6789',
    'Global Corp',
    'VP of Operations',
    demo_company_id,
    demo_user_id
  ) RETURNING id INTO contact_sarah_id;
  
  RAISE NOTICE 'Created 3 demo contacts';
  
  -- ============================================================================
  -- 5. CREATE DEMO DEALS
  -- ============================================================================
  
  -- Deal 1: NovaMind AI - Discovery Stage
  INSERT INTO deals (
    id,
    title,
    value,
    probability,
    status,
    priority,
    board_id,
    stage_id,
    contact_id,
    tags,
    company_id,
    owner_id
  ) VALUES (
    gen_random_uuid(),
    'NovaMind AI - Enterprise Package',
    25000,
    60,
    'Discovery',
    'high',
    sales_board_id,
    stage_discovery_id,
    contact_amanda_id,
    ARRAY['enterprise', 'ai', 'high-value'],
    demo_company_id,
    demo_user_id
  );
  
  -- Deal 2: TechStartup - Proposal Stage
  INSERT INTO deals (
    id,
    title,
    value,
    probability,
    status,
    priority,
    board_id,
    stage_id,
    contact_id,
    tags,
    company_id,
    owner_id
  ) VALUES (
    gen_random_uuid(),
    'TechStartup Inc - Growth Plan',
    15000,
    75,
    'Proposal',
    'medium',
    sales_board_id,
    stage_proposal_id,
    contact_michael_id,
    ARRAY['growth', 'startup', 'recurring'],
    demo_company_id,
    demo_user_id
  );
  
  -- Deal 3: Global Corp - Negotiation Stage
  INSERT INTO deals (
    id,
    title,
    value,
    probability,
    status,
    priority,
    board_id,
    stage_id,
    contact_id,
    tags,
    company_id,
    owner_id
  ) VALUES (
    gen_random_uuid(),
    'Global Corp - Custom Integration',
    35000,
    85,
    'Negotiation',
    'high',
    sales_board_id,
    stage_negotiation_id,
    contact_sarah_id,
    ARRAY['enterprise', 'custom', 'integration'],
    demo_company_id,
    demo_user_id
  );
  
  RAISE NOTICE 'Created 3 demo deals';
  
  -- ============================================================================
  -- 6. VERIFICATION
  -- ============================================================================
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA CREATED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'User: provadagua@hub.com';
  RAISE NOTICE 'Board: Sales Pipeline (%)' , sales_board_id;
  RAISE NOTICE 'Stages: 5 (Lead In → Discovery → Proposal → Negotiation → Closed Won)';
  RAISE NOTICE 'Contacts: 3 (Amanda Chen, Michael Rodriguez, Sarah Johnson)';
  RAISE NOTICE 'Deals: 3 ($25K, $15K, $35K = $75K total pipeline)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Login as provadagua to see the demo data!';
  
END $$;
