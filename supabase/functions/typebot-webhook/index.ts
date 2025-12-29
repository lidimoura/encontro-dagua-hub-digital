import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Parse request body
        const payload = await req.json();
        console.log('Received Typebot webhook:', JSON.stringify(payload, null, 2));

        // Extract lead data from Typebot payload
        // Adjust these field names based on your Typebot configuration
        const leadData = {
            name: payload.name || payload.fullName || payload.Nome || '',
            whatsapp: payload.whatsapp || payload.phone || payload.telefone || '',
            email: payload.email || payload.Email || null,
            businessType: payload.businessType || payload.tipoNegocio || null,
            referralSource: payload.referralSource || payload.origem || 'typebot',
            message: payload.message || payload.mensagem || null,
        };

        // Validate required fields
        if (!leadData.name || !leadData.whatsapp) {
            console.error('Missing required fields:', leadData);
            return new Response(
                JSON.stringify({ error: 'Missing required fields: name and whatsapp' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // 1. Add to waitlist
        const { data: waitlistData, error: waitlistError } = await supabaseClient
            .from('waitlist')
            .insert([
                {
                    name: leadData.name,
                    whatsapp: leadData.whatsapp,
                    email: leadData.email,
                    referred_by: leadData.referralSource,
                    status: 'PENDING',
                    metadata: {
                        businessType: leadData.businessType,
                        message: leadData.message,
                        source: 'typebot_webhook',
                        timestamp: new Date().toISOString(),
                        rawPayload: payload,
                    },
                },
            ])
            .select();

        if (waitlistError) {
            console.error('Waitlist insertion error:', waitlistError);
            throw waitlistError;
        }

        console.log('Waitlist entry created:', waitlistData);

        // 2. Create contact as LEAD
        const { data: contactData, error: contactError } = await supabaseClient
            .from('contacts')
            .insert([
                {
                    name: leadData.name,
                    phone: leadData.whatsapp,
                    email: leadData.email || `${leadData.whatsapp.replace(/\D/g, '')}@temp.typebot.com`,
                    status: 'ACTIVE',
                    stage: 'LEAD',
                    source: 'WEBSITE',
                    notes: `Lead capturado via Typebot\nTipo de Negócio: ${leadData.businessType || 'Não informado'}\nMensagem: ${leadData.message || 'Nenhuma'}\nOrigem: ${leadData.referralSource}`,
                    company_id: null, // Will be created by admin
                },
            ])
            .select();

        if (contactError) {
            // Log but don't fail if contact already exists
            console.warn('Contact creation warning (may already exist):', contactError);
        } else {
            console.log('Contact created:', contactData);
        }

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Lead captured successfully',
                waitlistId: waitlistData?.[0]?.id,
                contactId: contactData?.[0]?.id,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
                details: error.toString(),
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
