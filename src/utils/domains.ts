/**
 * Domain Utility for Link d'Água
 * Handles URL generation for Short Links and Previews
 */

export const getSiteUrl = (): string => {
    // Check for VITE_ or NEXT_PUBLIC_ env vars, fallback to window.location.origin
    const envUrl = import.meta.env.VITE_SITE_URL || import.meta.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl) return envUrl;

    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return 'https://link.encontrodagua.com';
};

export const getShortLink = (slug: string): string => {
    const baseUrl = getSiteUrl().replace(/\/$/, ''); // Remove trailing slash
    // Ensure we use the /r/ route for short links
    return `${baseUrl}/r/${slug}`;
};

export const getPreviewLink = (slug: string): string => {
    const baseUrl = getSiteUrl().replace(/\/$/, '');
    // Preview uses the hash router /#/v/ typically, but we want to standardize on /r/ if possible.
    // However, for internal app preview, we might still use the hash route.
    // Requested format: link.encontrodagua.com/r/
    return `${baseUrl}/r/${slug}`;
};
