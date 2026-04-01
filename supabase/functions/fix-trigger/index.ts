// @ts-nocheck
// fix-trigger — DDL executor for Supabase migrations
// Secret: fix-trigger-2026
// Modes: '034' | '037' | '038' | 'full'
// All keys come from Supabase Edge Function secrets (never hardcoded).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const body = await req.json().catch(() => ({}));
  if (body.secret !== 'fix-trigger-2026') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  const dbUrl = Deno.env.get('SUPABASE_DB_URL');
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: 'SUPABASE_DB_URL not set' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  const mode = body.mode ?? 'full';
  const results: Record<string, any> = {};

  try {
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    const client = new Client(dbUrl);
    await client.connect();
    console.log(`[fix-trigger] connected | mode=${mode}`);

    // ────────────────────────────────────────────────────────────────────────
    // MIGRATION 034 — is_demo_data column on all sandbox tables
    // ────────────────────────────────────────────────────────────────────────
    if (mode === '034' || mode === 'full') {
      for (const tbl of ['activities','products','qr_codes','saved_prompts','contacts','deals','profiles']) {
        await client.queryArray(`ALTER TABLE public.${tbl} ADD COLUMN IF NOT EXISTS is_demo_data boolean NOT NULL DEFAULT false`);
        results[`m034_${tbl}`] = 'ok';
      }
      await client.queryArray(`
        UPDATE public.contacts SET is_demo_data = true
        WHERE email ILIKE '%test%' OR email ILIKE '%teste%' OR email ILIKE '%@sdr.%'
           OR name  ILIKE '%Gamer%' OR name ILIKE '%Lilas%' OR name ILIKE '%Amanda%'
      `);
      results.m034_backfill = 'ok';
      if (mode === '034') {
        await client.end();
        return new Response(JSON.stringify({ success: true, migration: '034_is_demo_data', results }),
          { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
    }

    // ────────────────────────────────────────────────────────────────────────
    // MIGRATION 037 — preferred_language + preferred_currency on profiles
    // ────────────────────────────────────────────────────────────────────────
    if (mode === '037' || mode === 'full') {
      await client.queryArray(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('pt','en','es'))`);
      results.m037_lang = 'ok';

      await client.queryArray(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'AUD' CHECK (preferred_currency IN ('BRL','AUD','USD'))`);
      results.m037_curr = 'ok';

      await client.queryArray(`CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON public.profiles (preferred_language)`);
      results.m037_idx = 'ok';

      await client.queryArray(`UPDATE public.profiles SET preferred_language=COALESCE(preferred_language,'en'), preferred_currency=COALESCE(preferred_currency,'AUD') WHERE preferred_language IS NULL OR preferred_currency IS NULL`);
      results.m037_backfill = 'ok';

      if (mode === '037') {
        await client.end();
        return new Response(JSON.stringify({ success: true, migration: '037_profiles_prefs', results }),
          { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
    }

    // ────────────────────────────────────────────────────────────────────────
    // MIGRATION 038 — per-lead isolation: global_template + RLS update
    // ────────────────────────────────────────────────────────────────────────
    if (mode === '038' || mode === 'full') {
      await client.queryArray(`ALTER TABLE public.boards   ADD COLUMN IF NOT EXISTS global_template boolean NOT NULL DEFAULT false`);
      await client.queryArray(`ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS global_template boolean NOT NULL DEFAULT false`);
      results.m038_cols = 'ok';

      // Update boards RLS: own company OR global template
      await client.queryArray(`DROP POLICY IF EXISTS "boards_select_company_or_template" ON public.boards`);
      await client.queryArray(`DROP POLICY IF EXISTS "Users can view their company boards" ON public.boards`);
      await client.queryArray(`
        CREATE POLICY "boards_select_company_or_template" ON public.boards
          FOR SELECT USING (
            company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
            OR global_template = true
          )
      `);
      results.m038_boards_rls = 'ok';

      // Update contacts RLS: own company OR global template
      await client.queryArray(`DROP POLICY IF EXISTS "contacts_select_company_or_template" ON public.contacts`);
      await client.queryArray(`DROP POLICY IF EXISTS "Users can view their company contacts" ON public.contacts`);
      await client.queryArray(`
        CREATE POLICY "contacts_select_company_or_template" ON public.contacts
          FOR SELECT USING (
            company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
            OR global_template = true
          )
      `);
      results.m038_contacts_rls = 'ok';

      if (mode === '038') {
        await client.end();
        return new Response(JSON.stringify({ success: true, migration: '038_demo_isolation', results }),
          { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
    }

    // ────────────────────────────────────────────────────────────────────────
    // MIGRATION 036b — bulletproof handle_new_user trigger
    // ────────────────────────────────────────────────────────────────────────
    await client.queryArray(`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check`);
    await client.queryArray(`ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin','vendedor','equipe','cliente','user','guest','viewer'))`);
    results.m036b_constraint = 'ok';

    await client.queryArray(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $func$
      DECLARE v_name TEXT; v_role TEXT; v_company_id UUID;
      BEGIN
        v_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'),''),NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'),''),SPLIT_PART(NEW.email,'@',1));
        v_role := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'role'),''),'admin');
        IF v_role NOT IN ('admin','vendedor','equipe','cliente','user','guest','viewer') THEN v_role := 'admin'; END IF;
        BEGIN v_company_id := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_id'),'')::UUID;
        EXCEPTION WHEN OTHERS THEN v_company_id := NULL; END;
        INSERT INTO public.profiles (id,email,name,avatar,role,company_id)
        VALUES (NEW.id,NEW.email,v_name,NEW.raw_user_meta_data->>'avatar_url',v_role,v_company_id)
        ON CONFLICT (id) DO UPDATE SET
          email=EXCLUDED.email,name=COALESCE(EXCLUDED.name,public.profiles.name),
          avatar=COALESCE(EXCLUDED.avatar,public.profiles.avatar),
          role=COALESCE(EXCLUDED.role,public.profiles.role),
          company_id=COALESCE(EXCLUDED.company_id,public.profiles.company_id);
        RETURN NEW;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '[handle_new_user v036b] %: %', SQLERRM, NEW.id; RETURN NEW;
      END; $func$
    `);
    results.m036b_trigger_fn = 'ok';

    const trigRes = await client.queryArray(`SELECT tgname FROM pg_trigger WHERE tgrelid='auth.users'::regclass AND tgname='on_auth_user_created'`);
    if (trigRes.rows.length === 0) {
      await client.queryArray(`CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`);
      results.m036b_trigger_created = 'ok';
    } else {
      results.m036b_trigger_exists = 'ok';
    }

    await client.end();
    return new Response(JSON.stringify({ success: true, migration: 'full_034_036b_037_038', results }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('[fix-trigger] Error:', e.message);
    return new Response(JSON.stringify({ success: false, error: e.message, results }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
