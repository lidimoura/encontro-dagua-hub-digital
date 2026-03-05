// =============================================================
// Edge Function: send-push-notification
// Sprint 2026-03-04 | Encontro d'Água Hub Digital
// =============================================================
// Sends Web Push notifications to all subscriptions in
// push_subscriptions table.
// Uses the applicationServerKey (VAPID) approach via
// the Web Push Protocol (RFC 8030) implemented natively in Deno.
//
// Env vars required (Supabase Dashboard → Project → Settings → Edge Functions → Secrets):
//   VAPID_PUBLIC_KEY   → base64url-encoded 65-byte public key
//   VAPID_PRIVATE_KEY  → base64url-encoded 32-byte private key
//   VAPID_SUBJECT      → mailto:lidi@encontrodagua.com
//   SUPABASE_URL       → auto-injected by Supabase
//   SUPABASE_SERVICE_ROLE_KEY → auto-injected by Supabase
// =============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── CORS headers ─────────────────────────────────────────────
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Web Push JWT helpers (native Deno crypto) ─────────────────
async function generateVapidToken(audience: string): Promise<string> {
    const privateKeyB64 = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const subject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:lidi@encontrodagua.com';

    const header = { alg: 'ES256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        aud: audience,
        exp: now + 12 * 3600,
        sub: subject,
    };

    const encode = (obj: object) =>
        btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const signingInput = `${encode(header)}.${encode(payload)}`;

    // Import VAPID private key (PKCS8 / EC P-256)
    const rawKey = Uint8Array.from(
        atob(privateKeyB64.replace(/-/g, '+').replace(/_/g, '/')),
        c => c.charCodeAt(0)
    );

    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        rawKey,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        cryptoKey,
        new TextEncoder().encode(signingInput)
    );

    const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return `${signingInput}.${sig}`;
}

// ── Send a single push notification ──────────────────────────
async function sendPush(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: { title: string; body: string; url?: string }
): Promise<{ ok: boolean; status?: number; error?: string }> {
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.hostname}`;

    const jwt = await generateVapidToken(audience);

    const body = JSON.stringify({
        notification: {
            title: payload.title,
            body: payload.body,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            data: { url: payload.url ?? '/' },
            vibrate: [200, 100, 200],
        },
    });

    const res = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `vapid t=${jwt},k=${publicKey}`,
            'Content-Type': 'application/json',
            'TTL': '86400',
        },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        return { ok: false, status: res.status, error: text };
    }
    return { ok: true, status: res.status };
}

// ── Main handler ──────────────────────────────────────────────
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const body = await req.json();
        const { title, notifBody: bodyText, url, lead_id } = body as {
            title?: string;
            notifBody?: string;
            url?: string;
            lead_id?: string;
        };

        const pushTitle = title ?? '🔔 Novo Lead!';
        const pushBody = bodyText ?? 'Um novo lead chegou no CRM.';

        // Fetch all active push subscriptions
        const { data: subs, error: subsError } = await supabase
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth');

        if (subsError) throw subsError;
        if (!subs || subs.length === 0) {
            return new Response(
                JSON.stringify({ ok: true, sent: 0, message: 'No subscriptions found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Send to all subscriptions concurrently
        const results = await Promise.allSettled(
            subs.map(sub => sendPush(sub, { title: pushTitle, body: pushBody, url }))
        );

        const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).ok).length;
        const failed = results.length - sent;

        // Clean up expired/invalid subscriptions (HTTP 410 Gone)
        const expiredEndpoints: string[] = [];
        results.forEach((r, i) => {
            if (r.status === 'fulfilled' && (r.value as any).status === 410) {
                expiredEndpoints.push(subs[i].endpoint);
            }
        });
        if (expiredEndpoints.length > 0) {
            await supabase
                .from('push_subscriptions')
                .delete()
                .in('endpoint', expiredEndpoints);
        }

        return new Response(
            JSON.stringify({ ok: true, sent, failed, total: subs.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        console.error('[send-push-notification]', err);
        return new Response(
            JSON.stringify({ ok: false, error: String(err) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
