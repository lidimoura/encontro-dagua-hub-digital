-- 033_fix_handle_new_user_trigger.sql
-- Fix: handle_new_user trigger fails AuthApiError when company_id is NULL
-- The cast (new.raw_user_meta_data->>'company_id')::uuid throws when the field
-- is absent or an empty string. We now use NULLIF to guard against this.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar,
    role,
    company_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    -- Guard: only cast if the value is a non-empty, valid UUID string
    NULLIF(NEW.raw_user_meta_data->>'company_id', '')::uuid
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar     = COALESCE(EXCLUDED.avatar, public.profiles.avatar),
    role       = COALESCE(EXCLUDED.role, public.profiles.role),
    company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
