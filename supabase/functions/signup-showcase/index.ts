import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * signup-showcase Edge Function
 *
 * Creates a demo user for the ShowcaseLP portal, bypassing:
 * 1. Email confirmation (confirmed immediately via admin API)
 * 2. The broken handle_new_user() trigger (profile inserted manually)
 * 3. Error 228 (no invite token required)
 *
 * Flow:
 * 1. Receive { name, email, password, language } from ShowcaseLP
 * 2. Create auth user via admin.createUser (email_confirm: true)
 * 3. Manually INSERT into public.profiles with is_demo_data: true
 * 4. Save lead into public.contacts with is_demo_data: true
 * 5. Return { user_id, email } — frontend then calls signInWithPassword
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

    // ─── Admin client (Service Role — bypasses RLS and auth) ─────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // ─── Step 1: Create auth user with email confirmed immediately ────────────
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,  // ← Bypasses email confirmation requirement
      user_metadata: {
        name:               name.trim(),
        full_name:          name.trim(),
        is_demo_data:       true,
        app_source:         'showcase_lp',
        role:               'vendedor',
        preferred_currency: 'AUD',
      },
    });

    if (createError) {
      // Handle "already registered" gracefully
      if (createError.message?.includes('already registered') ||
          createError.message?.includes('already been registered') ||
          createError.message?.toLowerCase().includes('email already')) {
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

    // ─── Step 2: Wait for trigger to run, then upsert profile ────────────────
    // Give the handle_new_user trigger 300ms to run first.
    // Then upsert with ONLY the base schema columns (no extra cols needed).
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if trigger already created the profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      // Trigger didn't create it — insert manually (only safe base columns)
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id:    userId,
          email: email.trim().toLowerCase(),
          name:  name.trim(),
          role:  'vendedor',
          // company_id intentionally omitted (nullable FK — defaults to NULL)
        });

      if (insertError) {
        console.error('[signup-showcase] profile INSERT failed:', insertError.message, insertError.code);
        // Not returning error — user can still sign in, profile may load on retry
      } else {
        console.log('[signup-showcase] profile inserted manually for:', userId);
      }
    } else {
      console.log('[signup-showcase] profile already exists (trigger ran), updating role...');
      // Ensure role is set correctly
      await supabaseAdmin.from('profiles').update({ role: 'vendedor' }).eq('id', userId);
    }

    // ─── Step 4: Save lead in contacts ───────────────────────────────────────
    const { error: contactError } = await supabaseAdmin
      .from('contacts')
      .insert({
        name:         name.trim(),
        email:        email.trim().toLowerCase(),
        source:       'showcase_lp',
        stage:        'LEAD',
        status:       'ACTIVE',
        tags:         ['showcase', 'demo-lead', 'portal-cadastro'],
        is_demo_data: true,
        briefing_json: {
          origem:    'ShowcaseLP/portal',
          idioma:    language ?? 'pt',
          timestamp: new Date().toISOString(),
          user_id:   userId,
        },
      });

    if (contactError) {
      // Non-fatal — lead capture failure shouldn't block sign-in
      console.warn('[signup-showcase] contact insert warning:', contactError.message);
    }

    // ─── Return success ────────────────────────────────────────────────────────
    return new Response(JSON.stringify({
      success:  true,
      user_id:  userId,
      email:    email.trim().toLowerCase(),
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
