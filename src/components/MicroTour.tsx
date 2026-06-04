import React, { useCallback, useEffect, useState } from 'react';
import { Joyride, STATUS, ACTIONS, EVENTS, type EventData, type Step } from 'react-joyride';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useMicroTour, type RouteKey } from '@/hooks/useMicroTour';
import { useMicroTourContext } from '@/context/MicroTourContext';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type { RouteKey };

export interface MicroTourStepDef {
    target: string;
    titleKey: string;
    descKey: string;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
}

interface MicroTourProps {
    routeKey: RouteKey;
    steps: MicroTourStepDef[];
    /** Fires when user clicks "Learn more" — opens AiflowSupport */
    onLearnMore?: () => void;
}

/* ------------------------------------------------------------------ */
/*  DOM scan helper (called AFTER paint, not during render)            */
/* ------------------------------------------------------------------ */

/**
 * Builds the Joyride Step array ONLY after the DOM has been painted.
 * Called inside a useEffect + setTimeout so we never race against React's
 * async commit phase. Returns [] if no targets are found.
 */
function buildSteps(
    stepDefs: MicroTourStepDef[],
    routeKey: RouteKey,
    t: (key: string) => string,
    onLearnMore: (() => void) | undefined,
    markSeen: () => void,
): Step[] {
    const built: Step[] = [];

    for (const def of stepDefs) {
        const el = document.querySelector(def.target);
        if (!el) {
            console.warn(
                `[MicroTour:${routeKey}] MISSÃO 1 — target absent from DOM: ${def.target}`,
            );
            continue;
        }
        built.push({
            target: def.target,
            placement: (def.placement || 'bottom') as Step['placement'],
            disableBeacon: true,   // MISSÃO 3 — never show beacon, open tooltip instantly
            content: (
                <div>
                    <h3 className="font-bold text-white text-sm mb-1">{t(def.titleKey)}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{t(def.descKey)}</p>
                    {onLearnMore && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                markSeen();
                                onLearnMore();
                            }}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                            <HelpCircle size={12} />
                            {t('microTour.learnMore')}
                        </button>
                    )}
                </div>
            ),
        });
    }

    console.log(
        `[MicroTour:${routeKey}] DOM scan: ${built.length}/${stepDefs.length} targets present`,
    );
    return built;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/** Delay in ms before we scan the DOM for tour targets.
 *  Must be ≥ the longest animation / async render in child components.
 *  800ms covers lazy-loaded panels, skeleton-to-content swaps, etc. */
const DOM_SCAN_DELAY_MS = 800;

export const MicroTour: React.FC<MicroTourProps> = ({ routeKey, steps: stepDefs, onLearnMore }) => {
    const { t } = useLanguage();
    const { shouldShow, stepIndex, setStepIndex, runKey, markSeen, forceTrigger } = useMicroTour(routeKey);
    const { registerTrigger, unregisterTrigger } = useMicroTourContext();

    // MISSÃO 2 — activeSteps lives in state, populated AFTER DOM paint via setTimeout
    const [activeSteps, setActiveSteps] = useState<Step[]>([]);

    /* Register forceTrigger with the global context on mount */
    useEffect(() => {
        registerTrigger(routeKey, forceTrigger);
        return () => unregisterTrigger(routeKey);
    }, [routeKey, forceTrigger, registerTrigger, unregisterTrigger]);

    /* MISSÃO 2 — Async DOM scan: only runs AFTER shouldShow is true
     * and only after DOM_SCAN_DELAY_MS has elapsed.
     * This guarantees all child components have been committed to the DOM
     * by React before we call document.querySelector(). */
    useEffect(() => {
        if (!shouldShow) {
            // Reset steps when tour is hidden so next trigger rescans DOM
            setActiveSteps([]);
            return;
        }

        console.log(
            `[MicroTour:${routeKey}] shouldShow=true, scheduling DOM scan in ${DOM_SCAN_DELAY_MS}ms (runKey=${runKey})`,
        );

        const timer = setTimeout(() => {
            const steps = buildSteps(stepDefs, routeKey, t, onLearnMore, markSeen);
            if (steps.length === 0) {
                console.error(
                    `[MicroTour:${routeKey}] 0 valid steps after DOM scan — ` +
                    `all targets still missing. Tour will not show. Targets: ` +
                    stepDefs.map(d => d.target).join(', '),
                );
            }
            setActiveSteps(steps);
        }, DOM_SCAN_DELAY_MS);

        return () => clearTimeout(timer);
        // runKey is intentionally included: a new forceTrigger resets and rescans
    }, [shouldShow, runKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleEvent = useCallback((data: EventData) => {
        const { status, action, type, index } = data;
        console.log(
            `[MicroTour:${routeKey}] event type=${type} action=${action} status=${status} index=${index}`,
        );

        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            console.log(`[MicroTour:${routeKey}] Tour ended (${status}), marking seen`);
            markSeen();
            return;
        }

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            const next = index + (action === ACTIONS.PREV ? -1 : 1);
            console.log(`[MicroTour:${routeKey}] Step advance: ${index} → ${next}`);
            setStepIndex(next);
        }

        if (action === ACTIONS.CLOSE) {
            console.log(`[MicroTour:${routeKey}] Tour closed by user`);
            markSeen();
        }
    }, [routeKey, markSeen, setStepIndex]);

    /* Guard: nothing to render until async scan populates steps */
    if (!shouldShow || activeSteps.length === 0) return null;

    return (
        <Joyride
            key={runKey}           /* Force full Joyride remount on each new trigger */
            steps={activeSteps}
            run={true}             /* shouldShow is already guaranteed true at this point */
            stepIndex={stepIndex}
            continuous
            scrollToFirstStep
            disableScrolling={false}
            onEvent={handleEvent}
            locale={{
                back: t('onboarding.tourPrev'),
                close: t('onboarding.tourClose'),
                last: t('onboarding.tourFinish'),
                next: t('onboarding.tourNext'),
                skip: t('onboarding.tourSkip'),
                open: t('onboarding.tourOpen'),
            }}
            options={{
                primaryColor: '#8b5cf6',
                zIndex: 10000,
                arrowColor: '#1e293b',
                backgroundColor: '#1e293b',
                textColor: '#e2e8f0',
                overlayColor: 'rgba(0,0,0,0.60)',
                showProgress: true,
                overlayClickAction: 'close',
                blockTargetInteraction: false,
                disableBeacon: true, // MISSÃO 3 — global beacon disable
            }}
            styles={{
                tooltip: {
                    borderRadius: 14,
                    padding: '14px 18px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    maxWidth: 320,
                },
                tooltipContainer: { textAlign: 'left' },
                buttonPrimary: {
                    borderRadius: 8,
                    padding: '7px 18px',
                    fontWeight: 700,
                    fontSize: 12,
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                },
                buttonBack: { color: '#94a3b8', marginRight: 8, fontSize: 12 },
                buttonSkip: { color: '#64748b', fontSize: 11 },
                buttonClose: { color: '#94a3b8' },
                // MISSÃO 3 — hide beacon element entirely via CSS as belt-and-suspenders
                beacon: { display: 'none' } as React.CSSProperties,
                beaconInner: { display: 'none' } as React.CSSProperties,
                beaconOuter: { display: 'none' } as React.CSSProperties,
            }}
        />
    );
};
