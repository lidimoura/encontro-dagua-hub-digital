-- =============================================================================
-- Waitlist & Prompt Feedback Tables
-- =============================================================================
-- Migration: 008_add_waitlist_and_feedback.sql
-- Description: Creates tables for Invite-Only waitlist and Prompt Lab feedback
-- Execute in: Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. WAITLIST TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact Info
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    referred_by TEXT, -- "Quem te indicou?"
    
    -- Metadata
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS waitlist_status_idx ON public.waitlist(status);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON public.waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS waitlist_whatsapp_idx ON public.waitlist(whatsapp);

-- RLS Policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can join waitlist)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Only admins can view/update waitlist
CREATE POLICY "Admins can view waitlist" ON public.waitlist
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can update waitlist" ON public.waitlist
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- -----------------------------------------------------------------------------
-- 2. PROMPT FEEDBACK TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prompt_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Prompt Data
    raw_idea TEXT NOT NULL,
    optimized_prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL, -- Response from testing the prompt
    persona TEXT NOT NULL,
    
    -- Feedback
    is_useful BOOLEAN, -- true = 👍, false = 👎, null = not rated yet
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS prompt_feedback_user_id_idx ON public.prompt_feedback(user_id);
CREATE INDEX IF NOT EXISTS prompt_feedback_is_useful_idx ON public.prompt_feedback(is_useful) WHERE is_useful IS NOT NULL;
CREATE INDEX IF NOT EXISTS prompt_feedback_created_at_idx ON public.prompt_feedback(created_at DESC);

-- RLS Policies
ALTER TABLE public.prompt_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" ON public.prompt_feedback
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON public.prompt_feedback
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own feedback (to change rating)
CREATE POLICY "Users can update their own feedback" ON public.prompt_feedback
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Admins can view all feedback for analytics
CREATE POLICY "Admins can view all feedback" ON public.prompt_feedback
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- -----------------------------------------------------------------------------
-- 3. TRIGGERS
-- -----------------------------------------------------------------------------

-- Auto-update timestamp for waitlist
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_waitlist_timestamp
BEFORE UPDATE ON public.waitlist
FOR EACH ROW
EXECUTE FUNCTION update_waitlist_updated_at();

-- =============================================================================
-- ✅ MIGRATION COMPLETE!
-- =============================================================================
-- 
-- CREATED:
-- • Table: waitlist (name, whatsapp, referred_by, status)
-- • Table: prompt_feedback (raw_idea, optimized_prompt, ai_response, is_useful)
-- • Indexes: 6 total (3 per table)
-- • RLS Policies: 7 total
-- • Triggers: 1 (auto updated_at for waitlist)
--
-- NEXT STEPS:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables: SELECT * FROM waitlist LIMIT 1;
-- 3. Update LandingPage.tsx to add waitlist form
-- 4. Update PromptLabPage.tsx to add test/feedback functionality
-- =============================================================================
