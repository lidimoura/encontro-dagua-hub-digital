import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, TrendingUp, AlertCircle, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency, formatPercentage } from '@/services/ai/bilingualService';
import { useDealContext } from '@/context/DealContext';
import { useAuth } from '@/context/AuthContext';
import { Package, Loader2 } from 'lucide-react';

interface PrecyAgentProps {
    boardId: string;
    dealId?: string;
}

interface TechStackItem {
    id: string;
    name: string;
    price: number;
    stack_category: string | null;
    metadata: any;
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
    const { t } = useTranslation();

    // Tech Stack
    const [techStackItems, setTechStackItems] = useState<TechStackItem[]>([]);
    const [selectedStackIds, setSelectedStackIds] = useState<string[]>([]);
    const [loadingStack, setLoadingStack] = useState(true);

    // Editable parameters
    const [hourlyRate, setHourlyRate] = useState<number>(50);
    const [margin, setMargin] = useState<number>(0.35);

    const [stackCost, setStackCost] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [impact, setImpact] = useState<'low' | 'medium' | 'high'>('medium');
    const [isSocialPricing, setIsSocialPricing] = useState(false);
    const [calculation, setCalculation] = useState<PricingCalculation | null>(null);
    const [copied, setCopied] = useState(false);
    const { language } = useLanguage();
    const dealContext = useDealContext();
    const { profile } = useAuth();
    const [currency, setCurrency] = useState('BRL');

    // Quote-to-Product
    const [productName, setProductName] = useState('');
    const [savingProduct, setSavingProduct] = useState(false);

    const SOCIAL_DISCOUNT = 0.60; // 60% discount for social pricing

    const impactMultipliers = {
        low: 1.0,
        medium: 1.2,
        high: 1.5,
    };

    // Fetch tech stack from products table
    useEffect(() => {
        fetchTechStack();
    }, []);

    // Calculate stack cost when selection changes
    useEffect(() => {
        const totalStackCost = techStackItems
            .filter(item => selectedStackIds.includes(item.id))
            .reduce((sum, item) => sum + item.price, 0);
        setStackCost(totalStackCost);
    }, [selectedStackIds, techStackItems]);

    const fetchTechStack = async () => {
        setLoadingStack(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, price, stack_category, metadata')
                .eq('product_type', 'tech_stack')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setTechStackItems(data || []);
        } catch (error: any) {
            console.error('Error fetching tech stack:', error);
            addToast(t('errorLoadingPrompts'), 'error');
        } finally {
            setLoadingStack(false);
        }
    };

    const calculatePrice = () => {
        const laborCost = hours * hourlyRate;
        const totalCost = stackCost + laborCost;
        const basePrice = totalCost * (1 + margin);
        const impactMultiplier = impactMultipliers[impact];
        const finalPrice = basePrice * impactMultiplier;
        const socialPrice = finalPrice * (1 - SOCIAL_DISCOUNT);

        const calc: PricingCalculation = {
            stackCost,
            hours,
            hourlyRate,
            laborCost,
            totalCost,
            margin,
            basePrice,
            socialDiscount: SOCIAL_DISCOUNT,
            socialPrice,
            impact,
            impactMultiplier,
            finalPrice: isSocialPricing ? socialPrice : finalPrice,
        };

        setCalculation(calc);
    };

    const calculateROI = () => {
        if (!calculation) return null;

        const revenue = calculation.finalPrice;
        const cost = calculation.totalCost;

        if (cost === 0) return null;

        // ROI Formula: ((Revenue - Cost) / Cost) * 100
        const roi = ((revenue - cost) / cost) * 100;

        return {
            investment: cost,
            return: revenue - cost,
            percentage: roi
        };
    };

    // FIXED: Added missing handler to prevent crash
    const handleSaveProduct = () => {
        setSavingProduct(true);
        // Simulate API call
        setTimeout(() => {
            setSavingProduct(false);
            addToast(t('featureInDev'), 'info');
        }, 1000);
    };

    const handleExportPdf = () => {
        addToast(t('featureInDev'), 'info');
    };

    const handleConnect = () => {
        addToast(t('featureInDev'), 'info');
    };

