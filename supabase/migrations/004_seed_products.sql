-- Seed Data: Initial Products
-- Description: Inserts initial product catalog for testing
-- Date: 2025-12-18
-- IMPORTANT: Run this AFTER logging in as a user with company_id

-- Function to insert seed products (SECURITY DEFINER to bypass RLS during seed)
CREATE OR REPLACE FUNCTION public.seed_initial_products()
RETURNS void AS $$
DECLARE
  user_company_id UUID;
BEGIN
  -- Get the company_id from the current authenticated user
  user_company_id := (auth.jwt()->>'company_id')::uuid;
  
  -- Only insert if company_id exists and no products exist yet
  IF user_company_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = user_company_id) THEN
    INSERT INTO public.products (company_id, name, description, price, unit, category, is_active)
    VALUES
      (
        user_company_id,
        'Cartão Digital Interativo',
        'Cartão de visita digital com QR Code personalizável, incluindo links para redes sociais e WhatsApp',
        150.00,
        'un',
        'product',
        true
      ),
      (
        user_company_id,
        'Landing Page One-Page',
        'Página de captura profissional responsiva, otimizada para conversão com formulário integrado',
        500.00,
        'un',
        'service',
        true
      ),
      (
        user_company_id,
        'Consultoria de IA',
        'Consultoria especializada em implementação de Inteligência Artificial para automação de processos',
        250.00,
        'h',
        'service',
        true
      );
    
    RAISE NOTICE 'Produtos iniciais inseridos com sucesso para company_id: %', user_company_id;
  ELSE
    RAISE NOTICE 'Produtos já existem ou company_id não encontrado';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.seed_initial_products() TO authenticated;

-- Comment
COMMENT ON FUNCTION public.seed_initial_products() IS 'Insere produtos iniciais para teste. Executar após login: SELECT seed_initial_products();';
