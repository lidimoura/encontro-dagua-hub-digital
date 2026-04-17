/**
 * ─── NEXUS BRIDGE — Agility OS Error Interceptor ──────────────────────────────
 * Sends real-time debug payloads to the project's own Supabase webhook.
 * Authenticated via VITE_CRM_API_KEY environment variable.
 *
 * ⚠️  URL GUARD: Only fires if the Supabase URL belongs to THIS project.
 *     Never blocks page rendering — silent fail with console.warn.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── URL deste projeto (via env) ───────────────────────────────────────────────
const THIS_SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
const NEXUS_WEBHOOK_URL = THIS_SUPABASE_URL
  ? `${THIS_SUPABASE_URL}/functions/v1/incoming-deal`
  : ''; // vazio = desativado

export interface NexusAlertPayload {
    /** Human-readable error description */
    error_message: string;
    /** Full stack trace string, if available */
    stack_trace?: string;
    /** Which page/component was active when the error occurred */
    component_context?: string;
    /** Current app state snapshot */
    app_state?: {
        url?: string;
        userId?: string | null;
        role?: string | null;
        timestamp?: string;
        userAgent?: string;
    };
}

/**
 * Fires a debug payload to the project's own Supabase webhook.
 * NEVER throws — fails silently with console.warn.
 * Uses AbortController (3s) so a dead DNS never hangs the browser.
 */
export async function sendNexusAlert(payload: NexusAlertPayload): Promise<void> {
    // ── Guard: desativado se URL não configurada ──────────────────────────────
    if (!NEXUS_WEBHOOK_URL) {
        console.warn('[NexusBridge] Webhook URL not configured — skipping alert.');
        return;
    }

    const apiKey = import.meta.env.VITE_CRM_API_KEY as string | undefined;

    const enrichedPayload: NexusAlertPayload = {
        ...payload,
        app_state: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...payload.app_state,
        },
    };

    // AbortController: cancela após 3s — nunca bloqueia a UI
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    try {
        await fetch(NEXUS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-nexus-key': apiKey || '',
            },
            body: JSON.stringify(enrichedPayload),
            keepalive: true,
            signal: controller.signal,
        });
    } catch (err) {
        // Silent failure — log locally, NEVER re-throw
        console.warn('[NexusBridge] Failed to send alert (network/timeout):', err);
    } finally {
        clearTimeout(timer);
    }
}

