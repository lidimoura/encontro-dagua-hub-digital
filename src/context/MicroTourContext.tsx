import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import type { RouteKey } from '@/hooks/useMicroTour';

/**
 * MicroTourContext — Global tour trigger registry (V10.4.6)
 *
 * Solves the HashRouter location.state drop problem.
 * Any page registers its "force start" callback here.
 * AiflowSupport calls requestTour(routeKey) after navigation.
 * The page component receives the signal via its registered callback.
 *
 * This is router-agnostic: works with HashRouter, BrowserRouter, MemoryRouter.
 */

interface MicroTourContextValue {
    /** Called by AiflowSupport to request a tour on a specific route */
    requestTour: (routeKey: RouteKey) => void;
    /** Called by each MicroTour component on mount to register its trigger */
    registerTrigger: (routeKey: RouteKey, trigger: () => void) => void;
    /** Called on unmount to unregister */
    unregisterTrigger: (routeKey: RouteKey) => void;
    /** Peek if a tour was requested (for components that register after requestTour is called) */
    consumePendingRequest: (routeKey: RouteKey) => boolean;
}

const MicroTourContext = createContext<MicroTourContextValue | null>(null);

export const MicroTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Map of registered trigger callbacks, keyed by routeKey
    const triggers = useRef<Map<RouteKey, () => void>>(new Map());
    // Pending requests for routes that haven't mounted yet
    const pendingRequests = useRef<Set<RouteKey>>(new Set());

    const requestTour = useCallback((routeKey: RouteKey) => {
        console.log(`[MicroTour] requestTour called for: ${routeKey}`);
        const trigger = triggers.current.get(routeKey);
        if (trigger) {
            // Component already mounted — fire immediately
            console.log(`[MicroTour] Trigger found, firing immediately for: ${routeKey}`);
            trigger();
        } else {
            // Component not yet mounted (navigation in progress) — queue the request
            console.log(`[MicroTour] No trigger registered yet, queuing for: ${routeKey}`);
            pendingRequests.current.add(routeKey);
        }
    }, []);

    const registerTrigger = useCallback((routeKey: RouteKey, trigger: () => void) => {
        console.log(`[MicroTour] Registering trigger for: ${routeKey}`);
        triggers.current.set(routeKey, trigger);
        // If there was a pending request for this key, consume it and fire now
        if (pendingRequests.current.has(routeKey)) {
            console.log(`[MicroTour] Consuming pending request for: ${routeKey}`);
            pendingRequests.current.delete(routeKey);
            // Tiny delay to let the component's DOM fully render before Joyride attaches
            setTimeout(() => trigger(), 100);
        }
    }, []);

    const unregisterTrigger = useCallback((routeKey: RouteKey) => {
        console.log(`[MicroTour] Unregistering trigger for: ${routeKey}`);
        triggers.current.delete(routeKey);
    }, []);

    const consumePendingRequest = useCallback((routeKey: RouteKey): boolean => {
        if (pendingRequests.current.has(routeKey)) {
            pendingRequests.current.delete(routeKey);
            return true;
        }
        return false;
    }, []);

    return (
        <MicroTourContext.Provider value={{ requestTour, registerTrigger, unregisterTrigger, consumePendingRequest }}>
            {children}
        </MicroTourContext.Provider>
    );
};

export const useMicroTourContext = (): MicroTourContextValue => {
    const ctx = useContext(MicroTourContext);
    if (!ctx) throw new Error('useMicroTourContext must be used within MicroTourProvider');
    return ctx;
};
