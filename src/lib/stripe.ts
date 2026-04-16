/**
 * ══ STRIPE CHECKOUT HELPER ═════════════════════════════════════════════════
 * Hub Digital Encontro d'Água — V6.2
 *
 * Produtos Stripe (Payment Links — configure no Vercel Env Vars):
 *   Prompt Lab Mensal:  R$ 3,00/mês  → VITE_STRIPE_LINK_MONTHLY
 *   Prompt Lab Anual:   R$ 29,90/ano → VITE_STRIPE_LINK_ANNUAL
 *   Agente de IA:       R$ 80/mês    → VITE_STRIPE_LINK_AGENTE_IA
 *
 * Fallback: WhatsApp Business da Lidi Moura (5541992557600)
 * ══════════════════════════════════════════════════════════════════════════
 */

// ── WhatsApp Business — Gestão Humana (Lidi Moura) ─────────────────────────
export const LIDI_WHATSAPP = '5541992557600';

// Mensagens estratégicas — URL encoded
export const WA_MSGS = {
  promptLabMonthly: encodeURIComponent(
    'Olá, Lidi! Vi o Prompt Lab no Hub e quero assinar o Plano Mensal (R$ 3,00/mês). Como faço?'
  ),
  promptLabAnnual: encodeURIComponent(
    'Olá, Lidi! Vi o Prompt Lab no Hub e quero assinar o Plano Anual (R$ 29,90/ano). Como faço?'
  ),
  agenteIA: encodeURIComponent(
    'Olá, Lidi! Vi o Agente de IA (R$ 80/mês) no Hub e tenho interesse. Pode me contar mais?'
  ),
  consultoria: encodeURIComponent(
    'Olá, Lidi! Conheci o Hub e quero conversar sobre uma implementação sob medida para minha operação.'
  ),
  keywordShowcase: encodeURIComponent(
    'Olá, Lidi! Estou na vitrine da Provadágua e quero minha Palavra-Chave para testar o CRM agora.'
  ),
  duvidasShowcase: encodeURIComponent(
    'Olá, Lidi! Estou testando a demo e tenho uma dúvida sobre a personalização para o meu negócio.'
  ),
  suporteGeral: encodeURIComponent(
    'Olá, Lidi! Estou na página Provadágua e preciso de suporte.'
  ),
};

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  products: {
    monthly: {
      productId: 'prod_UGWT3Pm4ztKmcU',
      // Configure no Vercel: Settings → Environment Variables → VITE_STRIPE_LINK_MONTHLY
      paymentLink: (import.meta.env.VITE_STRIPE_LINK_MONTHLY as string | undefined) || '',
      label: 'Mensal',
      price: 'R$ 3,00/mês',
      whatsappMsg: WA_MSGS.promptLabMonthly,
    },
    annual: {
      productId: 'prod_UGVFdr4qUVufSu',
      // Configure no Vercel: Settings → Environment Variables → VITE_STRIPE_LINK_ANNUAL
      paymentLink: (import.meta.env.VITE_STRIPE_LINK_ANNUAL as string | undefined) || '',
      label: 'Anual',
      price: 'R$ 29,90/ano',
      whatsappMsg: WA_MSGS.promptLabAnnual,
    },
    agenteIA: {
      productId: 'agente-ia-individual',
      // Configure no Vercel: Settings → Environment Variables → VITE_STRIPE_LINK_AGENTE_IA
      paymentLink: (import.meta.env.VITE_STRIPE_LINK_AGENTE_IA as string | undefined) || '',
      label: 'Agente de IA Individual',
      price: 'R$ 80/mês',
      whatsappMsg: WA_MSGS.agenteIA,
    },
  },
  successUrl: `${window.location.origin}/#/checkout-success`,
  cancelUrl: `${window.location.origin}/#/checkout-cancel`,
  // WhatsApp Business da proprietária — gestão humana
  whatsappFallback: LIDI_WHATSAPP,
};

export type PlanType = 'monthly' | 'annual' | 'agenteIA';

/**
 * Inicia o checkout via Stripe Payment Link (direto, sem backend).
 * Fallback automático para WhatsApp Business da Lidi se o link não estiver configurado.
 * Estratégia de conversão: nunca deixa o lead sem um CTA ativo.
 */
export async function handleStripeCheckout(plan: PlanType): Promise<void> {
  const config = STRIPE_CONFIG.products[plan];

  // Tenta Payment Link do Stripe primeiro
  if (config.paymentLink && config.paymentLink.startsWith('https://buy.stripe.com/')) {
    window.open(config.paymentLink, '_blank', 'noopener,noreferrer');
    return;
  }

  // Fallback: WhatsApp Business com mensagem Lidi-branded
  const waUrl = `https://wa.me/${STRIPE_CONFIG.whatsappFallback}?text=${config.whatsappMsg}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Formata preço para exibição na UI
 */
export function formatPlanPrice(plan: PlanType): string {
  return STRIPE_CONFIG.products[plan].price;
}
