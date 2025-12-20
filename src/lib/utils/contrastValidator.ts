/**
 * Color Contrast Validation Utility
 * 
 * Implements WCAG 2.1 contrast ratio calculation to ensure QR codes
 * are readable in both light and dark modes.
 * 
 * WCAG Standards:
 * - AA Level: Minimum contrast ratio of 4.5:1 for normal text
 * - AAA Level: Minimum contrast ratio of 7:1 for normal text
 * - For QR codes, we use AA standard (4.5:1) as minimum
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Handle 3-digit hex
    if (cleanHex.length === 3) {
        const r = parseInt(cleanHex[0] + cleanHex[0], 16);
        const g = parseInt(cleanHex[1] + cleanHex[1], 16);
        const b = parseInt(cleanHex[2] + cleanHex[2], 16);
        return { r, g, b };
    }

    // Handle 6-digit hex
    if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return { r, g, b };
    }

    return null;
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
    // Normalize RGB values to 0-1 range
    const [rs, gs, bs] = [r, g, b].map(val => {
        const normalized = val / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    // Calculate luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * 
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) {
        return 0; // Invalid color format
    }

    const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    // Ensure lighter color is in numerator
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1)
 * 
 * @param fgColor - Foreground color (hex format)
 * @param bgColor - Background color (hex format)
 * @returns true if contrast is sufficient, false otherwise
 */
export function isContrastSafe(fgColor: string, bgColor: string): boolean {
    const ratio = calculateContrastRatio(fgColor, bgColor);
    return ratio >= 4.5; // WCAG AA standard
}

/**
 * Get contrast level description
 * 
 * @param ratio - Contrast ratio
 * @returns Description of contrast level
 */
export function getContrastLevel(ratio: number): {
    level: 'fail' | 'aa' | 'aaa';
    description: string;
} {
    if (ratio >= 7) {
        return {
            level: 'aaa',
            description: 'Excelente contraste (AAA)'
        };
    } else if (ratio >= 4.5) {
        return {
            level: 'aa',
            description: 'Bom contraste (AA)'
        };
    } else {
        return {
            level: 'fail',
            description: 'Contraste insuficiente'
        };
    }
}

/**
 * Suggest a safer foreground color if contrast is insufficient
 * 
 * @param bgColor - Background color (hex format)
 * @returns Suggested foreground color (black or white)
 */
export function suggestForegroundColor(bgColor: string): string {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return '#000000';

    const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

    // If background is dark, use white; if light, use black
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
