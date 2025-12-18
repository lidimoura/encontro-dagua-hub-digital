-- Migration: Add Products/Services Table
-- Description: Creates table for product catalog management
-- Date: 2025-12-18
-- Status: APPLIED (executed manually on 2025-12-18 00:30)

-- Create products table (idempotent)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.profiles(company_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'un', -- 'un', 'h' (hora), 'mês', etc
  category TEXT, -- 'service', 'product', 'subscription'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_category ON public.products(category);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "tenant_isolation_select" ON public.products
  FOR SELECT TO authenticated
  USING (company_id = (auth.jwt()->>'company_id')::uuid);

CREATE POLICY "tenant_isolation_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (company_id = (auth.jwt()->>'company_id')::uuid);

CREATE POLICY "tenant_isolation_update" ON public.products
  FOR UPDATE TO authenticated
  USING (company_id = (auth.jwt()->>'company_id')::uuid)
  WITH CHECK (company_id = (auth.jwt()->>'company_id')::uuid);

CREATE POLICY "tenant_isolation_delete" ON public.products
  FOR DELETE TO authenticated
  USING (company_id = (auth.jwt()->>'company_id')::uuid);

-- Trigger for auto-setting company_id
CREATE OR REPLACE FUNCTION public.set_product_company_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := (auth.jwt()->>'company_id')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_product_company_id_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_company_id();

-- Trigger for updated_at
CREATE TRIGGER set_product_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SEED DATA (Produtos Iniciais)
-- ============================================
-- Nota: Estes produtos serão inseridos para a primeira empresa criada
-- Na próxima sprint, criar UI de "Gestão de Loja" para edição visual

-- Inserir produtos de exemplo (será associado à empresa do usuário logado)
-- Executar manualmente após login ou via função SECURITY DEFINER

COMMENT ON TABLE public.products IS 'Catálogo de produtos e serviços oferecidos pela empresa';
COMMENT ON COLUMN public.products.unit IS 'Unidade de medida: un (unidade), h (hora), mês, etc';
COMMENT ON COLUMN public.products.category IS 'Categoria: service (serviço), product (produto), subscription (assinatura)';
