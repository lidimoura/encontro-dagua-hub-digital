import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
    Target, Layout, Move, FileText, Bot,
    Trophy, X, ChevronUp, ChevronDown, Sparkles,
    CheckCircle2, Circle, PlayCircle,
} from 'lucide-react';
import { OnboardingMissions } from '@/hooks/useFirstVisit';
import { useLanguage } from '@/context/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
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

interface MissionDef {
    key: keyof OnboardingMissions;
    icon: React.ElementType;
    titleKey: string;
    descKey: string;
    xp: number;
}

/* ------------------------------------------------------------------ */
/*  Mission definitions (keys resolved at render via t())              */
/* ------------------------------------------------------------------ */

const MISSION_DEFS: MissionDef[] = [
    { key: 'addLead',        icon: Target,   titleKey: 'onboarding.mission1Title', descKey: 'onboarding.mission1Desc', xp: 100 },
    { key: 'createBoard',    icon: Layout,   titleKey: 'onboarding.mission2Title', descKey: 'onboarding.mission2Desc', xp: 150 },
    { key: 'moveCard',       icon: Move,     titleKey: 'onboarding.mission3Title', descKey: 'onboarding.mission3Desc', xp: 100 },
    { key: 'createActivity', icon: FileText, titleKey: 'onboarding.mission4Title', descKey: 'onboarding.mission4Desc', xp: 100 },
    { key: 'testAI',         icon: Bot,      titleKey: 'onboarding.mission5Title', descKey: 'onboarding.mission5Desc', xp: 150 },
];

const TOTAL_XP = MISSION_DEFS.reduce((sum, m) => sum + m.xp, 0);

/* ------------------------------------------------------------------ */
/*  Confetti helpers                                                    */
/* ------------------------------------------------------------------ */

const fireMissionConfetti = () => {
    confetti({
        particleCount: 90,
        spread: 65,
        origin: { x: 0.9, y: 0.85 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'],
    });
};

const fireAllCompleteConfetti = () => {
    const duration = 3500;
    const end = Date.now() + duration;
    const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#fbbf24', '#8b5cf6'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ec4899', '#06b6d4', '#f59e0b'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
};

/* ------------------------------------------------------------------ */
/*  Component — Mission Widget ONLY (no global tour)                    */
/*  Micro-tours are now handled per-route by MicroTour component       */
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
    const { t } = useLanguage();

    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [prevCompleted, setPrevCompleted] = useState(completedCount);

    // Auto-open widget on first visit after a delay
    useEffect(() => {
        const hasSeenWidget = localStorage.getItem('hasSeenMissionWidget');
        if (!hasSeenWidget && isFirstVisit) {
            const timer = setTimeout(() => {
                setIsWidgetOpen(true);
                localStorage.setItem('hasSeenMissionWidget', 'true');
            }, 2000);
            return () => clearTimeout(timer);
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
                }, 600);
            }
        }
        setPrevCompleted(completedCount);
    }, [completedCount, prevCompleted, allComplete]);

    const earnedXP = MISSION_DEFS.reduce((sum, m) => sum + (missions[m.key] ? m.xp : 0), 0);
    const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;
    const showWidget = !allComplete || showCelebration;

    return (
        <>
            {/* ── Celebration Overlay ───────────────────────────────── */}
            {showCelebration && (
                <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/75 backdrop-blur-sm">
                    <div className="relative bg-gradient-to-br from-violet-700 to-purple-800 rounded-3xl p-10 text-center text-white max-w-md mx-4 shadow-2xl border border-violet-500/40 animate-bounce-in">
                        <button
                            onClick={() => { setShowCelebration(false); completeOnboarding(); }}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <Trophy size={64} className="mx-auto mb-4 text-amber-300" />
                        <h2 className="text-3xl font-bold mb-2">Hub Master! 🏆</h2>
                        <p className="text-white/80 text-lg mb-1">{t('onboarding.hubMaster')}</p>
                        <p className="text-amber-300 font-bold text-xl mb-5">+{earnedXP} {t('onboarding.xpEarned')}</p>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20">
                            <Sparkles size={16} className="text-amber-300" />
                            Hub Master Badge
                        </div>
                    </div>
                </div>
            )}

            {/* ── Floating Mission Widget ───────────────────────────── */}
            {showWidget && (
                <div className="fixed bottom-24 right-6 z-[9996]">
                    {/* Expanded Panel */}
                    {isWidgetOpen && (
                        <div className="mb-3 w-80 bg-slate-900/98 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Trophy size={16} className="text-amber-300" />
                                        <h3 className="font-bold text-white text-sm">{t('onboarding.missionTitle')}</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsWidgetOpen(false)}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                </div>
                                <p className="text-white/65 text-xs">{t('onboarding.missionSubtitle')}</p>
                                <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5 text-xs text-white/55">
                                    <span>{completedCount}/{totalMissions}</span>
                                    <span>{earnedXP}/{TOTAL_XP} XP</span>
                                </div>
                            </div>

                            {/* Mission List */}
                            <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
                                {MISSION_DEFS.map((mission) => {
                                    const done = missions[mission.key];
                                    const Icon = mission.icon;
                                    return (
                                        <div
                                            key={mission.key}
                                            className={`flex items-start gap-3 p-3 rounded-xl transition-all border ${
                                                done
                                                    ? 'bg-emerald-500/10 border-emerald-500/25'
                                                    : 'bg-slate-800/60 border-slate-700/60 hover:border-violet-500/40'
                                            }`}
                                        >
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                done ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                                            }`}>
                                                <Icon size={18} className={done ? 'text-emerald-400' : 'text-violet-400'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-sm font-semibold ${done ? 'text-emerald-300 line-through opacity-75' : 'text-white'}`}>
                                                        {t(mission.titleKey)}
                                                    </h4>
                                                    {done
                                                        ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                                        : <Circle size={14} className="text-slate-600 flex-shrink-0" />
                                                    }
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">{t(mission.descKey)}</p>
                                                <span className={`text-xs font-semibold mt-1 inline-block ${
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
                        className="relative w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ml-auto"
                        aria-label={t('onboarding.missionTitle')}
                        title={t('onboarding.missionTitle')}
                    >
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
                        <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-white bg-violet-500 transition-transform ${isWidgetOpen ? 'rotate-180' : ''}`}>
                            <ChevronUp size={12} />
                        </span>
                    </button>
                </div>
            )}

            {/* ── Scoped animation styles ───────────────────────────── */}
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(18px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }

                @keyframes bounce-in {
                    0%   { transform: scale(0.6); opacity: 0; }
                    60%  { transform: scale(1.06); }
                    100% { transform: scale(1);   opacity: 1; }
                }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(.175,.885,.32,1.275); }
            `}</style>
        </>
    );
};
