import React, { useState } from 'react';
import { DollarSign, Calculator, TrendingUp, AlertCircle, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface PrecyAgentProps {
    boardId: string;
    dealId?: string;
}

interface PricingCalculation {
    stackCost: number;
    hours: number;
    hourlyRate: number;
    laborCost: number;
    totalCost: number;
    margin: number;
    basePrice: number;
    socialDiscount: number;
    socialPrice: number;
    impact: 'low' | 'medium' | 'high';
    impactMultiplier: number;
    finalPrice: number;
}

export const PrecyAgent: React.FC<PrecyAgentProps> = ({ boardId, dealId }) => {
    const { addToast } = useToast();
    const [stackCost, setStackCost] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [impact, setImpact] = useState<'low' | 'medium' | 'high'>('medium');
    const [isSocialPricing, setIsSocialPricing] = useState(false);
    const [calculation, setCalculation] = useState<PricingCalculation | null>(null);
    const [copied, setCopied] = useState(false);

    const HOURLY_RATE = 50; // R$ 50/hora
    const MARGIN = 0.35; // 35% margin
    const SOCIAL_DISCOUNT = 0.60; // 60% discount for social pricing

    const impactMultipliers = {
        low: 1.0,
        medium: 1.2,
        high: 1.5,
    };

    const calculatePrice = () => {
        const laborCost = hours * HOURLY_RATE;
        const totalCost = stackCost + laborCost;
        const basePrice = totalCost * (1 + MARGIN);
        const impactMultiplier = impactMultipliers[impact];
        const finalPrice = basePrice * impactMultiplier;
        const socialPrice = finalPrice * (1 - SOCIAL_DISCOUNT);

        const calc: PricingCalculation = {
            stackCost,
            hours,
            hourlyRate: HOURLY_RATE,
            laborCost,
            totalCost,
            margin: MARGIN,
            basePrice,
            socialDiscount: SOCIAL_DISCOUNT,
            socialPrice,
            impact,
            impactMultiplier,
            finalPrice: isSocialPricing ? socialPrice : finalPrice,
        };

        setCalculation(calc);
    };

    const copyToClipboard = () => {
        if (!calculation) return;

        const text = `
💰 PROPOSTA COMERCIAL - PRECY

📊 CÁLCULO DE PRECIFICAÇÃO:
• Custo Stack: R$ ${calculation.stackCost.toFixed(2)}
• Horas Estimadas: ${calculation.hours}h × R$ ${calculation.hourlyRate}/h = R$ ${calculation.laborCost.toFixed(2)}
• Custo Total: R$ ${calculation.totalCost.toFixed(2)}
• Margem: ${(calculation.margin * 100)}%
• Preço Base: R$ ${calculation.basePrice.toFixed(2)}

🎯 IMPACTO: ${impact.toUpperCase()}
• Multiplicador: ${calculation.impactMultiplier}x

${isSocialPricing ? `
🤝 PRECIFICAÇÃO SOCIAL (${(calculation.socialDiscount * 100)}% desconto):
• Preço Social: R$ ${calculation.socialPrice.toFixed(2)}
` : ''}

💵 PREÇO FINAL: R$ ${calculation.finalPrice.toFixed(2)}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast('Proposta copiada!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Calculadora de Precificação Inteligente
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Fórmula: (Custo Stack + Horas × R$ 50) × (1 + 35%) × Impacto
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stack Cost */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Custo do Stack (R$)
                    </label>
                    <input
                        type="number"
                        value={stackCost}
                        onChange={(e) => setStackCost(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: 150"
                        min="0"
                        step="10"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Custo mensal de ferramentas (Supabase, Vercel, etc)
                    </p>
                </div>

                {/* Hours */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Horas Estimadas
                    </label>
                    <input
                        type="number"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: 40"
                        min="0"
                        step="1"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Horas de trabalho necessárias (R$ 50/h)
                    </p>
                </div>

                {/* Impact Level */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Nível de Impacto
                    </label>
                    <select
                        value={impact}
                        onChange={(e) => setImpact(e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="low">Baixo (1.0x) - Manutenção/Ajustes</option>
                        <option value="medium">Médio (1.2x) - Feature Nova</option>
                        <option value="high">Alto (1.5x) - Transformação Digital</option>
                    </select>
                </div>

                {/* Social Pricing Toggle */}
                <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSocialPricing}
                            onChange={(e) => setIsSocialPricing(e.target.checked)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Precificação Social (-60%)
                        </span>
                    </label>
                    <div className="group relative">
                        <AlertCircle className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                            Para ONGs, grupos prioritários e impacto social
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculate Button */}
            <button
                onClick={calculatePrice}
                disabled={stackCost === 0 && hours === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Calculator className="w-5 h-5" />
                Calcular Preço Justo
            </button>

            {/* Results */}
            {calculation && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 space-y-4 animate-fade-in">
                    {/* Breakdown */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Breakdown de Custos
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-slate-600 dark:text-slate-400">Custo Stack:</div>
                            <div className="font-mono font-semibold text-slate-900 dark:text-white">
                                R$ {calculation.stackCost.toFixed(2)}
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">Mão de Obra:</div>
                            <div className="font-mono font-semibold text-slate-900 dark:text-white">
                                R$ {calculation.laborCost.toFixed(2)} ({calculation.hours}h × R$ {calculation.hourlyRate})
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">Custo Total:</div>
                            <div className="font-mono font-semibold text-slate-900 dark:text-white">
                                R$ {calculation.totalCost.toFixed(2)}
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">Margem (35%):</div>
                            <div className="font-mono font-semibold text-green-600">
                                + R$ {(calculation.basePrice - calculation.totalCost).toFixed(2)}
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">Impacto ({impact}):</div>
                            <div className="font-mono font-semibold text-blue-600">
                                × {calculation.impactMultiplier}x
                            </div>

                            {isSocialPricing && (
                                <>
                                    <div className="text-slate-600 dark:text-slate-400">Desconto Social:</div>
                                    <div className="font-mono font-semibold text-pink-600">
                                        - {(calculation.socialDiscount * 100)}%
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Final Price */}
                    <div className="pt-4 border-t border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                💵 Preço Final:
                            </span>
                            <span className="text-3xl font-bold font-mono text-green-600">
                                R$ {calculation.finalPrice.toFixed(2)}
                            </span>
                        </div>
                        {isSocialPricing && (
                            <p className="text-xs text-pink-600 dark:text-pink-400 mt-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Precificação Social aplicada - Impacto garantido!
                            </p>
                        )}
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={copyToClipboard}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-center gap-2"
                    >
                        {copied ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copiar Proposta
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
