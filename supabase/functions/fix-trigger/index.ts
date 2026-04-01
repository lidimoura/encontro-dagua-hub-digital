// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  const body = await req.json().catch(() => ({}));
  if (body.secret !== 'fix-trigger-2026') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  const dbUrl = Deno.env.get('SUPABASE_DB_URL');
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: 'SUPABASE_DB_URL not available' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  // mode: '037' runs only the preferences migration
  // 'full' (default) runs both 036b + 037
  const mode = body.mode ?? 'full';
  const results: Record<string, any> = {};

  try {
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    const client = new Client(dbUrl);
    await client.connect();

    // ── MIGRATION 037: profiles preferences columns ─────────────────────────
    await client.queryArray(`
      ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS preferred_language TEXT
          DEFAULT 'en'
          CHECK (preferred_language IN ('pt', 'en', 'es'))
    `);
    results.m037_language_col = 'ok';

    await client.queryArray(`
      ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS preferred_currency TEXT
          DEFAULT 'AUD'
          CHECK (preferred_currency IN ('BRL', 'AUD', 'USD'))
    `);
    results.m037_currency_col = 'ok';

    await client.queryArray(`
      CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language
        ON public.profiles (preferred_language)
    `);
    results.m037_index = 'ok';

    // Backfill: set defaults for everyone who has no preference yet
    await client.queryArray(`
      UPDATE public.profiles
        SET preferred_language = COALESCE(preferred_language, 'en'),
            preferred_currency = COALESCE(preferred_currency, 'AUD')
      WHERE preferred_language IS NULL
         OR preferred_currency IS NULL
    `);
    results.m037_backfill = 'ok';


    // Short-circuit if only running 037
    if (mode === '037') {
      await client.end();
      return new Response(JSON.stringify({
        success: true,
        migration: '037_profiles_preferences',
        results,
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // ── MIGRATION 036b: role constraint + bulletproof trigger ───────────────
    const constraintResult = await client.queryArray(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public.profiles'::regclass
        AND contype = 'c'
      ORDER BY conname
    `);
    results.constraints = constraintResult.rows;

    await client.queryArray(`
      ALTER TABLE public.profiles
        DROP CONSTRAINT IF EXISTS profiles_role_check
    `);
    results.drop_constraint = 'ok';

    await client.queryArray(`
      ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('admin', 'vendedor', 'equipe', 'cliente', 'user', 'guest', 'viewer'))
    `);
    results.add_constraint = 'ok';

    await client.queryArray(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $func$
      DECLARE
        v_name               TEXT;
        v_role               TEXT;
        v_company_id         UUID;
      BEGIN
        v_name := COALESCE(
          NULLIF(TRIM(NEW.raw_user_meta_data->>'name'),      ''),
          NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
          SPLIT_PART(NEW.email, '@', 1)
        );

        v_role := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''), 'admin');

        IF v_role NOT IN ('admin', 'vendedor', 'equipe', 'cliente', 'user', 'guest', 'viewer') THEN
          v_role := 'admin';
        END IF;

        BEGIN
          v_company_id := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_id'), '')::UUID;
        EXCEPTION WHEN OTHERS THEN
          v_company_id := NULL;
        END;

        INSERT INTO public.profiles (id, email, name, avatar, role, company_id)
        VALUES (
          NEW.id, NEW.email, v_name,
          NEW.raw_user_meta_data->>'avatar_url',
          v_role, v_company_id
        )
        ON CONFLICT (id) DO UPDATE SET
          email      = EXCLUDED.email,
          name       = COALESCE(EXCLUDED.name,      public.profiles.name),
          avatar     = COALESCE(EXCLUDED.avatar,    public.profiles.avatar),
          role       = COALESCE(EXCLUDED.role,      public.profiles.role),
          company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id);

        RETURN NEW;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '[handle_new_user v036b] Non-fatal: % (%) for user %', SQLERRM, SQLSTATE, NEW.id;
        RETURN NEW;
      END;
      $func$
    `);
    results.trigger_updated = 'ok';

    const triggerExists = await client.queryArray(`
      SELECT tgname FROM pg_trigger
      WHERE tgrelid = 'auth.users'::regclass
        AND tgname = 'on_auth_user_created'
    `);
    results.trigger_exists = triggerExists.rows.length > 0;

    if (!results.trigger_exists) {
      await client.queryArray(`
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_new_user()
      `);
      results.trigger_recreated = 'ok';
    }

    await client.end();

    return new Response(JSON.stringify({
      success:   true,
      migration: '036b_and_037_complete',
      results,
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('[fix-trigger] Error:', e.message);
    return new Response(JSON.stringify({
      success: false,
      error:   e.message,
      results,
    }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
