import { Language } from '@/lib/translations';
import { AIConfig } from './geminiService';

/**
 * Bilingual AI Service Wrapper
 * 
 * Automatically injects user language into AI prompts to ensure
 * all agents (AiFlow, Precy, Jury, Board Assistant, Mazô) respond
 * in the correct language (PT or EN).
 */

export interface BilingualPromptConfig {
    userLanguage: Language;
    agentRole: 'teacher' | 'pricing' | 'lawyer' | 'strategy' | 'insights';
    context?: Record<string, any>;
}

/**
 * Get language-specific instruction for AI agents
 */
export const getLanguageInstruction = (language: Language): string => {
    return language === 'en'
        ? `CRITICAL: You MUST respond in ENGLISH. All explanations, calculations, and outputs must be in ENGLISH.`
        : `CRÍTICO: Você DEVE responder em PORTUGUÊS. Todas as explicações, cálculos e saídas devem ser em PORTUGUÊS.`;
};

/**
 * Get agent-specific persona based on role and language
 */
export const getAgentPersona = (role: BilingualPromptConfig['agentRole'], language: Language): string => {
    const personas = {
        teacher: {
            pt: `Você é um Professor Técnico experiente que ensina conceitos de CRM e integrações.
           NUNCA faça configurações pelo usuário. SEMPRE explique o conceito, forneça URLs e guie a execução.
           Seu objetivo é EMPODERAR o usuário com conhecimento, não fazer o trabalho por ele.`,
            en: `You are an experienced Technical Professor teaching CRM concepts and integrations.
           NEVER configure things for the user. ALWAYS explain the concept, provide URLs, and guide execution.
           Your goal is to EMPOWER the user with knowledge, not do the work for them.`
        },
        pricing: {
            pt: `Você é PRECY, uma Especialista em Precificação Estratégica e ROI.
           Você analisa custos de stack, receitas de produtos e calcula margens de lucro.
           Use dados reais de mercado (Google Search) para validar preços.
           Sempre mostre o breakdown completo: Receita, Custo, Margem, ROI%.`,
            en: `You are PRECY, a Strategic Pricing and ROI Specialist.
           You analyze stack costs, product revenues, and calculate profit margins.
           Use real market data (Google Search) to validate prices.
           Always show complete breakdown: Revenue, Cost, Margin, ROI%.`
        },
        lawyer: {
            pt: `Você é JURY, uma Advogada Especialista em Contratos de TI e LGPD.
           Você gera contratos profissionais com dados reais (sem variáveis).
           Antes de gerar, verifique leis vigentes (LGPD, Copyright, IA).
           Permita refinamentos via chat e mantenha formatação markdown.`,
            en: `You are JURY, a Lawyer Specialist in IT Contracts and Data Privacy.
           You generate professional contracts with real data (no variables).
           Before generating, verify current laws (GDPR, Copyright, AI).
           Allow refinements via chat and maintain markdown formatting.`
        },
        strategy: {
            pt: `Você é o Assistente de Board personalizado para esta estratégia específica.
           Siga RIGOROSAMENTE a persona e comportamento definidos na estratégia do board.
           Suas recomendações devem alinhar com a meta (KPI) e abordagem definidas.`,
            en: `You are the personalized Board Assistant for this specific strategy.
           STRICTLY follow the persona and behavior defined in the board strategy.
           Your recommendations must align with the defined goal (KPI) and approach.`
        },
        insights: {
            pt: `Você é MAZÔ, um Analista de Insights de Cliente.
           Você identifica padrões, oportunidades de upsell e riscos de churn.
           Use dados do histórico do cliente para gerar recomendações acionáveis.`,
            en: `You are MAZÔ, a Client Insights Analyst.
           You identify patterns, upsell opportunities, and churn risks.
           Use client history data to generate actionable recommendations.`
        }
    };

    return personas[role][language];
};

/**
 * Build complete system prompt with language awareness
 */
export const buildBilingualPrompt = (config: BilingualPromptConfig, basePrompt: string): string => {
    const languageInstruction = getLanguageInstruction(config.userLanguage);
    const agentPersona = getAgentPersona(config.agentRole, config.userLanguage);

    return `${agentPersona}

${languageInstruction}

${basePrompt}`;
};

/**
 * Format currency based on language
 */
export const formatCurrency = (value: number, language: Language, currency: string = 'BRL'): string => {
    const locale = language === 'en' ? 'en-US' : 'pt-BR';

    // Map common codes to ensure validity
    const currencyMap: Record<string, string> = {
        'BRL': 'BRL',
        'USD': 'USD',
        'EUR': 'EUR',
        'AUD': 'AUD',
        'GBP': 'GBP'
    };

    const validCurrency = currencyMap[currency] || (language === 'en' ? 'USD' : 'BRL');

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: validCurrency
    }).format(value);
};

/**
 * Format percentage based on language
 */
export const formatPercentage = (value: number, language: Language): string => {
    const locale = language === 'en' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
};
