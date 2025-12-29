import React, { useState } from 'react';
import { Heart, TrendingUp, AlertTriangle, Sparkles, MessageCircle, Calendar } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface MazoAgentProps {
    boardId: string;
    dealId?: string;
}

interface HealthScore {
    score: number;
    status: 'healthy' | 'at-risk' | 'critical';
    factors: {
        engagement: number;
        satisfaction: number;
        usage: number;
        payment: number;
    };
    recommendations: string[];
}

export const MazoAgent: React.FC<MazoAgentProps> = ({ boardId, dealId }) => {
    const { addToast } = useToast();
    const [customerName, setCustomerName] = useState('');
    const [lastContact, setLastContact] = useState('');
    const [satisfaction, setSatisfaction] = useState(5);
    const [usageFrequency, setUsageFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'rarely'>('weekly');
    const [paymentStatus, setPaymentStatus] = useState<'current' | 'late' | 'overdue'>('current');
    const [healthScore, setHealthScore] = useState<HealthScore | null>(null);

    const calculateHealthScore = () => {
        // Calculate engagement score (based on last contact)
        const daysSinceContact = lastContact ? Math.floor((new Date().getTime() - new Date(lastContact).getTime()) / (1000 * 3600 * 24)) : 999;
        const engagementScore = daysSinceContact < 7 ? 100 : daysSinceContact < 14 ? 75 : daysSinceContact < 30 ? 50 : 25;

        // Calculate satisfaction score (1-10 scale to 0-100)
        const satisfactionScore = satisfaction * 10;

        // Calculate usage score
        const usageScores = {
            daily: 100,
            weekly: 75,
            monthly: 50,
            rarely: 25,
        };
        const usageScore = usageScores[usageFrequency];

        // Calculate payment score
        const paymentScores = {
            current: 100,
            late: 60,
            overdue: 20,
        };
        const paymentScore = paymentScores[paymentStatus];

        // Weighted average (engagement 25%, satisfaction 30%, usage 25%, payment 20%)
        const totalScore = Math.round(
            engagementScore * 0.25 +
            satisfactionScore * 0.30 +
            usageScore * 0.25 +
            paymentScore * 0.20
        );

        // Determine status
        let status: 'healthy' | 'at-risk' | 'critical';
        if (totalScore >= 75) status = 'healthy';
        else if (totalScore >= 50) status = 'at-risk';
        else status = 'critical';

        // Generate recommendations
        const recommendations: string[] = [];

        if (engagementScore < 75) {
            recommendations.push('📞 Agendar check-in semanal para aumentar engajamento');
        }
        if (satisfactionScore < 70) {
            recommendations.push('💬 Enviar pesquisa de satisfação e ouvir feedback');
        }
        if (usageScore < 75) {
            recommendations.push('📚 Oferecer treinamento ou tutorial personalizado');
        }
        if (paymentScore < 100) {
            recommendations.push('💰 Revisar condições de pagamento e oferecer facilidades');
        }
        if (status === 'healthy') {
            recommendations.push('⭐ Cliente saudável! Considere upsell ou pedir referência');
        }
        if (status === 'critical') {
            recommendations.push('🚨 URGENTE: Agendar reunião de retenção imediatamente');
        }

        const health: HealthScore = {
            score: totalScore,
            status,
            factors: {
                engagement: engagementScore,
                satisfaction: satisfactionScore,
                usage: usageScore,
                payment: paymentScore,
            },
            recommendations,
        };

        setHealthScore(health);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'from-green-600 to-emerald-500';
            case 'at-risk':
                return 'from-yellow-600 to-orange-500';
            case 'critical':
                return 'from-red-600 to-rose-500';
            default:
                return 'from-slate-600 to-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return '💚';
            case 'at-risk':
                return '⚠️';
            case 'critical':
                return '🚨';
            default:
                return '❓';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-pink-600" />
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Análise de Saúde do Cliente
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Focada em retenção, empatia e prevenção de churn
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Nome do Cliente
                    </label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Ex: João Silva"
                    />
                </div>

                {/* Last Contact */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Último Contato
                    </label>
                    <input
                        type="date"
                        value={lastContact}
                        onChange={(e) => setLastContact(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                </div>

                {/* Satisfaction */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Satisfação (1-10)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={satisfaction}
                            onChange={(e) => setSatisfaction(Number(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-2xl font-bold text-pink-600 w-12 text-center">
                            {satisfaction}
                        </span>
                    </div>
                </div>

                {/* Usage Frequency */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Frequência de Uso
                    </label>
                    <select
                        value={usageFrequency}
                        onChange={(e) => setUsageFrequency(e.target.value as any)}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                        <option value="rarely">Raramente</option>
                    </select>
                </div>

                {/* Payment Status */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Status de Pagamento
                    </label>
                    <div className="flex gap-3">
                        {[
                            { value: 'current', label: '✅ Em Dia', color: 'bg-green-100 text-green-700 border-green-300' },
                            { value: 'late', label: '⏰ Atrasado', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                            { value: 'overdue', label: '🚨 Inadimplente', color: 'bg-red-100 text-red-700 border-red-300' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setPaymentStatus(option.value as any)}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 font-semibold transition-all ${paymentStatus === option.value
                                        ? option.color
                                        : 'bg-white dark:bg-rionegro-900 text-slate-500 border-slate-300 dark:border-rionegro-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Analyze Button */}
            <button
                onClick={calculateHealthScore}
                disabled={!customerName}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <TrendingUp className="w-5 h-5" />
                Analisar Saúde do Cliente
            </button>

            {/* Results */}
            {healthScore && (
                <div className={`bg-gradient-to-br ${getStatusColor(healthScore.status)}/10 border-2 ${getStatusColor(healthScore.status).replace('from-', 'border-').replace(' to-emerald-500', '').replace(' to-orange-500', '').replace(' to-rose-500', '')} rounded-xl p-6 space-y-4 animate-fade-in`}>
                    {/* Health Score */}
                    <div className="text-center pb-4 border-b border-white/20">
                        <div className="text-6xl mb-2">{getStatusIcon(healthScore.status)}</div>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                            {healthScore.score}%
                        </div>
                        <div className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            {healthScore.status === 'healthy' && 'Cliente Saudável'}
                            {healthScore.status === 'at-risk' && 'Cliente em Risco'}
                            {healthScore.status === 'critical' && 'Risco Crítico de Churn'}
                        </div>
                    </div>

                    {/* Factors Breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Engajamento</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{healthScore.factors.engagement}%</div>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Satisfação</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{healthScore.factors.satisfaction}%</div>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Uso</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{healthScore.factors.usage}%</div>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Pagamento</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{healthScore.factors.payment}%</div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="pt-4 border-t border-white/20">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Ações Recomendadas
                        </h4>
                        <div className="space-y-2">
                            {healthScore.recommendations.map((rec, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 bg-white/50 dark:bg-black/20 rounded-lg p-3"
                                >
                                    <span className="text-lg">{rec.split(' ')[0]}</span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                                        {rec.substring(rec.indexOf(' ') + 1)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
