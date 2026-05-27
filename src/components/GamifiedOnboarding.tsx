import React, { useState, useEffect, useCallback } from 'react';
import { Joyride, STATUS, Step, ACTIONS, EVENTS, EventData } from 'react-joyride';
import confetti from 'canvas-confetti';
import {
    Target, Layout, Move, FileText, Bot, QrCode,
    Trophy, X, ChevronUp, ChevronDown, Sparkles,
    CheckCircle2, Circle, Users, BarChart3, Wand2,
    Settings, Crosshair, DollarSign, FileSignature, MessageSquare,
    Package, PlayCircle,
} from 'lucide-react';
import { OnboardingMissions } from '@/hooks/useFirstVisit';

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

interface MissionItem {
    key: keyof OnboardingMissions;
    icon: React.ElementType;
    title: string;
    desc: string;
    xp: number;
}

/* ------------------------------------------------------------------ */
/*  Missions (inline strings — no t() to avoid key-leakage risk)       */
/* ------------------------------------------------------------------ */

const MISSIONS: MissionItem[] = [
    {
        key: 'addLead',
        icon: Target,
        title: 'Adicione seu 1º Lead',
        desc: 'Vá em Contatos e cadastre um novo lead ou cliente.',
        xp: 100,
    },
    {
        key: 'createBoard',
        icon: Layout,
        title: 'Crie um Board com IA',
        desc: 'Use a IA para gerar seu primeiro board estratégico de vendas.',
        xp: 150,
    },
    {
        key: 'moveCard',
        icon: Move,
        title: 'Mova um Card (Drag & Drop)',
        desc: 'Arraste um deal entre colunas do Kanban para avançar no funil.',
        xp: 100,
    },
    {
        key: 'createActivity',
        icon: FileText,
        title: 'Crie uma Atividade',
        desc: 'Registre uma tarefa, ligação ou reunião no painel de Atividades.',
        xp: 100,
    },
    {
        key: 'testAI',
        icon: Bot,
        title: 'Teste o AI Hub',
        desc: 'Converse com Precy, Jury ou o Assistente Amazô no AI Hub.',
        xp: 150,
    },
];

const TOTAL_XP = MISSIONS.reduce((sum, m) => sum + m.xp, 0);

/* ------------------------------------------------------------------ */
/*  Tour step content (inline — language: PT-BR default)               */
/* ------------------------------------------------------------------ */

