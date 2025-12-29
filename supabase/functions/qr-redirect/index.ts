import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get QR code ID from URL path
        const url = new URL(req.url);
        const qrId = url.pathname.split('/').pop();

        if (!qrId) {
            return new Response('QR Code ID is required', { status: 400, headers: corsHeaders });
        }

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

        // Get QR code data
        const { data: qrCode, error: qrError } = await supabaseClient
            .from('qr_codes')
            .select('*')
            .eq('id', qrId)
            .single();

        if (qrError || !qrCode) {
            console.error('QR Code not found:', qrError);
            return new Response('QR Code not found', { status: 404, headers: corsHeaders });
        }

        // Increment scan count
        const { error: incrementError } = await supabaseClient.rpc('increment_qr_scan', {
            qr_id: qrId,
        });

        if (incrementError) {
            console.error('Error incrementing scan count:', incrementError);
            // Don't fail the redirect, just log the error
        }

        // Determine redirect URL based on QR type
        let redirectUrl = qrCode.url || qrCode.link_url;

        if (qrCode.qr_type === 'BRIDGE') {
            // Redirect to bridge page
            redirectUrl = `${Deno.env.get('PUBLIC_URL')}/v/${qrCode.slug}`;
        } else if (qrCode.qr_type === 'CARD') {
            // Redirect to digital card
            redirectUrl = `${Deno.env.get('PUBLIC_URL')}/card/${qrCode.slug}`;
        }

        if (!redirectUrl) {
            return new Response('No redirect URL configured', { status: 400, headers: corsHeaders });
        }

        // Log the scan for analytics
        console.log(`QR Scan: ${qrId} → ${redirectUrl} (Total scans: ${(qrCode.scan_count || 0) + 1})`);

        // Redirect to final destination
        return new Response(null, {
            status: 302,
            headers: {
                ...corsHeaders,
                'Location': redirectUrl,
            },
        });
    } catch (error) {
        console.error('Redirect error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
