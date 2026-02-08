-- Enhance tech_stack table with detailed fields for AI-ready pricing
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS features_inclusas JSONB DEFAULT '[]';
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS beneficios_plano TEXT;
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS limites TEXT;
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS pricing_page_url TEXT;
ALTER TABLE tech_stack ADD COLUMN IF NOT EXISTS last_ai_check_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN tech_stack.features_inclusas IS 'Array of features included in this tool/service (e.g., ["API Access", "3 Users", "10GB Storage"])';
COMMENT ON COLUMN tech_stack.beneficios_plano IS 'Plan benefits description for sales proposals';
COMMENT ON COLUMN tech_stack.limites IS 'Usage limits (e.g., "Até 3 users", "API Ilimitada", "100 requests/day")';
COMMENT ON COLUMN tech_stack.pricing_page_url IS 'URL for AI to check current pricing automatically';
COMMENT ON COLUMN tech_stack.last_ai_check_at IS 'Last time AI verified pricing from the URL';
