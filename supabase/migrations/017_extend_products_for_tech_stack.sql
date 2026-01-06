-- =============================================================================
-- Migration: 017_extend_products_for_tech_stack.sql
-- Purpose: Extend products table to support Tech Stack management
-- Date: 2026-01-05
-- =============================================================================

-- 1. ADD NEW COLUMNS
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'service' 
  CHECK (product_type IN ('service', 'product', 'tech_stack', 'subscription')),
ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stack_category TEXT 
  CHECK (stack_category IS NULL OR stack_category IN ('hosting', 'database', 'automation', 'ai', 'analytics', 'other')),
ADD COLUMN IF NOT EXISTS pricing_model TEXT
  CHECK (pricing_model IS NULL OR pricing_model IN ('fixed', 'per_user', 'per_request', 'tiered', 'free')),
ADD COLUMN IF NOT EXISTS pricing_tiers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS auto_update_pricing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. CREATE INDEXES
CREATE INDEX IF NOT EXISTS products_product_type_idx ON public.products(product_type);
CREATE INDEX IF NOT EXISTS products_is_internal_idx ON public.products(is_internal);
CREATE INDEX IF NOT EXISTS products_stack_category_idx ON public.products(stack_category);
CREATE INDEX IF NOT EXISTS products_auto_update_idx ON public.products(auto_update_pricing) WHERE auto_update_pricing = true;

-- 3. ADD COMMENTS
COMMENT ON COLUMN public.products.product_type IS 'Type: service (sold to clients), product, tech_stack (internal tool/cost), subscription';
COMMENT ON COLUMN public.products.is_internal IS 'If true, this is an internal tool/cost, not sold to clients directly';
COMMENT ON COLUMN public.products.stack_category IS 'Category for tech stack items: hosting, database, automation, ai, analytics, other';
COMMENT ON COLUMN public.products.pricing_model IS 'Pricing model: fixed, per_user, per_request, tiered, free';
COMMENT ON COLUMN public.products.pricing_tiers IS 'JSON array with tiered pricing: [{"min": 0, "max": 100, "price": 10}, ...]';
COMMENT ON COLUMN public.products.external_url IS 'Link to external documentation or pricing page';
COMMENT ON COLUMN public.products.auto_update_pricing IS 'If true, Gemini API will automatically update pricing from external source';
COMMENT ON COLUMN public.products.last_price_update IS 'Timestamp of last automatic price update';
COMMENT ON COLUMN public.products.metadata IS 'Additional metadata (API limits, features, etc.) stored as JSON';

-- 4. INSERT INITIAL TECH STACK DATA
INSERT INTO public.products (name, description, price, product_type, is_internal, stack_category, external_url, auto_update_pricing, pricing_model, metadata)
VALUES
-- Hosting
('Vercel Pro', 'Plataforma de deploy e hosting para aplicações web', 20.00, 'tech_stack', true, 'hosting', 'https://vercel.com/pricing', true, 'fixed', '{"limits": {"bandwidth": "1TB", "builds": "6000/month", "team_members": "unlimited"}}'),
('Netlify Pro', 'Hosting e CI/CD para sites estáticos e JAMstack', 19.00, 'tech_stack', true, 'hosting', 'https://www.netlify.com/pricing', true, 'fixed', '{"limits": {"bandwidth": "1TB", "builds": "300min/month"}}'),

-- Database & Backend
('Supabase Pro', 'Backend as a Service (Database + Auth + Storage + Edge Functions)', 25.00, 'tech_stack', true, 'database', 'https://supabase.com/pricing', true, 'fixed', '{"limits": {"database_size": "8GB", "bandwidth": "250GB", "storage": "100GB"}}'),
('Firebase Blaze', 'Backend as a Service do Google (pay-as-you-go)', 0.00, 'tech_stack', true, 'database', 'https://firebase.google.com/pricing', true, 'per_request', '{"pricing_model": "pay_as_you_go", "free_tier": true}'),
('PlanetScale Scaler', 'Database MySQL serverless', 29.00, 'tech_stack', true, 'database', 'https://planetscale.com/pricing', true, 'fixed', '{"limits": {"storage": "10GB", "reads": "10B/month", "writes": "50M/month"}}'),

