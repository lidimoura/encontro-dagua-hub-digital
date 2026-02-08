/**
 * UUID Polyfill for environments that don't support crypto.randomUUID()
 * Generates a unique ID using Math.random() and timestamp
 */

export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Polyfill crypto.randomUUID if not available
 * This ensures compatibility across all browsers and environments
 */
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    crypto.randomUUID = generateId;
}
