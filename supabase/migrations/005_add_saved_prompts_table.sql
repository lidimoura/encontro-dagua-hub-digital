-- =============================================================================
-- Prompt Lab Module - Add Saved Prompts Table
-- =============================================================================
-- Migration: 005_add_saved_prompts_table.sql
-- Description: Creates table to save optimized prompts from Prompt Lab
-- Execute in: Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREATE TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Prompt Data
    title TEXT NOT NULL,
    raw_idea TEXT NOT NULL,
    optimized_prompt TEXT NOT NULL,
    persona TEXT NOT NULL,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. CREATE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS saved_prompts_user_id_idx ON public.saved_prompts(user_id);
CREATE INDEX IF NOT EXISTS saved_prompts_company_id_idx ON public.saved_prompts(company_id);
CREATE INDEX IF NOT EXISTS saved_prompts_persona_idx ON public.saved_prompts(persona);
CREATE INDEX IF NOT EXISTS saved_prompts_is_favorite_idx ON public.saved_prompts(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS saved_prompts_created_at_idx ON public.saved_prompts(created_at DESC);

-- -----------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. CREATE RLS POLICIES
-- -----------------------------------------------------------------------------

-- SELECT: Users can view their own prompts or company prompts
CREATE POLICY "Users can view their own prompts" ON public.saved_prompts
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR company_id = (auth.jwt()->>'company_id')::uuid);

-- INSERT: Users can insert their own prompts
CREATE POLICY "Users can insert their own prompts" ON public.saved_prompts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update their own prompts
CREATE POLICY "Users can update their own prompts" ON public.saved_prompts
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- DELETE: Users can delete their own prompts
CREATE POLICY "Users can delete their own prompts" ON public.saved_prompts
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5. CREATE TRIGGERS
-- -----------------------------------------------------------------------------

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_saved_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_prompts_timestamp
BEFORE UPDATE ON public.saved_prompts
FOR EACH ROW
EXECUTE FUNCTION update_saved_prompts_updated_at();

-- Auto-set company_id trigger (reuse existing function)
CREATE TRIGGER auto_company_id BEFORE INSERT ON public.saved_prompts
FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();

-- =============================================================================
-- ✅ MIGRATION COMPLETE!
-- =============================================================================
-- 
-- CREATED:
-- • Table: saved_prompts
-- • Indexes: 5 (user_id, company_id, persona, is_favorite, created_at)
-- • RLS Policies: 4 (select, insert, update, delete)
-- • Triggers: 2 (auto company_id, auto updated_at)
--
-- NEXT STEPS:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify table: SELECT * FROM saved_prompts LIMIT 1;
-- 3. Update PromptLabPage.tsx to add save functionality
-- =============================================================================
