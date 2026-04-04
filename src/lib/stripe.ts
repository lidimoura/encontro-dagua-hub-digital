/**
 * ══ STRIPE CHECKOUT HELPER ══════════════════════════════════════════
 * Hub Digital Encontro d'Água — V4.1
 * 
 * Produtos Stripe (Test Mode → substituir por live keys no Vercel):
 *   Mensal:  prod_UGWT3Pm4ztKmcU  →  R$ 3,00/mês
 *   Anual:   prod_UGVFdr4qUVufSu  →  R$ 29,90/ano
 * 
 * Para ativar: adicione VITE_STRIPE_PUBLISHABLE_KEY no .env
 * ════════════════════════════════════════════════════════════════════
 */

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  products: {
    monthly: {
      productId: 'prod_UGWT3Pm4ztKmcU',
      // Payment link direto (funciona mesmo sem backend)
      paymentLink: 'https://buy.stripe.com/test_monthly', // substituir com link real
      label: 'Mensal',
      price: 'R$ 3,00/mês',
      whatsappMsg: 'Quero o Plano Pro Mensal por R$ 3,00/mês 🌿',
    },
    annual: {
      productId: 'prod_UGVFdr4qUVufSu',
      paymentLink: 'https://buy.stripe.com/test_annual', // substituir com link real
      label: 'Anual',
      price: 'R$ 29,90/ano',
      whatsappMsg: 'Quero o Plano Pro Anual por R$ 29,90/ano 🌿',
    },
  },
  successUrl: `${window.location.origin}/#/checkout-success`,
  cancelUrl: `${window.location.origin}/#/checkout-cancel`,
  whatsappFallback: '5592992943998',
};

export type PlanType = 'monthly' | 'annual';

/**
 * Inicia o checkout Stripe ou redireciona para WhatsApp como fallback.
 * Estratégia: se a Stripe publishable key não estiver configurada,
 * usa o WhatsApp como canal de venda (já validado e funcionando).
 */
export async function handleStripeCheckout(plan: PlanType): Promise<void> {
  const config = STRIPE_CONFIG.products[plan];
  const hasStripeKey = !!STRIPE_CONFIG.publishableKey && 
    STRIPE_CONFIG.publishableKey.startsWith('pk_');

  if (hasStripeKey) {
    // Redireciona para Payment Link do Stripe (não requer backend)
    // Quando você criar o Payment Link no dashboard Stripe, cole a URL aqui:
    const paymentLinkUrl = config.paymentLink;
    if (paymentLinkUrl && !paymentLinkUrl.includes('test_')) {
      window.open(paymentLinkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  // Fallback WhatsApp (padrão até configurar Stripe Payment Links)
  const msg = encodeURIComponent(config.whatsappMsg);
  const waUrl = `https://wa.me/${STRIPE_CONFIG.whatsappFallback}?text=${msg}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Formata preço para exibição na UI
 */
export function formatPlanPrice(plan: PlanType): string {
  return STRIPE_CONFIG.products[plan].price;
}
