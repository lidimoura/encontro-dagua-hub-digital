import { useState, useEffect, useCallback } from 'react';

/**
 * useMicroTour — Per-route tour state management for Just-in-Time onboarding (V10.4.4).
 *
 * Each route gets its own localStorage flag so tours fire independently.
 * Supports on-demand re-trigger via a custom DOM event `microTour:retrigger:{routeKey}`.
 * This allows AiflowSupport to force the tour even for users who already saw it.
 */

export type RouteKey =
    | 'contacts'
    | 'boards'
    | 'activities'
    | 'ai'
    | 'qrdagua'
    | 'promptLab'
    | 'decisions'
    | 'settings'
    | 'techStack'
    | 'catalog'
    | 'dashboard'
    | 'reports';

const STORAGE_PREFIX = 'microTour_seen_';

/** Custom event name for on-demand re-trigger from AiflowSupport */
export const getMicroTourRetriggerEvent = (routeKey: RouteKey) =>
    `microTour:retrigger:${routeKey}`;

export function useMicroTour(routeKey: RouteKey) {
    const storageKey = `${STORAGE_PREFIX}${routeKey}`;
    const retriggerEvent = getMicroTourRetriggerEvent(routeKey);

    const [shouldShow, setShouldShow] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    /* Auto-trigger on first visit (flag not set) */
    useEffect(() => {
        const seen = localStorage.getItem(storageKey);
        if (!seen) {
            // Delay to let DOM render data-tour targets
            const timer = setTimeout(() => {
                setStepIndex(0);
                setShouldShow(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [storageKey]);

    /* On-demand re-trigger via DOM event dispatched by AiflowSupport */
    useEffect(() => {
        const handler = () => {
            localStorage.removeItem(storageKey);
            setStepIndex(0);
            setShouldShow(false);
            // Small delay to allow Joyride to fully unmount before re-mounting
            setTimeout(() => setShouldShow(true), 150);
        };
        window.addEventListener(retriggerEvent, handler);
        return () => window.removeEventListener(retriggerEvent, handler);
    }, [storageKey, retriggerEvent]);

    const markSeen = useCallback(() => {
        localStorage.setItem(storageKey, 'true');
        setShouldShow(false);
    }, [storageKey]);

    const reset = useCallback(() => {
        localStorage.removeItem(storageKey);
        setStepIndex(0);
        setShouldShow(true);
    }, [storageKey]);

    return { shouldShow, setShouldShow, stepIndex, setStepIndex, markSeen, reset };
}

/** Reset ALL micro-tour flags (used by Settings "Reset Onboarding") */
export function resetAllMicroTours() {
    const keys: RouteKey[] = [
        'contacts', 'boards', 'activities', 'ai', 'qrdagua',
        'promptLab', 'decisions', 'settings', 'techStack',
        'catalog', 'dashboard', 'reports',
    ];
    keys.forEach(k => localStorage.removeItem(`${STORAGE_PREFIX}${k}`));
}
