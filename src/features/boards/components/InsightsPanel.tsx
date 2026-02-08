import React, { useState } from 'react';
import { Brain, DollarSign, Heart, Scale, Sparkles } from 'lucide-react';
import { PrecyAgent } from './Agents/PrecyAgent';
import { MazoAgent } from './Agents/MazoAgent';
import { JuryAgent } from './Agents/JuryAgent';
import { DealProvider } from '@/context/DealContext';

interface InsightsPanelProps {
    boardId: string;
    dealId?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ boardId, dealId }) => {
    const [activeAgent, setActiveAgent] = useState<'precy' | 'mazo' | 'jury' | null>(null);

    const agents = [
        {
            id: 'precy' as const,
            name: 'PRECY',
            role: 'Engenheira de Precificação',
            icon: DollarSign,
            color: 'from-green-600 to-emerald-500',
            borderColor: 'border-green-500',
            description: 'Calcula preço justo baseado em custo, horas e impacto. Inclui precificação social.',
        },
        {
            id: 'mazo' as const,
            name: 'MAZÔ',
            role: 'Customer Success Interno',
            icon: Heart,
            color: 'from-pink-600 to-rose-500',
            borderColor: 'border-pink-500',
            description: 'Focada em retenção, empatia e saúde do cliente. Previne churn proativamente.',
        },
        {
            id: 'jury' as const,
            name: 'JURY',
            role: 'Analista Legal',
            icon: Scale,
            color: 'from-purple-600 to-violet-500',
            borderColor: 'border-purple-500',
            description: 'Gera contratos usando templates da biblioteca. Garante compliance e segurança.',
        },
    ];

    return (
        <DealProvider>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl shadow-lg">
                        <Brain className="w-6 h-6 text-solimoes-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-display bg-gradient-to-r from-solimoes-400 to-solimoes-500 bg-clip-text text-transparent">
                            Squad de IA
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Agentes especializados para acelerar seu processo
                        </p>
                    </div>
                </div>

                {/* Agent Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agents.map((agent) => {
                        const Icon = agent.icon;
                        const isActive = activeAgent === agent.id;

                        return (
                            <button
                                key={agent.id}
                                onClick={() => setActiveAgent(isActive ? null : agent.id)}
                                className={`relative p-6 rounded-xl border-2 transition-all text-left ${isActive
                                    ? `${agent.borderColor} bg-white dark:bg-rionegro-900 shadow-xl scale-105`
                                    : 'border-slate-200 dark:border-rionegro-800 bg-white dark:bg-rionegro-900 hover:border-acai-900/50 hover:shadow-lg'
                                    }`}
                            >
                                {/* Icon */}
                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${agent.color} mb-4 shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Name & Role */}
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {agent.name}
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                    {agent.role}
                                </p>

                                {/* Description */}
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {agent.description}
                                </p>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute top-4 right-4">
                                        <Sparkles className="w-5 h-5 text-acai-900 dark:text-acai-400 animate-pulse" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Active Agent Panel */}
                {activeAgent && (
                    <div className="mt-6 bg-slate-50 dark:bg-rionegro-950 rounded-xl border border-slate-200 dark:border-rionegro-800 p-6 transition-all duration-300 ease-out">
                        {activeAgent === 'precy' && <PrecyAgent boardId={boardId} dealId={dealId} />}
                        {activeAgent === 'mazo' && <MazoAgent boardId={boardId} dealId={dealId} />}
                        {activeAgent === 'jury' && <JuryAgent boardId={boardId} dealId={dealId} />}
                    </div>
                )}
            </div>
        </DealProvider>
    );
};
