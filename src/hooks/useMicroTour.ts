import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useMicroTour — Per-route tour state management for Just-in-Time onboarding (V10.4.5).
 *
 * Two trigger modes:
 *
 * 1. AUTO (first visit): fires once when localStorage flag is absent.
 *    An 800ms delay lets the DOM render data-tour targets before Joyride attaches.
 *
 * 2. FORCED (Help Center): AiflowSupport navigates with
 *    `navigate(route, { state: { forceMicroTour: true } })`.
 *    The hook reads location.state SYNCHRONOUSLY on mount — no setTimeout, no race condition.
 *    localStorage flag is cleared and tour runs immediately.
 *    window.history.replaceState() scrubs the flag from history so F5 doesn't replay the tour.
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

export function useMicroTour(routeKey: RouteKey) {
    const storageKey = `${STORAGE_PREFIX}${routeKey}`;
    const location = useLocation();

    const [shouldShow, setShouldShow] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const forced = (location.state as Record<string, unknown> | null)?.forceMicroTour === true;

        if (forced) {
            // MISSION 2 & 3: Forced trigger from Help Center.
            // Clear the localStorage flag so we bypass the "already seen" gate.
            localStorage.removeItem(storageKey);
            // Scrub the Router state from history immediately so F5 won't replay the tour.
            window.history.replaceState({}, document.title);
            // Show the tour RIGHT NOW — no setTimeout needed.
            // The component tree is already mounted when this effect runs.
            setStepIndex(0);
            setShouldShow(true);
            return;
        }

        // AUTO mode: first visit only (flag absent in localStorage)
        const seen = localStorage.getItem(storageKey);
        if (!seen) {
            // Delay to let DOM render data-tour targets before Joyride attaches.
            const timer = setTimeout(() => {
                setStepIndex(0);
                setShouldShow(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]); // location.state intentionally excluded: we only need it on mount

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
