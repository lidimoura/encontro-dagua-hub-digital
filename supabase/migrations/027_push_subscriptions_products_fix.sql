-- ════════════════════════════════════════════════════════════════════════════
-- Migration 027: Push Subscriptions table for PWA Web Push / VAPID
-- Date: 2026-03-11
-- Purpose: Store browser push subscriptions for sending notifications
--          to the CEO's mobile device via the send-push-notification Edge Function
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Create push_subscriptions table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)   -- One subscription per user; upsert on conflict
);

-- ─── 2. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own subscription
CREATE POLICY "users_manage_own_subscription"
  ON public.push_subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 3. Also update products: set type for items that are likely tech_stack ──
-- This fixes the "Tech Stack" filter bug: items added before migration 024
-- would have type = NULL and pass through the frontend filter.
-- We set type='tech_stack' for anything that matches known tech names.

UPDATE public.products
SET type = 'tech_stack'
WHERE type IS NULL AND (
  LOWER(name) SIMILAR TO '%(openai|anthropic|claude|gemini|gpt|vercel|supabase|firebase|n8n|zapier|make\.com|deno|stripe|twilio|sendgrid|cloudflare|aws|azure|gcp|godaddy|digitalocean|render|railway|netlify)%'
);

-- Also update category for items labeled 'tech', 'infra', 'api'
UPDATE public.products
SET type = 'tech_stack'
WHERE type IS NULL AND LOWER(category) IN ('tech', 'infra', 'api', 'technology', 'infrastructure', 'tech_stack');

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT type, COUNT(*) FROM public.products GROUP BY type ORDER BY type;

NOTIFY pgrst, 'reload schema';
SELECT 'Migration 027 complete: push_subscriptions + products tech_stack fix' AS result;
