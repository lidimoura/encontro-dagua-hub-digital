import React, { useCallback, useEffect, useState } from 'react';
import { Joyride, STATUS, ACTIONS, type CallBackProps, type Step } from 'react-joyride';
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
 * disableBeacon: true is set per-step — this is the ONLY correct way
 * to prevent the beacon in react-joyride (options.disableBeacon is NOT valid).
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
            console.warn(`[MicroTour:${routeKey}] target absent from DOM: ${def.target}`);
            continue;
        }
        built.push({
            target: def.target,
            placement: (def.placement || 'bottom') as Step['placement'],
            // ✅ ROOT FIX: disableBeacon per-step is the ONLY valid API for this
            disableBeacon: true,
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

    console.log(`[MicroTour:${routeKey}] DOM scan: ${built.length}/${stepDefs.length} targets present`);
    return built;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/** Delay in ms before we scan the DOM for tour targets. */
const DOM_SCAN_DELAY_MS = 900;

export const MicroTour: React.FC<MicroTourProps> = ({ routeKey, steps: stepDefs, onLearnMore }) => {
    const { t } = useLanguage();
    // ✅ ROOT FIX: Do NOT destructure stepIndex/setStepIndex — use UNCONTROLLED mode
    const { shouldShow, runKey, markSeen, forceTrigger } = useMicroTour(routeKey);
    const { registerTrigger, unregisterTrigger, consumePendingRequest } = useMicroTourContext();

    const [activeSteps, setActiveSteps] = useState<Step[]>([]);

    /* Register forceTrigger with the global context on mount.
     * Also consume any pending request that was queued before this component mounted
     * (e.g. user clicked "Run tour" in AiflowSupport before navigation completed). */
    useEffect(() => {
        registerTrigger(routeKey, forceTrigger);
        // Check if AiflowSupport already requested a tour for this route
        // while navigation was in progress
        if (consumePendingRequest(routeKey)) {
            console.log(`[MicroTour:${routeKey}] Consuming pending tour request on mount`);
            setTimeout(() => forceTrigger(), 150);
        }
        return () => unregisterTrigger(routeKey);
    }, [routeKey, forceTrigger, registerTrigger, unregisterTrigger, consumePendingRequest]);

    /* Async DOM scan — only runs when shouldShow becomes true.
     * runKey change means a new forceTrigger was called → rescan. */
    useEffect(() => {
        if (!shouldShow) {
            setActiveSteps([]);
            return;
        }

        console.log(`[MicroTour:${routeKey}] shouldShow=true, scanning DOM in ${DOM_SCAN_DELAY_MS}ms (runKey=${runKey})`);

        const timer = setTimeout(() => {
            const steps = buildSteps(stepDefs, routeKey, t, onLearnMore, markSeen);
            if (steps.length === 0) {
                console.error(
                    `[MicroTour:${routeKey}] 0 valid steps after DOM scan. Targets: ` +
                    stepDefs.map(d => d.target).join(', '),
                );
            }
            setActiveSteps(steps);
        }, DOM_SCAN_DELAY_MS);

        return () => clearTimeout(timer);
    }, [shouldShow, runKey]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ✅ ROOT FIX: Use `callback` (not `onEvent`) and UNCONTROLLED mode.
     * Do NOT pass stepIndex prop. Let Joyride manage its own internal state.
     * This is what makes disableBeacon actually skip the beacon and show the tooltip. */
    const handleCallback = useCallback((data: CallBackProps) => {
        const { status, action, type } = data;
        console.log(`[MicroTour:${routeKey}] cb type=${type} action=${action} status=${status}`);

        // Tour finished or skipped — mark as seen
        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            console.log(`[MicroTour:${routeKey}] Tour ended (${status}), marking seen`);
            markSeen();
        }

        // User pressed X / close
        if (action === ACTIONS.CLOSE) {
            console.log(`[MicroTour:${routeKey}] Tour closed by user`);
            markSeen();
        }
    }, [routeKey, markSeen]);

    /* Guard: nothing to render until async scan populates steps */
    if (!shouldShow || activeSteps.length === 0) return null;

    return (
        <Joyride
            key={runKey}           /* Force full Joyride remount on each new trigger */
            steps={activeSteps}
            run={true}
            /* ✅ ROOT FIX: NO stepIndex prop — uncontrolled mode.
             * In controlled mode (stepIndex passed in), Joyride emits beacon events
             * waiting for external stepIndex advances, which blocks tooltip display.
             * In uncontrolled mode, disableBeacon:true on each step works correctly. */
            continuous={true}
            showSkipButton={true}
            disableOverlayClose={false}
            spotlightClicks={true}
            scrollToFirstStep
            disableScrolling={false}
            callback={handleCallback}
            locale={{
                back: t('onboarding.tourPrev'),
                close: t('onboarding.tourClose'),
                last: t('onboarding.tourFinish'),
                next: t('onboarding.tourNext'),
                skip: t('onboarding.tourSkip'),
                open: t('onboarding.tourOpen'),
            }}
            floaterProps={{
                // ✅ Ensure tooltip appears immediately without any beacon animation
                disableAnimation: false,
            }}
            styles={{
                options: {
                    primaryColor: '#8b5cf6',
                    zIndex: 10000,
                    arrowColor: '#1e293b',
                    backgroundColor: '#1e293b',
                    textColor: '#e2e8f0',
                    overlayColor: 'rgba(0,0,0,0.60)',
                },
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
                // Belt-and-suspenders: hide any beacon that might slip through
                beacon: { display: 'none' } as React.CSSProperties,
                beaconInner: { display: 'none' } as React.CSSProperties,
                beaconOuter: { display: 'none' } as React.CSSProperties,
            }}
        />
    );
};
