import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─────────────────────────────────────────────────────────
// Webhook — Form LP Lead (Cérebro Único)
// Receives leads from LP, Link d'Água or Typebot and inserts them
// into `contacts` with the declared source + briefing_json.
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
        console.log('[form-lp-lead] Received:', JSON.stringify(payload, null, 2));

        // ── Extract fields (Typebot variable naming conventions) ──────────
        const name = payload.name || payload.Nome || payload.fullName || '';
        const whatsapp = payload.whatsapp || payload.phone || payload.telefone || '';
        const email = payload.email || payload.Email || null;
        const services = payload.services || payload.servicos || null;  // array or string
        const landedVia = payload.landedVia || payload.origem_url || 'webhook';
        const message = payload.message || payload.mensagem || null;
        const businessType = payload.businessType || payload.tipoNegocio || null;
        // The source can be 'Amazô SDR', 'Link d\'Água', or 'LP do Hub'. Fallback to Webhook.
        let source = payload.source || payload.origem || 'LP do Hub';
        
        // Se a payload já se identificar como amazo-sdr, preserve isso estritamente
        if (source.toLowerCase() === 'amazo-sdr' || payload.process === 'amazo-sdr') {
            source = 'amazo-sdr';
        } else {
            if (source.toLowerCase() === 'new' || source.toLowerCase() === 'lead') {
                source = 'LP do Hub';
            }
            if (payload.landedVia?.toLowerCase().includes('linkdagua') || payload.landedVia?.toLowerCase().includes('link d\'água')) {
                 source = 'Link d\'Água';
            }
        }

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
            source: source,
            landed_via: landedVia,
            message: message || undefined,
            capture_time: new Date().toISOString(),
        };

        // ── 1. Insert into contacts with dynamic source ──────────────
        let resolvedContactId: string | null = null;
        const { data: contactData, error: contactError } = await supabaseClient
            .from('contacts')
            .insert([{
                name,
                phone: whatsapp,
                email: email || `${whatsapp.replace(/\D/g, '')}@sdr.webhook`,
                status: 'ACTIVE',
                stage: 'LEAD',
                source: source,                  // ← critical for AnalyticsSourceCard
                briefing_json: briefingJson,     // ← critical for CRM sidebar display
                notes: `Lead via ${source}\nWhatsApp: ${whatsapp}\nServiços: ${servicesArray.join(', ') || 'n/i'}\nMensagem: ${message || 'n/a'}`,
                company_id: null,
            }])
            .select('id, name')
            .single();

        if (contactError) {
            // Handle duplicate — fetch the existing contact and use its ID for the Deal
            if (contactError.code === '23505') {
                console.warn('[form-lp-lead] Duplicate contact, fetching existing ID...');
                const { data: existing } = await supabaseClient
                    .from('contacts')
                    .select('id, name')
                    .eq('phone', whatsapp)
                    .single();
                if (existing) {
                    resolvedContactId = existing.id;
                    
                    // TRANSPLANTE VITAL: Atualiza o contato existente para não perder o novo briefing e origem
                    await supabaseClient
                        .from('contacts')
                        .update({ 
                            briefing_json: briefingJson,
                            source: source,
                        })
                        .eq('id', existing.id);
                        
                    console.log('[form-lp-lead] Resolved and updated existing contact:', existing.id);
                }
            } else {
                console.error('[form-lp-lead] Contact error:', contactError);
                throw contactError;
            }
        } else {
            resolvedContactId = contactData?.id;
            console.log('[form-lp-lead] Contact created:', contactData);
        }

        // ── 2. Create a Deal in the SDR board ────────────────────────────

        // Lookup the SDR board (or first board as fallback)
        const { data: sdrBoard } = await supabaseClient
            .from('boards')
            .select('id')
            .ilike('name', '%SDR%')
            .limit(1)
            .maybeSingle();

        const { data: fallbackBoard } = !sdrBoard ? await supabaseClient
            .from('boards')
            .select('id')
            .limit(1)
            .maybeSingle() : { data: null };

        const targetBoardId = sdrBoard?.id ?? fallbackBoard?.id ?? null;
        let targetStageId = null;

        if (targetBoardId) {
             const { data: firstStage } = await supabaseClient
                 .from('board_stages')
                 .select('id')
                 .eq('board_id', targetBoardId)
                 .order('order', { ascending: true })
                 .limit(1)
                 .maybeSingle();
             targetStageId = firstStage?.id ?? 'LEAD';
        }

        if (targetBoardId && resolvedContactId) {
            const { error: dealError } = await supabaseClient
                .from('deals')
                .insert([{
                    title: `Lead: ${name} (${source})`,
                    status: targetStageId,
                    stage_id: targetStageId,
                    value: 0,
                    board_id: targetBoardId,
                    contact_id: resolvedContactId,
                    source: source,
                    briefing_json: briefingJson,
                    notes: `Lead automático capturado via ${source}\nWhatsApp: ${whatsapp}\nServiços: ${servicesArray.join(', ') || 'n/i'}`,
                    probability: 20,
                    priority: 'medium',
                }]);

            if (dealError) {
                console.warn('[form-lp-lead] Deal creation warning:', dealError.message);
            } else {
                console.log('[form-lp-lead] ✅ Deal created in board:', targetBoardId, 'for contact:', resolvedContactId);
            }
        } else {
            console.warn('[form-lp-lead] Skipping deal creation — board:', targetBoardId, 'contact:', resolvedContactId);
        }


        // ── 2. Also add to waitlist for backward compat ──────────────────
        await supabaseClient
            .from('waitlist')
            .insert([{
                name,
                whatsapp,
                email,
                referred_by: source,
                status: 'PENDING',
                metadata: { ...briefingJson, rawPayload: payload },
            }])
            .select()
            .then(({ error }) => {
                if (error) console.warn('[form-lp-lead] Waitlist insert warning:', error.message);
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
                title: '🤖 Novo Lead Recebido!',
                notifBody: `${name} entrou por ${source}`,
                url: '/boards',
                lead_id: contactData?.id,
            }),
        }).catch(e => console.warn('[form-lp-lead] Push notification failed:', e.message));

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Lead capturado com briefing_json',
                contactId: contactData?.id,
                source: source,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('[form-lp-lead] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
