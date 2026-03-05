import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─────────────────────────────────────────────────────────
// Typebot Webhook — Amazô SDR
// Receives leads from the Typebot chatbot and inserts them
// into `contacts` with source='Amazô SDR' + briefing_json.
// ─────────────────────────────────────────────────────────

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const payload = await req.json();
        console.log('[typebot-webhook] Received:', JSON.stringify(payload, null, 2));

        // ── Extract fields (Typebot variable naming conventions) ──────────
        const name = payload.name || payload.Nome || payload.fullName || '';
        const whatsapp = payload.whatsapp || payload.phone || payload.telefone || '';
        const email = payload.email || payload.Email || null;
        const services = payload.services || payload.servicos || null;  // array or string
        const landedVia = payload.landedVia || payload.origem_url || 'typebot';
        const message = payload.message || payload.mensagem || null;
        const businessType = payload.businessType || payload.tipoNegocio || null;

        // Validate required
        if (!name || !whatsapp) {
            return new Response(
                JSON.stringify({ error: 'Campos obrigatórios ausentes: name e whatsapp' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Normalize services into array
        const servicesArray: string[] = Array.isArray(services)
            ? services
            : typeof services === 'string' && services.trim()
                ? services.split(',').map((s: string) => s.trim())
                : businessType
                    ? [businessType]
                    : [];

        // ── briefing_json: structured payload for CRM display ─────────────
        const briefingJson = {
            name,
            whatsapp,
            services: servicesArray,
            source: 'Amazô SDR',
            landed_via: landedVia,
            message: message || undefined,
            capture_time: new Date().toISOString(),
        };

        // ── 1. Insert into contacts with source='Amazô SDR' ──────────────
        const { data: contactData, error: contactError } = await supabaseClient
            .from('contacts')
            .insert([{
                name,
                phone: whatsapp,
                email: email || `${whatsapp.replace(/\D/g, '')}@sdr.amazo.bot`,
                status: 'ACTIVE',
                stage: 'LEAD',
                source: 'Amazô SDR',       // ← critical for AnalyticsSourceCard
                briefing_json: briefingJson,     // ← critical for CRM sidebar display
                notes: `Lead via Amazô SDR\nWhatsApp: ${whatsapp}\nServiços: ${servicesArray.join(', ') || 'n/i'}\nMensagem: ${message || 'n/a'}`,
                company_id: null,
            }])
            .select('id, name')
            .single();

        if (contactError) {
            // Handle duplicate (upsert by whatsapp if needed)
            if (contactError.code === '23505') {
                console.warn('[typebot-webhook] Duplicate contact, fetching existing...');
                const { data: existing } = await supabaseClient
                    .from('contacts')
                    .select('id, name')
                    .eq('phone', whatsapp)
                    .single();
                console.log('[typebot-webhook] Existing contact:', existing);
            } else {
                console.error('[typebot-webhook] Contact error:', contactError);
                throw contactError;
            }
        }

        console.log('[typebot-webhook] Contact created:', contactData);

        // ── 2. Also add to waitlist for backward compat ──────────────────
        await supabaseClient
            .from('waitlist')
            .insert([{
                name,
                whatsapp,
                email,
                referred_by: 'Amazô SDR',
                status: 'PENDING',
                metadata: { ...briefingJson, rawPayload: payload },
            }])
            .select()
            .then(({ error }) => {
                if (error) console.warn('[typebot-webhook] Waitlist insert warning:', error.message);
            });

        // ── 3. Fire push notification for Lidi ──────────────────────────
        // Non-blocking: push is best-effort
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
                title: '🤖 Novo Lead SDR!',
                notifBody: `${name} entrou pelo Amazô SDR`,
                url: '/boards',
                lead_id: contactData?.id,
            }),
        }).catch(e => console.warn('[typebot-webhook] Push notification failed:', e.message));

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Lead SDR capturado com briefing_json',
                contactId: contactData?.id,
                source: 'Amazô SDR',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('[typebot-webhook] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
