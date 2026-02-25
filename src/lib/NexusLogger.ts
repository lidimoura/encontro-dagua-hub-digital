/**
 * Nexus Logger Service
 * 
 * Standardized logging utility for the Agility OS ecosystem.
 * Extracts and centralizes the "NEXUS DEBUG" pattern found in Layout and ProtectedRoute.
 * 
 * Features:
 * - Visual console icons for quick scanning (🧭, ✅, ❌, ⚡, 🔒)
 * - Structured data payload support
 * - Webhook readiness for Agility OS integration
 * - Singleton pattern for consistent usage
 */

export interface LogPayload {
    [key: string]: any;
}

export class NexusLogger {
    private static readonly PREFIX = 'NEXUS DEBUG';
    private static readonly webhookUrl = process.env.VITE_AGILITY_WEBHOOK_URL || '';

    /**
     * 🧭 Navigation Events
     * Tracks route changes and user movement.
     */
    static navigation(message: string, data?: LogPayload) {
        this.print('🧭', message, data);
    }

    /**
     * ✅ Success Events
     * Tracks successful operations, access grants, and completions.
     */
    static success(message: string, data?: LogPayload) {
        this.print('✅', message, data);
    }

    /**
     * 🔒 Auth/Security Events
     * Tracks authentication states, guards, and permission checks.
     */
    static auth(message: string, data?: LogPayload) {
        this.print('🔒', message, data);
    }

    /**
     * ⚡ Action Events
     * Tracks user interactions, button clicks, and triggered workflows.
     */
    static action(actionName: string, data?: LogPayload) {
        this.print('⚡', `Action: ${actionName}`, data);
    }

    /**
     * ⏳ Loading/Wait Events
     * Tracks loading states and async waits.
     */
    static wait(message: string, data?: LogPayload) {
        this.print('⏳', message, data);
    }

    /**
     * ❌ Error Events
     * Tracks exceptions and failures. 
     * CRITICAL: Sends to Agility OS Webhook.
     */
    static error(message: string, error?: any, data?: LogPayload) {
        const payload = { ...data, error };
        this.print('❌', message, payload, true);
        this.sendToAgility('error', message, payload);
    }

    /**
     * ℹ️ Info Events
     * General information logs.
     */
    static info(message: string, data?: LogPayload) {
        this.print('ℹ️', message, data);
    }

    /**
     * Internal print method to format the console output.
     */
    private static print(icon: string, message: string, data?: LogPayload, isError = false) {
        const timestamp = new Date().toISOString();
        const label = `${icon} ${this.PREFIX}: ${message}`;

        // Console Payload
        const consoleData = data ? { ...data, timestamp } : { timestamp };

        if (isError) {
            console.error(label, consoleData);
        } else {
            console.log(label, consoleData);
        }
    }

    /**
     * Placeholder for sending logs to the external Agility OS Webhook.
     * This allows the "Nexus Guia" Agent to monitor system health remotely.
     */
    private static async sendToAgility(type: string, message: string, payload: any) {
        if (!this.webhookUrl) return;

        try {
            // Intentionally not awaiting to avoid blocking the main thread
            fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message,
                    payload,
                    source: 'Nexus Client',
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.warn('Failed to send log to Agility OS', err));
        } catch (e) {
            // Fail silently to not disrupt user experience
        }
    }
}
