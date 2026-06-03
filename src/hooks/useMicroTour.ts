import { useState, useEffect, useCallback } from 'react';

/**
 * useMicroTour — Per-route tour state management (V10.4.6)
 *
 * Trigger modes:
 * 1. AUTO: fires once on first visit (localStorage flag absent, 800ms delay for DOM)
 * 2. FORCED: MicroTourContext calls the registered trigger callback → immediate fire
 *
 * The Context approach is router-agnostic (works with HashRouter, BrowserRouter, etc.)
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

    const [shouldShow, setShouldShow] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [runKey, setRunKey] = useState(0); // bump to force Joyride re-mount

    /* AUTO mode: first visit only */
    useEffect(() => {
        const seen = localStorage.getItem(storageKey);
        console.log(`[MicroTour:${routeKey}] mount — seen=${seen}, will auto-trigger=${!seen}`);
        if (!seen) {
            const timer = setTimeout(() => {
                console.log(`[MicroTour:${routeKey}] AUTO-TRIGGER firing (first visit)`);
                setStepIndex(0);
                setRunKey(k => k + 1);
                setShouldShow(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    /** Called by MicroTourContext when AiflowSupport requests a forced trigger */
    const forceTrigger = useCallback(() => {
        console.log(`[MicroTour:${routeKey}] FORCE-TRIGGER from Help Center`);
        localStorage.removeItem(storageKey);
        // Reset Joyride fully: hide → reset index → bump runKey → show
        setShouldShow(false);
        setStepIndex(0);
        // Two-tick cycle: first tick unmounts Joyride, second tick remounts fresh
        setTimeout(() => {
            setRunKey(k => k + 1);
            setShouldShow(true);
        }, 50);
    }, [routeKey, storageKey]);

    const markSeen = useCallback(() => {
        console.log(`[MicroTour:${routeKey}] markSeen`);
        localStorage.setItem(storageKey, 'true');
        setShouldShow(false);
    }, [routeKey, storageKey]);

    const reset = useCallback(() => {
        localStorage.removeItem(storageKey);
        setStepIndex(0);
        setRunKey(k => k + 1);
        setShouldShow(true);
    }, [storageKey]);

    return { shouldShow, setShouldShow, stepIndex, setStepIndex, runKey, markSeen, reset, forceTrigger };
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
