import React, { useState, useEffect, useCallback } from 'react';
import { Joyride, STATUS, Step, ACTIONS, EVENTS, EventData } from 'react-joyride';
import confetti from 'canvas-confetti';
import {
    Target, Layout, Move, FileText, Bot, QrCode,
    Trophy, X, ChevronUp, ChevronDown, Sparkles,
    CheckCircle2, Circle
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { OnboardingMissions } from '@/hooks/useFirstVisit';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GamifiedOnboardingProps {
    isFirstVisit: boolean;
    missions: OnboardingMissions;
    completeMission: (key: keyof OnboardingMissions) => void;
    completedCount: number;
    totalMissions: number;
    allComplete: boolean;
    completeOnboarding: () => void;
}

interface MissionItem {
    key: keyof OnboardingMissions;
    icon: React.ElementType;
    titleKey: string;
    descKey: string;
    xp: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MISSIONS: MissionItem[] = [
    { key: 'addLead', icon: Target, titleKey: 'onboarding.mission1Title', descKey: 'onboarding.mission1Desc', xp: 100 },
    { key: 'createBoard', icon: Layout, titleKey: 'onboarding.mission2Title', descKey: 'onboarding.mission2Desc', xp: 150 },
    { key: 'moveCard', icon: Move, titleKey: 'onboarding.mission3Title', descKey: 'onboarding.mission3Desc', xp: 100 },
    { key: 'createActivity', icon: FileText, titleKey: 'onboarding.mission4Title', descKey: 'onboarding.mission4Desc', xp: 100 },
    { key: 'testAI', icon: Bot, titleKey: 'onboarding.mission5Title', descKey: 'onboarding.mission5Desc', xp: 150 },
];

const TOTAL_XP = MISSIONS.reduce((sum, m) => sum + m.xp, 0);

/* ------------------------------------------------------------------ */
/*  Confetti helpers                                                   */
/* ------------------------------------------------------------------ */

const fireMissionConfetti = () => {
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.9, y: 0.9 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'],
    });
};

const fireAllCompleteConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#fbbf24', '#8b5cf6'] });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ec4899', '#06b6d4', '#f59e0b'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const GamifiedOnboarding: React.FC<GamifiedOnboardingProps> = ({
    isFirstVisit,
    missions,
    completeMission,
    completedCount,
    totalMissions,
    allComplete,
    completeOnboarding,
}) => {
    const { t } = useTranslation();
    const [runTour, setRunTour] = useState(false);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [prevCompleted, setPrevCompleted] = useState(completedCount);

    // Auto-start tour on first visit (after short delay for DOM readiness)
    useEffect(() => {
        if (isFirstVisit) {
            const hasSeenTour = localStorage.getItem('hasSeenTour');
            if (!hasSeenTour) {
                const timer = setTimeout(() => setRunTour(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [isFirstVisit]);

    // Detect mission completion → fire confetti
    useEffect(() => {
        if (completedCount > prevCompleted) {
            fireMissionConfetti();
            if (allComplete) {
                setTimeout(() => {
                    fireAllCompleteConfetti();
                    setShowCelebration(true);
                }, 500);
            }
        }
        setPrevCompleted(completedCount);
    }, [completedCount, prevCompleted, allComplete]);

    // Joyride steps — targeting data-tour attributes on sidebar
    const steps: Step[] = [
        {
            target: 'body',
            content: (
                <div className="text-center py-2">
                    <Sparkles className="mx-auto mb-3 text-amber-400" size={36} />
                    <h3 className="text-lg font-bold mb-1">{t('onboarding.tourStep1Title')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t('onboarding.tourStep1Desc')}</p>
                </div>
            ),
            placement: 'center' as const,
        },
        {
            target: '[data-tour="nav-contacts"]',
            content: (
                <div>
                    <h3 className="font-bold mb-1">{t('onboarding.tourStep2Title')}</h3>
                    <p className="text-sm">{t('onboarding.tourStep2Desc')}</p>
                </div>
            ),
        },
        {
            target: '[data-tour="nav-boards"]',
            content: (
                <div>
                    <h3 className="font-bold mb-1">{t('onboarding.tourStep3Title')}</h3>
                    <p className="text-sm">{t('onboarding.tourStep3Desc')}</p>
                </div>
            ),
        },
        {
            target: '[data-tour="nav-activities"]',
            content: (
                <div>
                    <h3 className="font-bold mb-1">{t('onboarding.tourStep4Title')}</h3>
                    <p className="text-sm">{t('onboarding.tourStep4Desc')}</p>
                </div>
            ),
        },
        {
            target: '[data-tour="nav-ai"]',
            content: (
                <div>
                    <h3 className="font-bold mb-1">{t('onboarding.tourStep5Title')}</h3>
                    <p className="text-sm">{t('onboarding.tourStep5Desc')}</p>
                </div>
            ),
        },
        {
            target: '[data-tour="nav-qrdagua"]',
            content: (
                <div>
                    <h3 className="font-bold mb-1">{t('onboarding.tourStep6Title')}</h3>
                    <p className="text-sm">{t('onboarding.tourStep6Desc')}</p>
                </div>
            ),
        },
    ];

    // Joyride callback
    const handleJoyrideCallback = useCallback((data: EventData) => {
        const { status, action, type } = data;
        const finished = ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status);
        if (finished) {
            setRunTour(false);
            localStorage.setItem('hasSeenTour', 'true');
            // Open the mission widget after tour completes
            if (status === STATUS.FINISHED) {
                setTimeout(() => setIsWidgetOpen(true), 500);
            }
        }
        // Handle close button
        if (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) {
            setRunTour(false);
            localStorage.setItem('hasSeenTour', 'true');
        }
    }, []);

    const earnedXP = MISSIONS.reduce((sum, m) => sum + (missions[m.key] ? m.xp : 0), 0);
    const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

    // Don't show widget if onboarding fully dismissed and all missions done
    const showWidget = !allComplete || showCelebration;

    return (
        <>
            {/* Joyride Tour */}
            <Joyride
                steps={steps}
                run={runTour}
                continuous
                showSkipButton
                showProgress
                scrollToFirstStep
                disableOverlayClose
                callback={handleJoyrideCallback}
                locale={{
                    back: t('previous'),
                    close: t('close'),
                    last: t('start'),
                    next: t('next'),
                    skip: t('skipTour'),
                }}
                styles={{
                    options: {
                        primaryColor: '#8b5cf6',
                        zIndex: 10000,
                        arrowColor: 'var(--joyride-bg, #1e293b)',
                        backgroundColor: 'var(--joyride-bg, #1e293b)',
                        textColor: 'var(--joyride-text, #e2e8f0)',
                    },
                    tooltip: {
                        borderRadius: 16,
                        padding: '20px 24px',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                    },
                    buttonNext: {
                        borderRadius: 10,
                        padding: '8px 20px',
                        fontWeight: 600,
                    },
                    buttonBack: {
                        color: '#94a3b8',
                        marginRight: 8,
                    },
                    buttonSkip: {
                        color: '#64748b',
                        fontSize: 13,
                    },
                    spotlight: {
                        borderRadius: 12,
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    },
                }}
            />

            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-10 text-center text-white max-w-md mx-4 shadow-2xl animate-bounce-in">
                        <button
                            onClick={() => { setShowCelebration(false); completeOnboarding(); }}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <Trophy className="mx-auto mb-4 text-amber-300" size={64} />
                        <h2 className="text-3xl font-bold mb-2">{t('onboarding.hubMaster')}</h2>
                        <p className="text-white/80 mb-4">{earnedXP} {t('onboarding.xpEarned')}</p>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                            <Sparkles size={16} className="text-amber-300" />
                            Hub Master Badge
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Mission Widget */}
            {showWidget && (
                <div className="fixed bottom-24 right-6 z-[9996]">
                    {/* Expanded Panel */}
                    {isWidgetOpen && (
                        <div className="mb-3 w-80 bg-slate-900/95 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-white text-sm">{t('onboarding.missionTitle')}</h3>
                                    <button onClick={() => setIsWidgetOpen(false)} className="text-white/70 hover:text-white">
                                        <ChevronDown size={18} />
                                    </button>
                                </div>
                                <p className="text-white/70 text-xs">{t('onboarding.missionSubtitle')}</p>

                                {/* Progress bar */}
                                <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5 text-xs text-white/60">
                                    <span>{completedCount}/{totalMissions} {t('onboarding.progress')}</span>
                                    <span>{earnedXP}/{TOTAL_XP} XP</span>
                                </div>
                            </div>

                            {/* Mission List */}
                            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
                                {MISSIONS.map((mission) => {
                                    const done = missions[mission.key];
                                    const Icon = mission.icon;
                                    return (
                                        <div
                                            key={mission.key}
                                            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                                                done
                                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                    : 'bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30'
                                            }`}
                                        >
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                done ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                                            }`}>
                                                <Icon size={18} className={done ? 'text-emerald-400' : 'text-violet-400'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-sm font-semibold ${done ? 'text-emerald-300 line-through' : 'text-white'}`}>
                                                        {t(mission.titleKey)}
                                                    </h4>
                                                    {done ? (
                                                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                                    ) : (
                                                        <Circle size={14} className="text-slate-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">{t(mission.descKey)}</p>
                                                <span className={`text-xs font-medium mt-1 inline-block ${
                                                    done ? 'text-emerald-400' : 'text-violet-400'
                                                }`}>
                                                    {done ? `+${mission.xp} XP ✓` : `+${mission.xp} XP`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Floating Button with Progress Ring */}
                    <button
                        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                        className="relative w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group ml-auto"
                        aria-label={t('onboarding.missionTitle')}
                    >
                        {/* SVG Progress Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="25" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                            <circle
                                cx="28" cy="28" r="25" fill="none"
                                stroke="#34d399" strokeWidth="3"
                                strokeDasharray={`${(progressPercent / 100) * 157} 157`}
                                strokeLinecap="round"
                                className="transition-all duration-700"
                            />
                        </svg>
                        {allComplete ? (
                            <Trophy size={22} className="text-amber-300 relative z-10" />
                        ) : (
                            <span className="text-white font-bold text-sm relative z-10">
                                {completedCount}/{totalMissions}
                            </span>
                        )}
                        {isWidgetOpen ? (
                            <ChevronDown size={14} className="absolute -top-1 -right-1 text-white bg-violet-500 rounded-full p-0.5" />
                        ) : (
                            <ChevronUp size={14} className="absolute -top-1 -right-1 text-white bg-violet-500 rounded-full p-0.5" />
                        )}
                    </button>
                </div>
            )}

            {/* Scoped animation styles */}
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(16px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
                @keyframes bounce-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
                :root {
                    --joyride-bg: #1e293b;
                    --joyride-text: #e2e8f0;
                }
            `}</style>
        </>
    );
};
