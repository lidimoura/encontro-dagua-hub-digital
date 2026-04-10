import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * signup-showcase Edge Function — v2 (Multi-Lead Isolation)
 *
 * Each new lead gets their own unique company_id UUID.
 * This means the existing company_id-based RLS automatically
 * isolates every demo user — no cross-contamination possible.
 *
 * Medical leads, startup leads, social leads → all isolated.
 * Shared template boards (global_template = true) are visible to all.
 *
 * Flow:
 * 1. Generate a unique demo_company_id (UUID)
 * 2. Create auth user via admin API (email_confirm: true → bypasses err228)
 * 3. Upsert profile with: company_id = demo_company_id, is_demo_data = true
 * 4. Save lead in contacts (tagged with demo_company_id)
 * 5. Return { user_id, email } → frontend calls signInWithPassword
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { name, email, password, language } = await req.json();

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'name, email and password are required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    // ─── Admin client — keys come from Supabase Edge Function secrets ─────────
    // NEVER hardcode credentials here. All via Supabase dashboard → Secrets.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // ─── Step 1: Generate a unique company_id for this lead ───────────────────
    // This is the core of per-lead isolation:
    // Each demo user lives in their own "virtual company" by UUID.
    // Existing RLS (company_id = user's company_id) automatically isolates them.
    const demoCompanyId = crypto.randomUUID();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName  = name.trim();

    // ─── Step 2: Create auth user — email confirmed immediately ──────────────
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name:               normalizedName,
        full_name:          normalizedName,
        is_demo_data:       true,
        app_source:         'showcase_lp',
        role:               'vendedor',
        company_id:         demoCompanyId,   // ← trigger uses this if it runs
        preferred_language: language ?? 'en',
        preferred_currency: 'AUD',
      },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes('already')) {
        return new Response(JSON.stringify({
          error: 'email_already_registered',
          message: language === 'pt'
            ? 'Este e-mail já está cadastrado. Tente fazer login.'
            : 'This email is already registered. Please try logging in.',
        }), { status: 409, headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
      console.error('[signup-showcase] admin.createUser failed:', createError.message);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    const userId = authData.user.id;

    // ─── Trial expiry: +7 days from now ──────────────────────────────────────
    const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // ─── Step 3: Wait for trigger to settle, then upsert profile ─────────────
    await new Promise(resolve => setTimeout(resolve, 400));

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, company_id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      // Trigger didn't run — insert manually
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id:                  userId,
          email:               normalizedEmail,
          name:                normalizedName,
          role:                'vendedor',
          company_id:          demoCompanyId,   // ← isolated per-lead
          is_demo_data:        true,
          preferred_language:  language ?? 'pt',
          preferred_currency:  'BRL',
          access_expires_at:   trialExpiresAt,  // ← 7-day trial imediato
        });

      if (insertError) {
        // Try without optional columns in case migration 037/038 not yet applied
        console.warn('[signup-showcase] full insert failed, trying minimal:', insertError.message);
        await supabaseAdmin.from('profiles').insert({
          id:                userId,
          email:             normalizedEmail,
          name:              normalizedName,
          role:              'vendedor',
          company_id:        demoCompanyId,
          access_expires_at: trialExpiresAt,
        });
      } else {
        console.log('[signup-showcase] ✅ Profile inserted | trial expires:', trialExpiresAt);
      }
    } else {
      // Trigger ran — ensure company_id and trial expiry are set
      await supabaseAdmin.from('profiles').update({
        company_id:          existingProfile.company_id ?? demoCompanyId,
        is_demo_data:        true,
        preferred_language:  language ?? 'pt',
        preferred_currency:  'BRL',
        access_expires_at:   trialExpiresAt,  // ← sempre garante 7d trial
      }).eq('id', userId);
      console.log('[signup-showcase] ✅ Profile updated | trial expires:', trialExpiresAt);
    }

    // ─── Step 4: Save lead in contacts ───────────────────────────────────────
    const { error: contactError } = await supabaseAdmin
      .from('contacts')
      .insert({
        name:         normalizedName,
        email:        normalizedEmail,
        source:       'provadagua',
        stage:        'LEAD',
        status:       'ACTIVE',
        company_id:   demoCompanyId,    // ← contact belongs to this lead's space
        tags:         ['showcase', 'provadagua', 'provadagua-trial', 'trial-7d'],
        is_demo_data: true,
        briefing_json: {
          origem:           'provadagua/keyword-gate',
          idioma:           language ?? 'pt',
          timestamp:        new Date().toISOString(),
          user_id:          userId,
          demo_company_id:  demoCompanyId,
          trial_expires_at: trialExpiresAt,
          acesso_imediato:  true,
        },
      });

    if (contactError) {
      console.warn('[signup-showcase] contact insert warning:', contactError.message);
    }


    // ─── Return success ───────────────────────────────────────────────────────
    return new Response(JSON.stringify({
      success:  true,
      user_id:  userId,
      email:    normalizedEmail,
      message:  language === 'pt'
        ? 'Conta criada! Fazendo login...'
        : 'Account created! Logging in...',
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e: any) {
    console.error('[signup-showcase] unexpected error:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'Internal server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
