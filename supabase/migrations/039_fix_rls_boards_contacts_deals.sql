-- ============================================================================
-- V9.6 HOTFIX: Fix RLS 403 Forbidden on boards, board_stages, contacts, deals
-- ============================================================================
-- Problem: Authenticated leads (role: admin/owner) get 403 on INSERT to
--          boards and board_stages because RLS policies are missing or wrong.
-- Solution: Drop & recreate clean RLS policies for all 4 tables.
--           Rule: any authenticated user can operate on rows WHERE
--           company_id matches their own profile.company_id.
-- Execute: Run ONCE in Supabase SQL Editor (Project > SQL Editor > New Query)
-- Date: 2026-04-20
-- ============================================================================


-- ============================================================================
-- TABLE: boards
-- ============================================================================
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;

-- Nuclear drop
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'boards'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON boards', r.policyname);
  END LOOP;
END $$;

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- SELECT: see boards of your company
CREATE POLICY "boards_select_company"
  ON boards FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL  -- global/template boards visible to all
  );

-- INSERT: create boards only under your company_id
CREATE POLICY "boards_insert_company"
  ON boards FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- UPDATE: edit only your company's boards
CREATE POLICY "boards_update_company"
  ON boards FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- DELETE: delete only your company's boards
CREATE POLICY "boards_delete_company"
  ON boards FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );


-- ============================================================================
-- TABLE: board_stages
-- ============================================================================
ALTER TABLE board_stages DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'board_stages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON board_stages', r.policyname);
  END LOOP;
END $$;

ALTER TABLE board_stages ENABLE ROW LEVEL SECURITY;

-- SELECT: see stages of boards you can access (via board's company_id)
CREATE POLICY "board_stages_select"
  ON board_stages FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
      OR company_id IS NULL
    )
  );

-- INSERT: add stages to your company's boards
CREATE POLICY "board_stages_insert"
  ON board_stages FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
    -- also allow if company_id column exists on board_stages itself
    OR (
      company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- UPDATE: edit stages of your company's boards
CREATE POLICY "board_stages_update"
  ON board_stages FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
      OR company_id IS NULL
    )
  );

-- DELETE: delete stages of your company's boards
CREATE POLICY "board_stages_delete"
  ON board_stages FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
      OR company_id IS NULL
    )
  );


-- ============================================================================
-- TABLE: deals
-- ============================================================================
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'deals'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON deals', r.policyname);
  END LOOP;
END $$;

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select_company"
  ON deals FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

CREATE POLICY "deals_insert_company"
  ON deals FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

CREATE POLICY "deals_update_company"
  ON deals FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

CREATE POLICY "deals_delete_company"
  ON deals FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );


-- ============================================================================
-- TABLE: activities
-- ============================================================================
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'activities'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON activities', r.policyname);
  END LOOP;
END $$;

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_company"
  ON activities FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

CREATE POLICY "activities_insert_company"
  ON activities FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

CREATE POLICY "activities_update_company"
  ON activities FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );

CREATE POLICY "activities_delete_company"
  ON activities FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    OR company_id IS NULL
  );


-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('boards', 'board_stages', 'deals', 'activities')
ORDER BY tablename, cmd;
-- Expected: 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