const TOUR_STEPS: Step[] = [
    /* 0 — Welcome */
    {
        target: 'body',
        placement: 'center',
        content: (
            <div className="text-center py-2">
                <div className="text-5xl mb-3">🌊</div>
                <h3 className="text-xl font-bold mb-2 text-white">Bem-vindo ao Hub Digital!</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Seu ecossistema inteligente de vendas e gestão de clientes.
                    <br />Vamos fazer um tour rápido pelas principais ferramentas!
                </p>
            </div>
        ),
    },
    /* 1 — Dashboard */
    {
        target: '[data-tour="nav-dashboard"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={18} className="text-blue-400" />
                    <h3 className="font-bold text-white">Dashboard</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Sua central de inteligência. Aqui você vê:
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Pipeline total e deals ativos</li>
                    <li>Taxa de conversão e receita conquistada</li>
                    <li>Saúde da carteira (ativos, inativos, churn)</li>
                    <li>Funil de vendas visual</li>
                </ul>
            </div>
        ),
    },
    /* 2 — Contacts */
    {
        target: '[data-tour="nav-contacts"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-purple-400" />
                    <h3 className="font-bold text-white">Contatos & Leads</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Gerencie todos os seus contatos em um só lugar.
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Cadastre leads com nome, email, telefone e tags</li>
                    <li>Filtre por estágio: Lead → MQL → Prospect → Cliente</li>
                    <li>Converta contatos em deals no board diretamente</li>
                    <li>Visualize histórico de atividades por contato</li>
                </ul>
                <p className="text-xs text-amber-400 mt-2 font-medium">
                    💡 Sua 1ª missão: cadastre um contato agora!
                </p>
            </div>
        ),
    },
    /* 3 — Boards */
    {
        target: '[data-tour="nav-boards"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Layout size={18} className="text-emerald-400" />
                    <h3 className="font-bold text-white">Boards & Kanban</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Seu funil de vendas visual com drag & drop.
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li><strong className="text-white">IA:</strong> descreva seu negócio e a IA cria o board inteiro</li>
                    <li><strong className="text-white">Templates:</strong> Vendas, Onboarding, CS e muito mais</li>
                    <li><strong className="text-white">Cards:</strong> arraste entre colunas para avançar no funil</li>
                    <li><strong className="text-white">Detalhe do deal:</strong> histórico, valor, responsável e notas</li>
                </ul>
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                    💡 Cada coluna é uma etapa do seu processo de vendas!
                </p>
            </div>
        ),
    },
    /* 4 — Activities */
    {
        target: '[data-tour="nav-activities"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-orange-400" />
                    <h3 className="font-bold text-white">Atividades</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Nunca perca um compromisso com seus clientes.
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Registre ligações, reuniões, tarefas e notas</li>
                    <li>Vincule atividades a deals e contatos específicos</li>
                    <li>Marque como concluída com um clique</li>
                    <li>Feed cronológico de tudo que aconteceu</li>
                </ul>
            </div>
        ),
    },
    /* 5 — AI Hub */
    {
        target: '[data-tour="nav-ai"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Bot size={18} className="text-violet-400" />
                    <h3 className="font-bold text-white">AI Hub — Sua Equipe IA 🤖</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    Três agentes especializados trabalhando 24/7 por você:
                </p>
                <div className="space-y-2">
                    <div className="bg-white/5 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <DollarSign size={13} className="text-amber-400" />
                            <span className="text-xs font-bold text-amber-300">Precy — Precificação</span>
                        </div>
                        <p className="text-xs text-slate-400">Calcula preços justos para seus serviços com base em custo, mercado e margem. Nunca venda abaixo do valor!</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <FileSignature size={13} className="text-blue-400" />
                            <span className="text-xs font-bold text-blue-300">Jury — Contratos</span>
                        </div>
                        <p className="text-xs text-slate-400">Gera minutas de contratos personalizadas para seu negócio. Do escopo ao prazo, tudo estruturado.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <MessageSquare size={13} className="text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-300">Amazô — Diagnóstico & Assistente</span>
                        </div>
                        <p className="text-xs text-slate-400">Analisa seu CRM, sugere melhorias e responde perguntas sobre seu negócio. Sua IA consultora pessoal.</p>
                    </div>
                </div>
            </div>
        ),
    },
    /* 6 — Link d'Água (QR) */
    {
        target: '[data-tour="nav-qrdagua"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <QrCode size={18} className="text-cyan-400" />
                    <h3 className="font-bold text-white">Link d'Água — Cartão Digital</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Crie sua presença digital profissional em minutos.
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Cartão digital com foto, bio e links de contato</li>
                    <li>QR Code único e compartilhável</li>
                    <li>Links para WhatsApp, Instagram, site e PIX</li>
                    <li>Ideal para apresentações e networking</li>
                </ul>
                <p className="text-xs text-cyan-400 mt-2 font-medium">
                    💡 Compartilhe seu QR Code e receba contatos direto no CRM!
                </p>
            </div>
        ),
    },
    /* 7 — Prompt Lab */
    {
        target: '[data-tour="nav-promptlab"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Wand2 size={18} className="text-pink-400" />
                    <h3 className="font-bold text-white">Prompt Lab</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Sua oficina de engenharia de prompts.
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Transforme ideias em prompts profissionais e otimizados</li>
                    <li>Biblioteca de prompts salvos para reutilização</li>
                    <li>Ideal para criar conteúdo, scripts e automações</li>
                </ul>
            </div>
        ),
    },
    /* 8 — Decisions */
    {
        target: '[data-tour="nav-decisions"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Crosshair size={18} className="text-red-400" />
                    <h3 className="font-bold text-white">Central de Decisões</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    A IA analisa seu CRM e age proativamente.
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Detecta deals estagnados há mais de X dias</li>
                    <li>Sugere ações concretas para reativar oportunidades</li>
                    <li>Identifica contatos com risco de churn</li>
                    <li>Prioriza onde focar sua energia de vendas</li>
                </ul>
            </div>
        ),
    },
    /* 9 — Settings */
    {
        target: '[data-tour="nav-settings"]',
        placement: 'right',
        content: (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Settings size={18} className="text-slate-400" />
                    <h3 className="font-bold text-white">Configurações</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Personalize o Hub para o seu negócio.
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li><strong className="text-white">Geral:</strong> página inicial, moeda e idioma</li>
                    <li><strong className="text-white">Tags & Campos:</strong> personalize campos dos contatos</li>
                    <li><strong className="text-white">API Keys:</strong> configure sua chave Gemini para IA</li>
                    <li><strong className="text-white">Equipe:</strong> convide colaboradores (admin)</li>
                </ul>
            </div>
        ),
    },
    /* 10 — Mission widget / wrap-up */
    {
        target: 'body',
        placement: 'center',
        content: (
            <div className="text-center py-2">
                <Trophy size={48} className="mx-auto mb-3 text-amber-400" />
                <h3 className="text-xl font-bold mb-2 text-white">Tour concluído! 🎉</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    Agora você conhece o Hub. Complete as <strong className="text-violet-300">Missões</strong> no widget ao lado direito da tela para ganhar XP e dominar a plataforma!
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                    <span className="bg-violet-600/30 text-violet-300 px-2 py-1 rounded-full">🎯 Adicione um Lead</span>
                    <span className="bg-emerald-600/30 text-emerald-300 px-2 py-1 rounded-full">📋 Crie um Board</span>
                    <span className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded-full">🤖 Teste a IA</span>
                </div>
            </div>
        ),
    },
];

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
/*  Component                                                           */
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
    const [runTour, setRunTour] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [prevCompleted, setPrevCompleted] = useState(completedCount);

    // MISSION 3 FIX: Auto-start on first visit — check localStorage directly,
    // don't rely on isFirstVisit alone (which may be stale on first render).
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        const onboardingDone = localStorage.getItem('crm_onboarding_completed');

        if (!hasSeenTour && !onboardingDone) {
            // Delay slightly so DOM with data-tour elements is ready
            const timer = setTimeout(() => {
                setRunTour(true);
                setStepIndex(0);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []); // Empty deps: only run once on mount

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

    // Joyride callback — handles all tour events
    const handleJoyrideCallback = useCallback((data: EventData) => {
        const { status, action, type, index } = data;

        // Tour finished or skipped
        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            setRunTour(false);
            localStorage.setItem('hasSeenTour', 'true');
            if (status === STATUS.FINISHED) {
                // Open mission widget after tour finishes
                setTimeout(() => setIsWidgetOpen(true), 600);
            }
            return;
        }

        // Step navigation — keep stepIndex in sync
        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
            setStepIndex(nextIndex);
        }

        // Close button on a step
        if (action === ACTIONS.CLOSE) {
            setRunTour(false);
            localStorage.setItem('hasSeenTour', 'true');
        }
    }, []);

    const earnedXP = MISSIONS.reduce((sum, m) => sum + (missions[m.key] ? m.xp : 0), 0);
    const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;
    const showWidget = !allComplete || showCelebration;

    return (
        <>
            {/* ── Joyride Tour ─────────────────────────────────────── */}
            <Joyride
                steps={TOUR_STEPS}
                run={runTour}
                stepIndex={stepIndex}
                continuous
                scrollToFirstStep
                onEvent={handleJoyrideCallback}
                locale={{
                    back: '← Anterior',
                    close: 'Fechar',
                    last: 'Concluir Tour 🎉',
                    next: 'Próximo →',
                    skip: 'Pular tour',
                    open: 'Abrir tour',
                }}
                options={{
                    primaryColor: '#8b5cf6',
                    zIndex: 10000,
                    arrowColor: '#1e293b',
                    backgroundColor: '#1e293b',
                    textColor: '#e2e8f0',
                    overlayColor: 'rgba(0,0,0,0.68)',
                    showProgress: true,
                    buttons: ['back', 'close', 'primary', 'skip'],
                    overlayClickAction: 'close',
                    blockTargetInteraction: true,
                }}
                styles={{
                    tooltip: {
                        borderRadius: 16,
                        padding: '20px 24px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        maxWidth: 380,
                    },
                    tooltipContainer: { textAlign: 'left' },
                    tooltipTitle: { color: '#f1f5f9', fontWeight: 700, fontSize: 15 },
                    buttonPrimary: {
                        borderRadius: 10,
                        padding: '9px 22px',
                        fontWeight: 700,
                        fontSize: 13,
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    },
                    buttonBack: { color: '#94a3b8', marginRight: 10, fontSize: 13 },
                    buttonSkip: { color: '#64748b', fontSize: 12 },
                    buttonClose: { color: '#94a3b8' },
                    spotlight: {},
                    beacon: { display: 'none' }, // hide beacons — tour starts automatically
                }}
            />

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
                        <p className="text-white/80 text-lg mb-1">Todas as missões completas!</p>
                        <p className="text-amber-300 font-bold text-xl mb-5">+{earnedXP} XP conquistados</p>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20">
                            <Sparkles size={16} className="text-amber-300" />
                            Hub Master Badge desbloqueado!
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
                                        <h3 className="font-bold text-white text-sm">Missões de Onboarding</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsWidgetOpen(false)}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                </div>
                                <p className="text-white/65 text-xs">Complete as missões para dominar o Hub!</p>
                                {/* Progress bar */}
                                <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5 text-xs text-white/55">
                                    <span>{completedCount}/{totalMissions} missões</span>
                                    <span>{earnedXP}/{TOTAL_XP} XP</span>
                                </div>
                            </div>

                            {/* Mission List */}
                            <div className="p-3 space-y-2 max-h-[320px] overflow-y-auto">
                                {MISSIONS.map((mission) => {
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
                                                        {mission.title}
                                                    </h4>
                                                    {done
                                                        ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                                        : <Circle size={14} className="text-slate-600 flex-shrink-0" />
                                                    }
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{mission.desc}</p>
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

                            {/* Footer — restart tour */}
                            <div className="px-3 pb-3">
                                <button
                                    onClick={() => {
                                        setStepIndex(0);
                                        setRunTour(true);
                                        setIsWidgetOpen(false);
                                    }}
                                    className="w-full py-2 text-xs text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/10 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <PlayCircle size={13} />
                                    Rever o tour guiado
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Floating Button with Progress Ring */}
                    <button
                        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                        className="relative w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ml-auto"
                        aria-label="Missões de Onboarding"
                        title="Missões de Onboarding"
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
