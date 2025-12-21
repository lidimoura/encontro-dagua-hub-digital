/**
 * Pricing Plans Configuration
 * 
 * Estrutura de planos do Encontro D'água .hub
 * Para integração futura com Stripe/Pagamento
 */

export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year' | 'lifetime';
    features: string[];
    limits: {
        qrCodes: number | 'unlimited';
        promptLab: boolean;
        aiAgents: boolean;
        analytics: boolean;
        customBranding: boolean;
    };
    recommended?: boolean;
}

export const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'BRL',
        interval: 'lifetime',
        features: [
            'QR Codes básicos (até 3)',
            'Prompt Lab público',
            'Marca "Powered by Hub"',
            'Suporte via comunidade'
        ],
        limits: {
            qrCodes: 3,
            promptLab: true,
            aiAgents: false,
            analytics: false,
            customBranding: false
        }
    },
    {
        id: 'pro_monthly',
        name: 'Pro Avulso',
        price: 9.90,
        currency: 'BRL',
        interval: 'month',
        features: [
            'QR Codes ilimitados',
            'Prompt Lab avançado',
            'Amazo IA integrado',
            'Analytics completo',
            'Sem marca "Powered by"',
            'Suporte prioritário'
        ],
        limits: {
            qrCodes: 'unlimited',
            promptLab: true,
            aiAgents: true,
            analytics: true,
            customBranding: true
        },
        recommended: true
    },
    {
        id: 'pro_yearly',
        name: 'Pro Anual',
        price: 97,
        currency: 'BRL',
        interval: 'year',
        features: [
            'Tudo do Pro Avulso',
            '2 meses grátis (economia de R$ 21,80)',
            'Acesso antecipado a features',
            'Consultoria estratégica (1h/ano)',
            'Badge de Early Adopter'
        ],
        limits: {
            qrCodes: 'unlimited',
            promptLab: true,
            aiAgents: true,
            analytics: true,
            customBranding: true
        }
    }
];

/**
 * Helper function to get plan by ID
 */
export function getPlanById(planId: string): Plan | undefined {
    return PLANS.find(plan => plan.id === planId);
}

/**
 * Helper function to format price
 */
export function formatPrice(price: number, currency: string = 'BRL'): string {
    if (price === 0) return 'Grátis';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(price);
}

/**
 * Helper function to get interval label
 */
export function getIntervalLabel(interval: Plan['interval']): string {
    const labels = {
        month: '/mês',
        year: '/ano',
        lifetime: ''
    };

    return labels[interval];
}
