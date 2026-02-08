-- Create products table for catalog management
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company products"
  ON products FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add demo isolation flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Add demo data flag to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_demo_data BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.is_demo IS 'Flag to isolate demo users from real production data';
COMMENT ON COLUMN deals.is_demo_data IS 'Flag to mark deals created in demo mode';