    const copyToClipboard = () => {
        if (!calculation) return;

        const text = `
💰 ${t('commercialProposal')} - PRECY

📊 ${t('pricingCalculation')}:
• ${t('stackCost')}: ${formatCurrency(calculation.stackCost, language, currency)}
• ${t('estimatedHours')}: ${calculation.hours}h × ${formatCurrency(calculation.hourlyRate, language, currency)}/h = ${formatCurrency(calculation.laborCost, language, currency)}
• ${t('totalCost')}: ${formatCurrency(calculation.totalCost, language, currency)}
• ${t('profitMarginLabel')}: ${(calculation.margin * 100)}%
• ${t('basePrice')}: ${formatCurrency(calculation.basePrice, language, currency)}

🎯 ${t('impact')}: ${impact.toUpperCase()}
• Multiplicador: ${calculation.impactMultiplier}x

${isSocialPricing ? `
🤝 ${t('socialPricing')} (${(calculation.socialDiscount * 100)}% desconto):
• Preço Social: ${formatCurrency(calculation.socialPrice, language, currency)}
` : ''}

💵 ${t('finalPrice')}: ${formatCurrency(calculation.finalPrice, language, currency)}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        addToast(t('promptCopied'), 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t('smartPricingCalc')}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t('pricingFormula')}
                        </p>
                    </div>
                </div>

                {/* Currency Selector */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
                    {['BRL', 'USD', 'EUR', 'AUD'].map((c) => (
                        <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${currency === c
                                ? 'bg-green-600 text-white shadow'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editable Parameters */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                    {t('editableParams')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('hourlyRateLabel')}
                        </label>
                        <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="5"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('profitMarginLabel')}
                        </label>
                        <input
                            type="number"
                            value={margin * 100}
                            onChange={(e) => setMargin(Number(e.target.value) / 100)}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                            step="5"
                        />
                    </div>
                </div>
            </div>

            {/* Tech Stack Selector */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t('projectTools')}
                </label>
                {loadingStack ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-xs text-slate-500 mt-2">{t('loadingStack')}</p>
                    </div>
                ) : techStackItems.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {t('noToolsRegistered')}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                            {t('addToolsHint')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900">
                        {techStackItems.map((item) => (
                            <label
                                key={item.id}
                                className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedStackIds.includes(item.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedStackIds([...selectedStackIds, item.id]);
                                        } else {
                                            setSelectedStackIds(selectedStackIds.filter(id => id !== item.id));
                                        }
                                    }}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {item.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatCurrency(item.price, language, currency)}/mês
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {language === 'en' ? 'Total selected cost: ' : 'Custo total selecionado: '} <span className="font-mono font-semibold text-green-600">{formatCurrency(stackCost, language, currency)}</span>
                </p>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hours */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {language === 'en' ? 'Estimated Hours' : 'Horas Estimadas'}
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
                        {language === 'en'
                            ? `Required work hours (${formatCurrency(hourlyRate, language, currency)}/h)`
                            : `Horas de trabalho necessárias (${formatCurrency(hourlyRate, language, currency)}/h)`}
                    </p>
                </div>

                {/* Impact Level */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        {language === 'en' ? 'Impact Level (ROI)' : 'Nível de Impacto (ROI)'}
                        <div className="group relative">
                            <AlertCircle className="w-4 h-4 text-blue-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                                <div className="space-y-2">
                                    <div>
                                        <strong className="text-green-400">🟢 {language === 'en' ? 'Low' : 'Baixo'} (1.0x):</strong> {language === 'en' ? 'Maintenance/Adjustments. Cost price + standard margin.' : 'Manutenções e ajustes. Preço de custo + margem padrão.'}
                                    </div>
                                    <div>
                                        <strong className="text-yellow-400">🟡 {language === 'en' ? 'Medium' : 'Médio'} (1.2x):</strong> {language === 'en' ? 'New features adding significant value. +20% premium.' : 'Features novas que agregam valor significativo. +20% premium.'}
                                    </div>
                                    <div>
                                        <strong className="text-red-400">🔴 {language === 'en' ? 'High' : 'Alto'} (1.5x):</strong> {language === 'en' ? 'Digital transformation & strategic impact. +50% premium via ROI.' : 'Transformação digital e impacto estratégico. +50% premium justificado pelo ROI.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>
                    <select
                        value={impact}
                        onChange={(e) => setImpact(e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="low">{language === 'en' ? 'Low (1.0x) - Maintenance/Adjustments' : 'Baixo (1.0x) - Manutenção/Ajustes'}</option>
                        <option value="medium">{language === 'en' ? 'Medium (1.2x) - New Feature' : 'Médio (1.2x) - Feature Nova'}</option>
                        <option value="high">{language === 'en' ? 'High (1.5x) - Digital Transformation' : 'Alto (1.5x) - Transformação Digital'}</option>
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
                            {language === 'en' ? 'Social Pricing (-60%)' : 'Precificação Social (-60%)'}
                        </span>
                    </label>
                    <div className="group relative">
                        <AlertCircle className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                            {language === 'en' ? 'For NGOs, priority groups, and social impact' : 'Para ONGs, grupos prioritários e impacto social'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ROI Card */}
            {calculation && calculateROI() && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 space-y-4 animate-fade-in">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        {language === 'en' ? 'Return on Investment (ROI)' : 'Retorno Sobre Investimento (ROI)'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Investment:' : 'Investimento:'}</div>
                        <div className="font-mono font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(calculateROI()?.investment || 0, language, currency)}
                        </div>

                        <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Expected Return:' : 'Retorno Esperado:'}</div>
                        <div className="font-mono font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(calculateROI()?.return || 0, language, currency)}
                        </div>

                        <div className="text-slate-600 dark:text-slate-400">ROI:</div>
                        <div className="font-mono font-semibold text-purple-600">
                            {calculateROI()?.percentage.toFixed(2)}%
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {language === 'en'
                            ? 'ROI is an estimate based on total cost and final price with impact.'
                            : 'O ROI é uma estimativa baseada no custo total e no preço final com impacto.'}
                    </p>
                </div>
            )}

            {/* Quote-to-Product UI */}
            {calculation && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 space-y-4 animate-fade-in">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        {language === 'en' ? 'Generate Product/Service' : 'Gerar Produto/Serviço'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {language === 'en' ? 'Create a product or service in the system based on this pricing.' : 'Crie um produto ou serviço no sistema com base nesta precificação.'}
                    </p>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {language === 'en' ? 'Product/Service Name' : 'Nome do Produto/Serviço'}
                        </label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-rionegro-900 border border-slate-300 dark:border-rionegro-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder={language === 'en' ? 'Ex: Landing Page Development' : 'Ex: Desenvolvimento de Landing Page'}
                        />
                    </div>
                    <button
                        onClick={handleSaveProduct}
                        disabled={!productName || savingProduct}
                        className="w-full px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {savingProduct ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {language === 'en' ? 'Saving...' : 'Salvando...'}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {language === 'en' ? 'Save as Product' : 'Salvar como Produto'}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Calculate Button */}
            <button
                onClick={calculatePrice}
                disabled={stackCost === 0 && hours === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Calculator className="w-5 h-5" />
                {language === 'en' ? 'Calculate Fair Price' : 'Calcular Preço Justo'}
            </button>

            {/* Results */}
            {calculation && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 space-y-4 animate-fade-in">
                    {/* Breakdown */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            {language === 'en' ? 'Cost Breakdown' : 'Breakdown de Custos'}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Stack Cost:' : 'Custo Stack:'}</div>
                            <div className="font-mono font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(calculation.stackCost, language, currency)}
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Labor:' : 'Mão de Obra:'}</div>
                            <div className="font-mono font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(calculation.laborCost, language, currency)} ({calculation.hours}h × {formatCurrency(calculation.hourlyRate, language, currency)})
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Total Cost:' : 'Custo Total:'}</div>
                            <div className="font-mono font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(calculation.totalCost, language, currency)}
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Margin' : 'Margem'} ({(calculation.margin * 100)}%):</div>
                            <div className="font-mono font-semibold text-green-600">
                                + {formatCurrency(calculation.basePrice - calculation.totalCost, language, currency)}
                            </div>

                            <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Impact' : 'Impacto'} ({impact}):</div>
                            <div className="font-mono font-semibold text-blue-600">
                                × {calculation.impactMultiplier}x
                            </div>

                            {isSocialPricing && (
                                <>
                                    <div className="text-slate-600 dark:text-slate-400">{language === 'en' ? 'Social Discount:' : 'Desconto Social:'}</div>
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
                                💵 {language === 'en' ? 'Final Price:' : 'Preço Final:'}
                            </span>
                            <span className="text-3xl font-bold font-mono text-green-600">
                                {formatCurrency(calculation.finalPrice, language, currency)}
                            </span>
                        </div>
                        {isSocialPricing && (
                            <p className="text-xs text-pink-600 dark:text-pink-400 mt-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {language === 'en' ? 'Social Pricing applied - Guaranteed impact!' : 'Precificação Social aplicada - Impacto garantido!'}
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
                                {language === 'en' ? 'Copied!' : 'Copiado!'}
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                {language === 'en' ? 'Copy Proposal' : 'Copiar Proposta'}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
