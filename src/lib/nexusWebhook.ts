/**
 * ─── NEXUS BRIDGE — Agility OS Error Interceptor ──────────────────────────────
 * Sends real-time debug payloads to the Agility OS webhook (incoming-deal).
 * Authenticated via VITE_CRM_API_KEY environment variable.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const NEXUS_WEBHOOK_URL =
    'https://kfejaqwzgzlmuaodhwmf.supabase.co/functions/v1/incoming-deal';

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
 * Fires a debug payload to the Agility OS Nexus webhook.
 * Fails silently — never throws, so it won't cascade into a second error.
 */
export async function sendNexusAlert(payload: NexusAlertPayload): Promise<void> {
    const apiKey = import.meta.env.VITE_CRM_API_KEY as string | undefined;

    // Enrich the payload with runtime context
    const enrichedPayload: NexusAlertPayload = {
        ...payload,
        app_state: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...payload.app_state,
        },
    };

    try {
        await fetch(NEXUS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-nexus-key': 'REDACTED',
            },
            body: JSON.stringify(enrichedPayload),
            // Don't block the page — fire and forget
            keepalive: true,
        });
    } catch (err) {
        // Silent failure — log locally but never let this throw
        console.warn('[NexusBridge] Failed to send alert:', err);
    }
}
