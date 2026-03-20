import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─────────────────────────────────────────────────────────────────────────────
// form-lp-lead  — Cérebro Único de Captura (DNA do typebot-webhook)
//
// REGRAS DE NEGÓCIO (intransferíveis):
//   · Se source/origin = "amazo-sdr"  → tag 'amazo-sdr', NÃO 'new' nem 'Hub-lp'
//   · Qualquer origem                 → contato + deal na col. 1 do Board SDR
//   · Push notification não-bloqueante ("o apito") para a Lidi
//   · Trigger n8n Briefing/WA (não-bloqueante)
//
// PROTEÇÃO ANTI-DUPLICATA:
//   · Inserção com ON CONFLICT (phone) → UPSERT via `.upsert()` não dispara 23505
//   · Um único deal é verificado antes de criar: se já existe deal para o contato
//     neste board, não cria outro (idempotência total)
// ─────────────────────────────────────────────────────────────────────────────

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
        console.log('[form-lp-lead] ── Payload ──────────────────────────────');
        console.log(JSON.stringify(payload, null, 2));

        // ── Extração de campos ────────────────────────────────────────────────
        const name         = payload.name || payload.Nome || payload.fullName || '';
        const whatsapp     = payload.whatsapp || payload.phone || payload.telefone || '';
        const email        = payload.email || payload.Email || null;
        const services     = payload.services || payload.servicos || null;
        const landedVia    = payload.landedVia || payload.origem_url || 'webhook';
        const message      = payload.message || payload.mensagem || null;
        const businessType = payload.businessType || payload.tipoNegocio || null;
        const rawOrigin    = (payload.origin || payload.source || payload.origem || '').toLowerCase().trim();
        const rawProcess   = (payload.process || '').toLowerCase().trim();
        const rawLandedVia = (payload.landedVia || payload.landed_via || payload.origem_url || '').toLowerCase().trim();

        // ── REGRA DE TAGS ─────────────────────────────────────────────────────
        // Detecta origem com tolerância máxima: cobre todos os formatos que Link d'Água pode enviar.
        //
        //  · amazo-sdr   → tag 'amazo-sdr'       (SDR via Amazô)
        //  · linkdagua   → tags ['linkdagua', '🤖 sdr']  (Link d'Água / QR d'Água)
        //  · sdr         → idem (payload simplificado)
        //  · qualquer outro → 'Hub-lp' (formulário da landing page principal)
        //
        let source: string;
        let tagsArray: string[];
        let originValue: string;

        const isAmazoSdr = rawOrigin === 'amazo-sdr' || rawProcess === 'amazo-sdr';

        // Link d'Água: qualquer menção a 'linkdagua', 'link d'água', 'sdr' ou 'qrdagua'
        const isLinkDagua =
            rawOrigin.includes('linkdagua') ||
            rawOrigin.includes("link d'água") ||
            rawOrigin.includes('linkd') ||
            rawOrigin === 'sdr' ||
            rawOrigin === 'qrdagua' ||
            rawProcess.includes('linkdagua') ||
            rawProcess === 'sdr' ||
            rawLandedVia.includes('linkdagua') ||
            rawLandedVia.includes('qrdagua') ||
            (payload.tags && Array.isArray(payload.tags) && payload.tags.some((t: string) =>
                ['sdr', '🤖 sdr', 'linkdagua'].includes(String(t).toLowerCase())
            ));

        if (isAmazoSdr) {
            source      = 'amazo-sdr';
            tagsArray   = ['amazo-sdr'];
            originValue = 'amazo sdr';
        } else if (isLinkDagua) {
            source      = "Link d'Água";
            tagsArray   = ['linkdagua', '🤖 sdr'];
            originValue = 'lp linkdagua';
        } else {
            source      = 'LP do Hub';
            tagsArray   = ['Hub-lp'];
            originValue = 'lp hub';
        }

        // ── Validação ─────────────────────────────────────────────────────────
        if (!name || !whatsapp) {
            return new Response(
                JSON.stringify({ error: 'Campos obrigatórios ausentes: name e whatsapp' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ── Normaliza serviços ────────────────────────────────────────────────
        const servicesArray: string[] = Array.isArray(services)
            ? services
            : typeof services === 'string' && services.trim()
                ? services.split(',').map((s: string) => s.trim())
                : businessType ? [businessType] : [];

        // ── briefing_json ─────────────────────────────────────────────────────
        const briefingJson = {
            name,
            whatsapp,
            services: servicesArray,
            source,
            landed_via: landedVia,
            message: message || undefined,
            capture_time: new Date().toISOString(),
        };

        // ════════════════════════════════════════════════════════════════════════
        // 1. UPSERT em contacts (phone é unique — sem 23505, sem duplicatas)
        // ════════════════════════════════════════════════════════════════════════
        const fallbackEmail = email || `${whatsapp.replace(/\D/g, '')}@sdr.webhook`;

        const { data: upsertedContact, error: upsertError } = await supabaseClient
            .from('contacts')
            .upsert(
                [{
                    phone:        whatsapp,
                    name,
                    email:        fallbackEmail,
                    status:       'ACTIVE',
                    stage:        'LEAD',
                    source,
                    briefing_json: briefingJson,
                    notes:        `Lead via ${source}\nWhatsApp: ${whatsapp}\nServiços: ${servicesArray.join(', ') || 'n/i'}\nMensagem: ${message || 'n/a'}`,
                    company_id:   null,
                }],
                { onConflict: 'phone', ignoreDuplicates: false }
            )
            .select('id, name')
            .single();

        if (upsertError) {
            console.error('[form-lp-lead] ❌ Erro no upsert de contato:', upsertError);
            throw upsertError;
        }

        const resolvedContactId = upsertedContact.id;
        console.log('[form-lp-lead] ✅ Contato upserted:', upsertedContact);

        // ════════════════════════════════════════════════════════════════════════
        // 2. DEAL no Board SDR (idempotente — não cria se já existe)
        // ════════════════════════════════════════════════════════════════════════

        // Busca o Board SDR
        const { data: sdrBoard } = await supabaseClient
            .from('boards')
            .select('id')
            .ilike('name', '%SDR%')
            .limit(1)
            .maybeSingle();

        const { data: fallbackBoard } = !sdrBoard
            ? await supabaseClient.from('boards').select('id').limit(1).maybeSingle()
            : { data: null };

        let targetBoardId = sdrBoard?.id ?? fallbackBoard?.id ?? null;
        let targetStageId: string | null = null;

        if (targetBoardId) {
            // Primeira coluna: tenta "Lead"/"Novo", fallback à col. 1 em ordem
            const { data: leadStage } = await supabaseClient
                .from('board_stages')
                .select('id')
                .eq('board_id', targetBoardId)
                .or('label.ilike.*Lead*,label.ilike.*Novo*,name.ilike.*Lead*,name.ilike.*Novo*')
                .limit(1)
                .maybeSingle();

            if (leadStage?.id) {
                targetStageId = leadStage.id;
            } else {
                const { data: firstStage } = await supabaseClient
                    .from('board_stages')
                    .select('id')
                    .eq('board_id', targetBoardId)
                    .order('order', { ascending: true })
                    .limit(1)
                    .maybeSingle();
                targetStageId = firstStage?.id ?? null;
            }

            if (!targetStageId) {
                console.warn('[form-lp-lead] Board sem colunas. Deal não criado.');
                targetBoardId = null;
            }
        }

        if (targetBoardId && resolvedContactId) {
            // Verifica se já existe deal para este contato neste board (idempotência)
            const { data: existingDeal } = await supabaseClient
                .from('deals')
                .select('id')
                .eq('contact_id', resolvedContactId)
                .eq('board_id', targetBoardId)
                .limit(1)
                .maybeSingle();

            if (existingDeal) {
                console.log('[form-lp-lead] Deal já existe para este contato. Não criará duplicata:', existingDeal.id);
            } else {
                const { error: dealError } = await supabaseClient.from('deals').insert([{
                    title:         `Lead: ${name} (${source})`,
                    status:        targetStageId,
                    stage_id:      targetStageId,
                    value:         0,
                    board_id:      targetBoardId,
                    contact_id:    resolvedContactId,
                    source,
                    briefing_json: briefingJson,
                    tags:          tagsArray,
                    custom_fields: { Origem: originValue },
                    notes:         `Lead automático via ${source}\nWhatsApp: ${whatsapp}\nServiços: ${servicesArray.join(', ') || 'n/i'}`,
                    probability:   20,
                    priority:      'medium',
                }]);

                if (dealError) {
                    console.warn('[form-lp-lead] ⚠️ Deal creation warning:', dealError.message);
                } else {
                    console.log(`[form-lp-lead] ✅ Deal criado no board ${targetBoardId}`);
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════════
        // 3. WAITLIST (compatibilidade retroativa)
        // ════════════════════════════════════════════════════════════════════════
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
            .then(({ error }) => {
                if (error) console.warn('[form-lp-lead] Waitlist warning:', error.message);
            });

        // ════════════════════════════════════════════════════════════════════════
        // 4. TRIGGER IA / BRIEFING (n8n — idêntico ao typebot-webhook original)
        //    Não-bloqueante. Envia lead.captured para o n8n processar Briefing + WA.
        // ════════════════════════════════════════════════════════════════════════
        const n8nUrl = Deno.env.get('N8N_BRIEFING_WEBHOOK_URL') || Deno.env.get('N8N_WEBHOOK_URL') || '';
        if (n8nUrl) {
            fetch(n8nUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event:        'lead.captured',
                    contact_id:   resolvedContactId,
                    name, whatsapp, email, source,
                    services:     servicesArray,
                    message,
                    landed_via:   landedVia,
                    briefing:     briefingJson,
                    tags:         tagsArray,
                    capture_time: new Date().toISOString(),
                }),
            }).catch(e => console.warn('[form-lp-lead] n8n trigger failed (non-blocking):', e.message));
        }

        // ════════════════════════════════════════════════════════════════════════
        // 5. PUSH NOTIFICATION — "o apito para a Lidi" (idêntico ao typebot-webhook)
        // ════════════════════════════════════════════════════════════════════════
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
                title:     `🤖 Novo Lead: ${name}!`,
                notifBody: `${name} entrou via ${source}${servicesArray.length ? ` | ${servicesArray.join(', ')}` : ''}`,
                url:       '/boards',
                lead_id:   resolvedContactId,
            }),
        }).catch(e => console.warn('[form-lp-lead] Push falhou (non-blocking):', e.message));

        console.log(`[form-lp-lead] ✅ Concluído | ${name} | ${source} | tags: ${tagsArray}`);

        return new Response(
            JSON.stringify({
                success:   true,
                contactId: resolvedContactId,
                source,
                tags:      tagsArray,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('[form-lp-lead] ❌ Fatal:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
