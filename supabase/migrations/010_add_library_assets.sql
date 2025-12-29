-- =============================================================================
-- PHASE 1: Knowledge Management System (Library Assets)
-- =============================================================================
-- Migration: 010_add_library_assets.sql
-- Purpose: Create CMS for managing digital assets (Prompts, Contracts, Logic, SaaS)
-- =============================================================================

-- 1. CREATE LIBRARY_ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.library_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Asset Metadata
    title TEXT NOT NULL,
    description TEXT,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('prompt', 'contract', 'business_logic', 'saas_template', 'other')),
    category TEXT, -- e.g., 'Sales', 'Legal', 'Finance', 'Technical'
    
    -- Content
    content TEXT NOT NULL, -- Main content (prompt text, contract template, logic rules)
    variables JSONB DEFAULT '{}', -- Placeholder variables for templates (e.g., {client_name}, {price})
    metadata JSONB DEFAULT '{}', -- Additional metadata (author, version, etc.)
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Organization
    tags TEXT[] DEFAULT '{}',
    is_template BOOLEAN DEFAULT false, -- If true, can be used as template
    is_public BOOLEAN DEFAULT false, -- If true, visible to all users in company
    
    -- Relationships
    created_by UUID REFERENCES public.profiles(id),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX library_assets_company_id_idx ON public.library_assets(company_id);
CREATE INDEX library_assets_asset_type_idx ON public.library_assets(asset_type);
CREATE INDEX library_assets_created_by_idx ON public.library_assets(created_by);
CREATE INDEX library_assets_tags_idx ON public.library_assets USING GIN(tags);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.library_assets ENABLE ROW LEVEL SECURITY;

-- Users can view assets from their company
CREATE POLICY "tenant_isolation_select" ON public.library_assets
FOR SELECT TO authenticated
USING (
    company_id = (auth.jwt()->>'company_id')::uuid
    OR is_public = true
);

-- Users can create assets in their company
CREATE POLICY "tenant_isolation_insert" ON public.library_assets
FOR INSERT TO authenticated
WITH CHECK (company_id = (auth.jwt()->>'company_id')::uuid);

-- Users can update their own assets or if admin
CREATE POLICY "tenant_isolation_update" ON public.library_assets
FOR UPDATE TO authenticated
USING (
    company_id = (auth.jwt()->>'company_id')::uuid
    AND (created_by = auth.uid() OR (auth.jwt()->>'user_role') = 'admin')
)
WITH CHECK (company_id = (auth.jwt()->>'company_id')::uuid);

-- Users can delete their own assets or if admin
CREATE POLICY "tenant_isolation_delete" ON public.library_assets
FOR DELETE TO authenticated
USING (
    company_id = (auth.jwt()->>'company_id')::uuid
    AND (created_by = auth.uid() OR (auth.jwt()->>'user_role') = 'admin')
);

-- 4. AUTO-SET COMPANY_ID TRIGGER
CREATE TRIGGER auto_company_id BEFORE INSERT ON public.library_assets
FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();

-- 5. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_library_assets_updated_at
BEFORE UPDATE ON public.library_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. HELPER FUNCTION: Increment Usage Count
CREATE OR REPLACE FUNCTION public.increment_asset_usage(asset_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.library_assets
    SET 
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. SAMPLE DATA (Optional - for testing)
INSERT INTO public.library_assets (title, description, asset_type, category, content, variables, is_template, is_public, tags)
VALUES 
(
    'Prompt: Gerador de PRD',
    'Template para gerar Product Requirements Document usando IA',
    'prompt',
    'Technical',
    'Você é um Product Manager experiente. Crie um PRD completo para: {product_name}. Inclua: Objetivo, Funcionalidades, Requisitos Técnicos, Critérios de Sucesso.',
    '{"product_name": "Nome do Produto"}',
    true,
    true,
    ARRAY['prd', 'product', 'template']
),
(
    'Contrato: Prestação de Serviços PF',
    'Template de contrato para pessoa física',
    'contract',
    'Legal',
    'CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nCONTRATANTE: {client_name}\nCPF: {client_cpf}\n\nCONTRATADO: {company_name}\nCNPJ: {company_cnpj}\n\nOBJETO: {service_description}\nVALOR: R$ {price}\nPRAZO: {deadline}',
    '{"client_name": "", "client_cpf": "", "company_name": "", "company_cnpj": "", "service_description": "", "price": "", "deadline": ""}',
    true,
    true,
    ARRAY['contrato', 'pf', 'servicos']
),
(
    'Lógica: Metodologia 10K',
    'Fórmula de precificação baseada na metodologia 10K',
    'business_logic',
    'Finance',
    'Preço Justo = (Custo Stack + Horas × Valor Hora + Margem Desejada) / Impacto Percebido\n\nOnde:\n- Custo Stack: Soma das ferramentas usadas\n- Horas: Tempo estimado de trabalho\n- Valor Hora: R$ 100-300 (dependendo da complexidade)\n- Margem: 30-50%\n- Impacto: 1-10 (quanto maior, mais valor)',
    '{"custo_stack": 0, "horas": 0, "valor_hora": 150, "margem_percentual": 40, "impacto": 5}',
    true,
    true,
    ARRAY['10k', 'precificacao', 'financeiro']
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.library_assets IS 'CMS for managing digital assets: prompts, contracts, business logic, and SaaS templates';
COMMENT ON COLUMN public.library_assets.asset_type IS 'Type: prompt, contract, business_logic, saas_template, other';
COMMENT ON COLUMN public.library_assets.variables IS 'JSON object with placeholder variables for templates';
COMMENT ON COLUMN public.library_assets.usage_count IS 'Number of times this asset has been used';
COMMENT ON COLUMN public.library_assets.is_template IS 'If true, can be used as a template with variable substitution';
