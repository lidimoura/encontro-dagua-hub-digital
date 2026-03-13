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

    // Convert hourlyRate from selected currency to BRL for internal calculation
    const toInternalBRL = (amountInCurrency: number): number => {
        const rate = FX_RATES[currency] ?? 1;
        return rate === 0 ? amountInCurrency : amountInCurrency / rate;
    };

    // Reset calculation when currency changes but keep hourlyRate as-is
    // (user will update it to match the new currency if needed)
    const handleCurrencyChange = (newCurrency: string) => {
        setCurrency(newCurrency);
        setCalculation(null); // Force fresh calculation after currency switch
    };

    // Quote-to-Product
    const [productName, setProductName] = useState('');
    const [savingProduct, setSavingProduct] = useState(false);

    const SOCIAL_DISCOUNT = 0.60; // 60% discount for social pricing

    // Static FX rates relative to BRL (updated manually or via AI-powered refresh)
    const FX_RATES: Record<string, number> = {
        BRL: 1.0,
        USD: 0.185,   // 1 BRL ≈ 0.185 USD
        EUR: 0.170,   // 1 BRL ≈ 0.170 EUR
        AUD: 0.290,   // 1 BRL ≈ 0.290 AUD
        COP: 750,     // 1 BRL ≈ 750 COP
        PEN: 0.68,    // 1 BRL ≈ 0.68 PEN
        ARS: 180,     // 1 BRL ≈ 180 ARS
        MXN: 3.20,    // 1 BRL ≈ 3.20 MXN
        CLP: 175,     // 1 BRL ≈ 175 CLP
        UYU: 7.3,     // 1 BRL ≈ 7.3 UYU
    };

    // Convert a BRL price to the selected currency for display / catalog save
    const convertPrice = (priceBRL: number): number => {
        const rate = FX_RATES[currency] ?? 1;
        return Math.round(priceBRL * rate * 100) / 100;
    };

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
        // hourlyRate is in the selected currency — convert to BRL for internal math
        const hourlyRateBRL = toInternalBRL(hourlyRate);
        const laborCost = hours * hourlyRateBRL;        // in BRL
        const totalCost = stackCost + laborCost;        // stackCost already BRL (from products table)
        const basePrice = totalCost * (1 + margin);
        const impactMultiplier = impactMultipliers[impact];
        const finalPrice = basePrice * impactMultiplier; // BRL
        const socialPrice = finalPrice * (1 - SOCIAL_DISCOUNT);

        const calc: PricingCalculation = {
            stackCost,
            hours,
            hourlyRate: hourlyRateBRL,   // stored in BRL internally
            laborCost,
            totalCost,
            margin,
            basePrice,
            socialDiscount: SOCIAL_DISCOUNT,
            socialPrice,
            impact,
            impactMultiplier,
            finalPrice: isSocialPricing ? socialPrice : finalPrice,  // always BRL
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

    // FIXED: Save the priced product to the products table for use in Deals
    // Uses upsert to prevent 409 Conflict when name already exists.
    const handleSaveProduct = async () => {
        if (!productName.trim() || !calculation) return;
        setSavingProduct(true);
        const priceInSelectedCurrency = convertPrice(calculation.finalPrice);
        try {
            const { error } = await supabase
                .from('products')
                .upsert([{
                    name: productName.trim(),
                    description: `Precificado pela Precy — ${impact.toUpperCase()} impact × ${calculation.impactMultiplier}x (${currency})`,
                    price: priceInSelectedCurrency,
                    product_type: 'crm_service',
                    is_internal: false,
                    is_active: true,
                    pricing_model: 'fixed',
                    stack_category: null,
                    metadata: {
                        generated_by: 'precy',
                        stack_cost: calculation.stackCost,
                        labor_cost: calculation.laborCost,
                        hours: calculation.hours,
                        hourly_rate: calculation.hourlyRate,
                        margin: calculation.margin,
                        impact,
                        impact_multiplier: calculation.impactMultiplier,
                        is_social_pricing: isSocialPricing,
                        currency,
                        price_brl: calculation.finalPrice,
                    },
                }], { onConflict: 'name', ignoreDuplicates: false });

            if (error) throw error;
            addToast(t('productSaved') || `"${productName}" salvo no catálogo (${currency})!`, 'success');
            setProductName('');
        } catch (error: any) {
            console.error('[Precy] Error saving product:', error);
            addToast('Erro ao salvar produto. Tente novamente.', 'error');
        } finally {
            setSavingProduct(false);
        }
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
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Moeda</label>
                    <select
                        value={currency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                    >
                        <option value="BRL">🇧🇷 BRL</option>
                        <option value="USD">🇺🇸 USD</option>
                        <option value="EUR">🇪🇺 EUR</option>
                        <option value="AUD">🇦🇺 AUD</option>
                        <option value="COP">🇨🇴 COP</option>
                        <option value="PEN">🇵🇪 PEN</option>
                        <option value="ARS">🇦🇷 ARS</option>
                        <option value="MXN">🇲🇽 MXN</option>
                        <option value="CLP">🇨🇱 CLP</option>
                        <option value="UYU">🇺🇾 UYU</option>
                    </select>
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
