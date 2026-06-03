import React, { useCallback, useMemo, useEffect } from 'react';
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
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export const MicroTour: React.FC<MicroTourProps> = ({ routeKey, steps: stepDefs, onLearnMore }) => {
    const { t } = useLanguage();
    const { shouldShow, stepIndex, setStepIndex, runKey, markSeen, forceTrigger } = useMicroTour(routeKey);
    const { registerTrigger, unregisterTrigger } = useMicroTourContext();

    /* Register this component's forceTrigger with the global context on mount */
    useEffect(() => {
        registerTrigger(routeKey, forceTrigger);
        return () => unregisterTrigger(routeKey);
    }, [routeKey, forceTrigger, registerTrigger, unregisterTrigger]);

    /* Filter out steps whose DOM target doesn't exist yet — prevents silent Joyride abort */
    const activeSteps: Step[] = useMemo(() => {
        const built: Step[] = stepDefs
            .filter(def => {
                const el = document.querySelector(def.target);
                if (!el) {
                    console.warn(`[MicroTour:${routeKey}] Target NOT FOUND in DOM, skipping step: ${def.target}`);
                }
                return !!el;
            })
            .map(def => ({
                target: def.target,
                placement: (def.placement || 'bottom') as Step['placement'],
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
            }));

        console.log(`[MicroTour:${routeKey}] Built ${built.length}/${stepDefs.length} steps (shouldShow=${shouldShow})`);
        return built;
    // Recompute when runKey changes (forced re-trigger) or shouldShow changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepDefs, t, onLearnMore, markSeen, routeKey, runKey, shouldShow]);

    const handleEvent = useCallback((data: EventData) => {
        const { status, action, type, index } = data;
        console.log(`[MicroTour:${routeKey}] event type=${type} action=${action} status=${status} index=${index}`);

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

    /* Guard: nothing to show */
    if (!shouldShow || activeSteps.length === 0) {
        if (shouldShow && activeSteps.length === 0) {
            console.error(`[MicroTour:${routeKey}] shouldShow=true but 0 valid steps — all targets missing from DOM!`);
        }
        return null;
    }

    return (
        <Joyride
            key={runKey}              /* Force full remount on each trigger */
            steps={activeSteps}
            run={shouldShow}
            stepIndex={stepIndex}
            continuous
            scrollToFirstStep
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
                blockTargetInteraction: true,
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
                beacon: { display: 'none' } as React.CSSProperties,
            }}
        />
    );
};
