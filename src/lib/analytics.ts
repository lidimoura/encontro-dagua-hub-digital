/**
 * analytics.ts — GA4 Helper · V4.3 Provadágua
 *
 * Tracking centralizado do Google Analytics 4 para o Hub Digital.
 * Injeta o script do GA4 dinamicamente e expõe helpers tipados para
 * eventos personalizados em todas as rotas públicas e de checkout.
 *
 * ID: G-MHH0WSX5QS (Provadágua / Encontro D'Água Hub)
 */

const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-MHH0WSX5QS';

// ── Declara gtag na window ──────────────────────────────────────────────────
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// ── Inicializa o GA4 (chama apenas uma vez) ──────────────────────────────────
let initialized = false;

export function initGA4(): void {
  if (initialized || typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.warn('[Analytics] GA4 Measurement ID não configurado.');
    return;
  }

  // Injeta o script do gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Inicializa dataLayer e gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
    anonymize_ip: true,
  });

  initialized = true;
  console.log(`[Analytics] GA4 inicializado: ${GA_MEASUREMENT_ID}`);
}

// ── trackPageView ────────────────────────────────────────────────────────────
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

// ── trackEvent ───────────────────────────────────────────────────────────────
export interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export function trackEvent({ action, category, label, value, ...extra }: GAEvent): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...extra,
    send_to: GA_MEASUREMENT_ID,
  });
}

// ── Eventos pré-definidos do Hub ─────────────────────────────────────────────

/** Showcase LP — CTA principal clicado */
export function trackShowcaseCTA(label: string): void {
  trackEvent({ action: 'showcase_cta_click', category: 'engagement', label });
}

/** Lead capturado via LeadCaptureModal ou keyword gate */
export function trackLeadCapture(source: string): void {
  trackEvent({ action: 'lead_capture', category: 'conversion', label: source });
}

/** Trial keyword `provadagua` validada com sucesso → acesso imediato */
export function trackTrialStart(method: 'keyword' | 'showcase_form'): void {
  trackEvent({ action: 'trial_start', category: 'conversion', label: method, value: 1 });
}

/** Checkout Stripe iniciado */
export function trackCheckoutStart(plan: 'mensal' | 'anual', value: number): void {
  trackEvent({ action: 'begin_checkout', category: 'ecommerce', label: plan, value });
}

/** Checkout Stripe concluído com sucesso */
export function trackCheckoutSuccess(plan: string, value: number): void {
  trackEvent({ action: 'purchase', category: 'ecommerce', label: plan, value });
}

/** Checkout Stripe cancelado */
export function trackCheckoutCancel(plan?: string): void {
  trackEvent({ action: 'checkout_cancel', category: 'ecommerce', label: plan ?? 'unknown' });
}

/** Login do usuário */
export function trackLogin(method: string): void {
  trackEvent({ action: 'login', category: 'auth', label: method });
}

/** Registro de novo usuário */
export function trackSignUp(method: string): void {
  trackEvent({ action: 'sign_up', category: 'auth', label: method });
}