-- Automation
('n8n Cloud Starter', 'Automação de workflows e integrações', 20.00, 'tech_stack', true, 'automation', 'https://n8n.io/pricing', true, 'fixed', '{"limits": {"executions": "2500/month", "workflows": "unlimited"}}'),
('Make Core', 'Automação visual (ex-Integromat)', 9.00, 'tech_stack', true, 'automation', 'https://www.make.com/en/pricing', true, 'fixed', '{"limits": {"operations": "10000/month", "scenarios": "unlimited"}}'),
('Zapier Professional', 'Automação de apps e integrações', 49.00, 'tech_stack', true, 'automation', 'https://zapier.com/pricing', true, 'fixed', '{"limits": {"tasks": "50000/month", "zaps": "unlimited"}}'),

-- AI
('OpenAI API (GPT-4)', 'API de IA Generativa (GPT-4)', 0.03, 'tech_stack', true, 'ai', 'https://openai.com/pricing', true, 'per_request', '{"pricing_model": "per_token", "unit": "1K tokens", "input_price": 0.03, "output_price": 0.06}'),
('OpenAI API (GPT-4o-mini)', 'API de IA Generativa (GPT-4o-mini)', 0.00015, 'tech_stack', true, 'ai', 'https://openai.com/pricing', true, 'per_request', '{"pricing_model": "per_token", "unit": "1K tokens"}'),
('Google Gemini 2.0 Flash', 'API de IA Generativa (Google)', 0.00, 'tech_stack', true, 'ai', 'https://ai.google.dev/pricing', true, 'free', '{"pricing_model": "free_tier", "limits": "1500 RPD", "paid_tier_available": true}'),
('Anthropic Claude 3.5 Sonnet', 'API de IA Generativa (Anthropic)', 0.003, 'tech_stack', true, 'ai', 'https://www.anthropic.com/pricing', true, 'per_request', '{"pricing_model": "per_token", "unit": "1K tokens", "input_price": 0.003, "output_price": 0.015}'),

-- Analytics
('Google Analytics 4', 'Analytics gratuito do Google', 0.00, 'tech_stack', true, 'analytics', 'https://analytics.google.com', false, 'free', '{"tier": "free", "limits": "unlimited"}'),
('Plausible Analytics', 'Analytics privado e leve', 9.00, 'tech_stack', true, 'analytics', 'https://plausible.io/pricing', true, 'fixed', '{"limits": {"pageviews": "10K/month"}}'),
('PostHog Cloud', 'Product analytics e feature flags', 0.00, 'tech_stack', true, 'analytics', 'https://posthog.com/pricing', true, 'per_request', '{"pricing_model": "pay_as_you_go", "free_tier": "1M events/month"}'),

-- Other
('Resend', 'API de envio de e-mails transacionais', 0.00, 'tech_stack', true, 'other', 'https://resend.com/pricing', true, 'per_request', '{"free_tier": "3000 emails/month", "paid": "$0.0001/email"}'),
('Stripe', 'Processamento de pagamentos', 0.00, 'tech_stack', true, 'other', 'https://stripe.com/pricing', false, 'per_request', '{"fee": "2.9% + $0.30 per transaction"}')

ON CONFLICT DO NOTHING;

-- 5. UPDATE EXISTING PRODUCTS (if any)
-- Set existing products as 'service' type if not already set
UPDATE public.products
SET product_type = 'service'
WHERE product_type IS NULL;

-- =============================================================================
-- ✅ MIGRATION COMPLETE!
-- =============================================================================
-- 
-- ADDED:
-- • 9 new columns to products table
-- • 4 new indexes
-- • 15 initial tech stack products
--
-- NEXT STEPS:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify: SELECT * FROM products WHERE product_type = 'tech_stack';
-- 3. Update Admin UI to filter by product_type
-- 4. Implement Precy integration to use tech_stack products
-- =============================================================================
