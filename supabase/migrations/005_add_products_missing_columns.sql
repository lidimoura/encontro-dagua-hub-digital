-- Migration: Ensure products table has all required columns
-- This is idempotent and safe to run multiple times

-- Add missing columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'un';
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'service';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure timestamps exist (should already be there from original migration)
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add comment for documentation
COMMENT ON COLUMN products.unit IS 'Unit of measure: un, h, mês, etc';
COMMENT ON COLUMN products.category IS 'Category: service, product, subscription';
COMMENT ON COLUMN products.is_active IS 'Whether the product is active and visible';
