import { useState, useEffect, useCallback } from 'react';

/**
 * useMicroTour — Per-route tour state management for Just-in-Time onboarding.
 * Each route gets its own localStorage flag so tours fire independently.
 */

type RouteKey = 'contacts' | 'boards' | 'activities' | 'ai' | 'qrdagua' | 'promptLab' | 'decisions' | 'settings' | 'techStack' | 'catalog' | 'dashboard' | 'reports';

const STORAGE_PREFIX = 'microTour_seen_';

export function useMicroTour(routeKey: RouteKey) {
    const storageKey = `${STORAGE_PREFIX}${routeKey}`;

    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(storageKey);
        if (!seen) {
            // Delay to let DOM render data-tour targets
            const timer = setTimeout(() => setShouldShow(true), 800);
            return () => clearTimeout(timer);
        }
    }, [storageKey]);

    const markSeen = useCallback(() => {
        localStorage.setItem(storageKey, 'true');
        setShouldShow(false);
    }, [storageKey]);

    const reset = useCallback(() => {
        localStorage.removeItem(storageKey);
        setShouldShow(true);
    }, [storageKey]);

    return { shouldShow, markSeen, reset };
}

/** Reset ALL micro-tour flags (used by Settings "Reset Onboarding") */
export function resetAllMicroTours() {
    const keys: RouteKey[] = ['contacts', 'boards', 'activities', 'ai', 'qrdagua', 'promptLab', 'decisions', 'settings', 'techStack', 'catalog', 'dashboard', 'reports'];
    keys.forEach(k => localStorage.removeItem(`${STORAGE_PREFIX}${k}`));
}
