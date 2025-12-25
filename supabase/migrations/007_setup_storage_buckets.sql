-- Migration: 007_setup_storage_buckets.sql
-- Create storage buckets for image uploads

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create qr-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-images', 'qr-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access policy
CREATE POLICY IF NOT EXISTS "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Public read access for qr-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-images');

-- Authenticated users can upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can upload qr-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'qr-images' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY IF NOT EXISTS "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = owner);

CREATE POLICY IF NOT EXISTS "Users can update own qr-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'qr-images' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'qr-images' AND auth.uid()::text = owner);

-- Users can delete their own uploads
CREATE POLICY IF NOT EXISTS "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = owner);

CREATE POLICY IF NOT EXISTS "Users can delete own qr-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'qr-images' AND auth.uid()::text = owner);
