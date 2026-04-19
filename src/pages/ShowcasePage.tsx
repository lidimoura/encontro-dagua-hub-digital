import React, { useState, useEffect, useRef } from 'react';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { initGA4, trackShowcaseCTA, trackLeadCapture } from '@/lib/analytics';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Translation {
  nav_login: string;
  hero_eyebrow: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_title_accent: string;
  hero_subtitle: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_cta_sub: string;
  trust_label: string;
  specialties: string[];
  metrics: Array<{ value: string; label: string; icon: string }>;
  pain_title: string;
  pain_subtitle: string;
  pain_items: Array<{ icon: string; title: string; desc: string }>;
  modules_title: string;
  modules_subtitle: string;
  modules_group_native: string;
  modules_group_custom: string;
  modules_credit: string;
  modules_pitch: string;
  modules: Array<{ icon: string; name: string; desc: string; badge: string; group: string }>;
  faq_title: string;
  faq_items: Array<{ q: string; a: string }>;
  qa_eyebrow: string;
  qa_title: string;
  qa_subtitle: string;
  qa_items: Array<{ icon: string; title: string; status: string; desc: string }>;
  tech_title: string;
  tech_stack: Array<{ icon: string; name: string; category: string }>;
  trial_title: string;
  trial_subtitle: string;
  trial_features: string[];
  trial_cta: string;
  trial_sub: string;
  footer_built: string;
  footer_version: string;
  footer_privacy: string;
}

// ─── SVG Icon Components ───────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── i18n Content ─────────────────────────────────────────────────────────
const TRANSLATIONS: Record<'pt' | 'en', Translation> = {
  pt: {
    nav_login: 'Entrar no Hub',
    hero_eyebrow: 'Para Empreendedores · Agências · Profissionais Liberais',
    hero_title_1: 'O CRM com IA que',
    hero_title_2: 'organiza seus negócios',
    hero_title_accent: 'e faz sua operação crescer.',
    hero_subtitle:
      'Provadágua: Experimente a potência do CRM personalizado do Encontro d\'Água Hub. Use esta demonstração gratuita por 7 dias e veja como podemos customizar uma operação exclusiva para o seu negócio.',
    hero_cta_primary: 'Experimente a Provadágua por 7 dias',
    hero_cta_secondary: 'Ver demonstração ao vivo',
    hero_cta_sub: 'Gestão de Elite com Privacidade OCI · Sem cartão de crédito · Dados 100% isolados',
    trust_label: 'Confiado por empreendedores e agências',
    specialties: ['Tech', 'Marketing', 'Vendas', 'Consultoria', 'Agências'],
    metrics: [
      { value: '100%', label: 'Dados Isolados por Empresa', icon: '🔒' },
      { value: '9', label: 'Módulos em Produção', icon: '⚡' },
      { value: '4', label: 'Agentes de IA Ativos', icon: '🤖' },
      { value: '24/7', label: 'SDR Automatizado', icon: '📡' },
    ],
    pain_title: 'Você reconhece esses problemas?',
    pain_subtitle: 'Criamos soluções específicas para a realidade do profissional moderno',
    pain_items: [
      {
        icon: '📁',
        title: 'Dados espalhados por toda parte',
        desc: 'Planilhas, WhatsApp, e-mail e papel — impossível acompanhar sem um sistema centralizado e seguro.',
      },
      {
        icon: '⏰',
        title: 'Tempo perdido em tarefas manuais',
        desc: 'Follow-ups, propostas e lembretes consomem horas que deveriam ser dedicadas aos seus clientes e projetos.',
      },
      {
        icon: '🚫',
        title: 'Risco de vazamento de dados (LGPD)',
        desc: 'Softwares genéricos não foram projetados para a privacidade que seu negócio exige. Você está vulnerável.',
      },
      {
        icon: '📊',
        title: 'Não consegue gerenciar seus clientes e projetos?',
        desc: 'Sem visibilidade do pipeline, sem follow-up automático e sem relatórios — você perde negócios sem nem perceber. O ecossistema Provadágua centraliza tudo.',
      },
    ],
    modules_title: 'O Ecossistema em Produção',
    modules_subtitle: 'Veja o que está ativo em hub.encontrodagua.com — operando 24/7 para nossos clientes',
    modules_group_native: 'BLOCO A — Funcionalidades Nativas',
    modules_group_custom: 'BLOCO B — Hub Personalizado',
    modules_credit: 'Base de CRM compartilhada com alunos vitalícios da Escola de Automação do Thales Laray, servindo como fundação de alta performance para nossas implementações.',
    modules_pitch: 'Nós não vendemos software engessado. Personalizamos cada CRM de acordo com a sua demanda, contexto e necessidade.',
    modules: [
      { icon: '📋', name: 'Gestão de Leads', desc: 'Pipeline visual com stages customizáveis e automação SDR ativa', badge: 'Ativo', group: 'native' },
      { icon: '🏆', name: 'Kanban de Vendas', desc: 'Board visual com arrastar e soltar — funil de vendas em tempo real', badge: 'Ativo', group: 'native' },
      { icon: '🤖', name: 'IA First Boards', desc: 'Templates criados via IA ou escolha entre os pré-definidos por nicho', badge: 'IA', group: 'native' },
      { icon: '🌊', name: 'AIflow', desc: 'Assistente técnico embarcado — suporte inteligente dentro do CRM', badge: 'IA', group: 'native' },
      { icon: '📬', name: 'Inbox TDAH-Friendly', desc: 'Prioridades estratégicas e briefings do dia — foco sem ruído cognitivo', badge: 'Ativo', group: 'native' },
      { icon: '📊', name: 'Dashboards', desc: 'Win/Loss, ciclo de vendas e pipeline em tempo real', badge: 'Ativo', group: 'native' },
      { icon: '👥', name: 'Banco de Contatos', desc: 'CRM de clientes com sync bidirecional e isolamento total por empresa', badge: 'Ativo', group: 'native' },
      { icon: '📤', name: 'Amazô', desc: 'Agente IA: CS/SDR nas LPs e no CRM — responde leads 24/7', badge: 'Custom', group: 'custom' },
      { icon: '⚖️', name: 'Jury', desc: 'Contratos BR + Common Law gerados por IA com PDF inline', badge: 'Custom', group: 'custom' },
      { icon: '💰', name: 'Precy', desc: 'Precificação profissional BRL/USD/EUR com catálogo de produtos', badge: 'Custom', group: 'custom' },
      { icon: '🧪', name: 'Prompt Lab', desc: 'Engenharia de prompts multi-persona com teste ao vivo', badge: 'Custom', group: 'custom' },
      { icon: '📦', name: 'Catálogo de Produtos', desc: 'Gestão centralizada de produtos e serviços para precificação', badge: 'Custom', group: 'custom' },
      { icon: '🔗', name: 'Integrações No-code', desc: 'Webhooks, n8n, Zapier e WhatsApp — conecte qualquer sistema', badge: 'Custom', group: 'custom' },
    ],
    faq_title: 'Perguntas Frequentes',
    faq_items: [
      { q: 'Preciso de cartão de crédito para testar?', a: 'Não. A Provadágua de 7 dias é 100% gratuita. Só precisamos da palavra-chave — solicite pelo WhatsApp.' },
      { q: 'Meus dados ficam isolados?', a: 'Sim. Cada empresa tem seu próprio company_id com RLS ativo. Dados nunca visíveis para outros tenants.' },
      { q: 'Qual a diferença entre Nativas e Agentes de IA?', a: 'Nativas são os módulos do CRM (Kanban, Contatos, Reports). Agentes de IA são assistentes inteligentes integrados.' },
      { q: 'Posso usar em inglês?', a: 'Sim. Toggle PT/EN disponível em todas as telas.' },
      { q: 'O que acontece após os 7 dias?', a: 'Você decide se ativa um plano. Sem cobrança automática.' },
    ],
    qa_eyebrow: 'Auditoria V3.0 — Abril 2026',
    qa_title: 'Relatório de QA & Segurança',
    qa_subtitle: 'Transparência técnica é parte da nossa proposta de valor',
    qa_items: [
      {
        icon: 'shield',
        title: 'Isolamento Multi-Tenant',
        status: 'APROVADO',
        desc: 'company_id RLS ativo em todas as tabelas críticas. Dados de cada empresa completamente separados.',
      },
      {
        icon: 'shield',
        title: 'Chaves de API Seguras',
        status: 'APROVADO',
        desc: 'SUPABASE_SERVICE_ROLE_KEY rotacionada e armazenada apenas em Vercel Secrets. Nunca exposta no repositório.',
      },
      {
        icon: 'shield',
        title: 'Super Admin (Migration 038)',
        status: 'APROVADO',
        desc: 'Controle de acesso por hierarquia. is_super_admin com bypass de RLS apenas para operações autorizadas.',
      },
      {
        icon: 'shield',
        title: 'Bilinguismo PT/EN',
        status: 'APROVADO',
        desc: 'Interface completa em português e inglês. Toggle nativo em todos os módulos.',
      },
      {
        icon: 'shield',
        title: 'Validade de Acesso',
        status: 'APROVADO',
        desc: 'access_expires_at por usuário. Acesso temporário com expiração automática. Controle total do admin.',
      },
      {
        icon: 'shield',
        title: 'Isolamento Demo',
        status: 'APROVADO',
        desc: 'is_demo_data guard em todos os services. Dados de produção nunca vazam para o ambiente de demonstração.',
      },
    ],
    tech_title: 'Arquitetura Técnica',
    tech_stack: [
      { icon: '⚛', name: 'React 18 + TypeScript', category: 'Frontend' },
      { icon: '🗄', name: 'Supabase + PostgreSQL', category: 'Backend' },
      { icon: '🔐', name: 'RLS Multi-Tenant', category: 'Segurança' },
      { icon: '🤖', name: 'Google Gemini', category: 'IA Principal' },
      { icon: '⚡', name: 'Vite + TailwindCSS', category: 'Build' },
      { icon: '🌐', name: 'Vercel Edge', category: 'Deploy Global' },
      { icon: '🔄', name: 'TanStack Query', category: 'State' },
      { icon: '☁', name: 'Edge Functions', category: 'Serverless' },
    ],
    trial_title: 'Experimente a Provadágua por 7 dias',
    trial_subtitle: 'Gestão de Elite com Privacidade OCI. O CRM feito para empreendedores e agências que não abrem mão da segurança dos seus dados.',
    trial_features: [
      'Isolamento total de dados por empresa',
      '4 Agentes de IA inclusos',
      'SDR automatizado 24/7',
      'Relatório de QA/Segurança',
      'Suporte dedicado',
      'Cancele a qualquer momento',
    ],
    trial_cta: 'Experimente a Provadágua por 7 dias — Grátis',
    trial_sub: 'Gestão de Elite com Privacidade OCI · Setup em menos de 5 minutos · Cancele a qualquer momento',
    footer_built: 'Construído com ❤ pela equipe Encontro D\'Água',
    footer_version: 'V5.7 — Final Release',
    footer_privacy: 'Privacidade · LGPD · Termos',
  },
  en: {
    nav_login: 'Enter Hub',
    hero_eyebrow: 'For Entrepreneurs · Agencies · Consultants',
    hero_title_1: 'The AI-powered CRM that',
    hero_title_2: 'organizes your business',
    hero_title_accent: 'and makes your operation grow.',
    hero_subtitle:
      'Provadágua: Experience the power of the customized CRM from Encontro d\'Água Hub. Use this free 7-day demo and see how we can build an exclusive operation for your business.',
    hero_cta_primary: 'Try Provadágua for 7 days',
    hero_cta_secondary: 'Watch live demo',
    hero_cta_sub: 'Elite Management with OCI Privacy · No credit card · 100% isolated data',
    trust_label: 'Trusted by entrepreneurs and agencies',
    specialties: ['Tech', 'Marketing', 'Sales', 'Consulting', 'Agencies'],
    metrics: [
      { value: '100%', label: 'Data Isolated per Company', icon: '🔒' },
      { value: '9', label: 'Modules in Production', icon: '⚡' },
      { value: '4', label: 'Active AI Agents', icon: '🤖' },
      { value: '24/7', label: 'Automated SDR', icon: '📡' },
    ],
    pain_title: 'Do you recognize these problems?',
    pain_subtitle: 'We built specific solutions for the real challenges of modern professionals',
    pain_items: [
      {
        icon: '📁',
        title: 'Client data scattered everywhere',
        desc: 'Spreadsheets, WhatsApp, email, and paper — impossible to track without a centralized, secure system.',
      },
      {
        icon: '⏰',
        title: 'Time wasted on manual tasks',
        desc: 'Follow-ups, proposals, and reminders consume hours that should be dedicated to your clients and projects.',
      },
      {
        icon: '🚫',
        title: 'Data breach risk (GDPR/LGPD)',
        desc: 'Generic software wasn\'t designed for the privacy your business requires. You are vulnerable.',
      },
      {
        icon: '📊',
        title: 'Can\'t manage your clients and projects?',
        desc: 'No pipeline visibility, no automated follow-up, no reports — you lose business without realizing it. Provadágua centralizes everything.',
      },
    ],
    modules_title: 'The Ecosystem in Production',
    modules_subtitle: 'See what is live at hub.encontrodagua.com — running 24/7 for our clients',
    modules_group_native: 'BLOCK A — Native Features',
    modules_group_custom: 'BLOCK B — Custom Hub',
    modules_credit: 'CRM base shared with lifetime members of Thales Laray\'s Automation School, serving as a high-performance foundation for our implementations.',
    modules_pitch: 'We don\'t sell rigid software. We customize every CRM according to your demand, context and specific needs.',
    modules: [
      { icon: '📋', name: 'Lead Management', desc: 'Visual pipeline with customizable stages and active SDR automation', badge: 'Live', group: 'native' },
      { icon: '🏆', name: 'Sales Kanban', desc: 'Drag-and-drop visual board — real-time sales funnel', badge: 'Live', group: 'native' },
      { icon: '🤖', name: 'AI First Boards', desc: 'AI-generated templates or choose from niche-specific presets', badge: 'AI', group: 'native' },
      { icon: '🌊', name: 'AIflow', desc: 'Embedded technical assistant — intelligent support inside the CRM', badge: 'AI', group: 'native' },
      { icon: '📬', name: 'ADHD-Friendly Inbox', desc: 'Strategic priorities and daily briefings — focus without cognitive noise', badge: 'Live', group: 'native' },
      { icon: '📊', name: 'Dashboards', desc: 'Win/Loss, sales cycle and real-time pipeline overview', badge: 'Live', group: 'native' },
      { icon: '👥', name: 'Contact Database', desc: 'Client CRM with bidirectional sync and per-company isolation', badge: 'Live', group: 'native' },
      { icon: '📤', name: 'Amazô', desc: 'AI Agent: CS/SDR on LPs and CRM — responds to leads 24/7', badge: 'Custom', group: 'custom' },
      { icon: '⚖️', name: 'Jury', desc: 'BR + Common Law contracts generated by AI with inline PDF', badge: 'Custom', group: 'custom' },
      { icon: '💰', name: 'Precy', desc: 'Professional pricing BRL/USD/EUR with product catalog', badge: 'Custom', group: 'custom' },
      { icon: '🧪', name: 'Prompt Lab', desc: 'Multi-persona prompt engineering with live testing', badge: 'Custom', group: 'custom' },
      { icon: '📦', name: 'Product Catalog', desc: 'Centralized management of products and services for pricing', badge: 'Custom', group: 'custom' },
      { icon: '🔗', name: 'No-code Integrations', desc: 'Webhooks, n8n, Zapier and WhatsApp — connect any system', badge: 'Custom', group: 'custom' },
    ],
    faq_title: 'Frequently Asked Questions',
    faq_items: [
      { q: 'Do I need a credit card to try?', a: 'No. The 7-day Provadágua trial is 100% free. You just need an access keyword — request it via WhatsApp.' },
      { q: 'Is my data isolated from others?', a: 'Yes. Each company has its own company_id with active RLS. Data is never visible to other tenants.' },
      { q: "What's the difference between Native modules and AI Agents?", a: 'Native modules are core CRM tools (Kanban, Contacts, Reports). AI Agents are intelligent assistants integrated into your workflow.' },
      { q: 'Can I use it in English?', a: 'Yes. PT/EN language toggle available on all screens.' },
      { q: 'What happens after 7 days?', a: 'You decide whether to activate a plan. No automatic charges.' },
    ],
    qa_eyebrow: 'V3.0 Audit — April 2026',
    qa_title: 'QA & Security Report',
    qa_subtitle: 'Technical transparency is part of our value proposition',
    qa_items: [
      {
        icon: 'shield',
        title: 'Multi-Tenant Isolation',
        status: 'PASSED',
        desc: 'company_id RLS active on all critical tables. Each company\'s data is completely separated.',
      },
      {
        icon: 'shield',
        title: 'Secure API Keys',
        status: 'PASSED',
        desc: 'SUPABASE_SERVICE_ROLE_KEY rotated and stored only in Vercel Secrets. Never exposed in repository.',
      },
      {
        icon: 'shield',
        title: 'Super Admin (Migration 038)',
        status: 'PASSED',
        desc: 'Hierarchical access control. is_super_admin with RLS bypass only for authorized operations.',
      },
      {
        icon: 'shield',
        title: 'Bilingualism PT/EN',
        status: 'PASSED',
        desc: 'Full interface in Portuguese and English. Native toggle across all modules.',
      },
      {
        icon: 'shield',
        title: 'Access Expiry Control',
        status: 'PASSED',
        desc: 'access_expires_at per user. Temporary access with automatic expiration. Admin has full control.',
      },
      {
        icon: 'shield',
        title: 'Demo Isolation',
        status: 'PASSED',
        desc: 'is_demo_data guard in all services. Production data never leaks into the demo environment.',
      },
    ],
    tech_title: 'Technical Architecture',
    tech_stack: [
      { icon: '⚛', name: 'React 18 + TypeScript', category: 'Frontend' },
      { icon: '🗄', name: 'Supabase + PostgreSQL', category: 'Backend' },
      { icon: '🔐', name: 'RLS Multi-Tenant', category: 'Security' },
      { icon: '🤖', name: 'Google Gemini', category: 'Primary AI' },
      { icon: '⚡', name: 'Vite + TailwindCSS', category: 'Build' },
      { icon: '🌐', name: 'Vercel Edge', category: 'Global Deploy' },
      { icon: '🔄', name: 'TanStack Query', category: 'State' },
      { icon: '☁', name: 'Edge Functions', category: 'Serverless' },
    ],
    trial_title: 'Try Provadágua for 7 days',
    trial_subtitle: 'Elite Management with OCI-grade Privacy. The CRM built for entrepreneurs and agencies who demand the highest standard of data security.',
    trial_features: [
      'Complete data isolation per company',
      '4 AI Agents included',
      'Automated SDR 24/7',
      'QA/Security Report',
      'Dedicated support',
      'Cancel anytime',
    ],
    trial_cta: 'Try Provadágua for 7 days — Free',
    trial_sub: 'Elite Management with OCI Privacy · Setup in under 5 minutes · Cancel anytime',
    footer_built: 'Built with ❤ by the Encontro D\'Água team',
    footer_version: 'V5.7 — Final Release',
    footer_privacy: 'Privacy · LGPD/GDPR · Terms',
  },
};

// ─── Shared style tokens — Paleta V5.3: Rio Negro + Açaí + Solimões ─────────
// Rio Negro: preto profundo | Açaí: roxo neon | Solimões: dourado/argila
const S = {
  // ── Gradientes principais
  acaiGrad:      'linear-gradient(135deg, #6D28A8, #A855F7)',
  solimoesGrad:  'linear-gradient(135deg, #C8933A, #F59E0B)',
  acaiSolimoes:  'linear-gradient(135deg, #6D28A8, #A855F7, #C8933A)',
  // ── Compat earthNeon → Açaí (manter compilação de seções antigas)
  earthNeon:     'linear-gradient(135deg, #6D28A8, #A855F7)',
  earthWarm:     'linear-gradient(135deg, #C8933A, #F59E0B)',
  forestDeep:    'linear-gradient(135deg, #1A0A2E, #2D1B55)',
  // ── Fundos
  obsidian:      '#040308',    // Rio Negro profundo
  // ── Superficies glassmorphism
  surface:       'rgba(109, 40, 168, 0.05)',
  surfaceHover:  'rgba(109, 40, 168, 0.12)',
  surfaceWarm:   'rgba(200, 147, 58, 0.06)',
  // ── Bordas
  border:        'rgba(109, 40, 168, 0.12)',
  borderHover:   'rgba(109, 40, 168, 0.40)',
  borderGold:    'rgba(200, 147, 58, 0.20)',
  borderGoldHov: 'rgba(200, 147, 58, 0.48)',
  // ── Cores de destaque
  acai:          '#6D28A8',    // Açaí roxo
  acaiLight:     '#A855F7',    // Neon violeta
  solimoes:      '#C8933A',    // Solimões dourado/argila
  solimoesLight: '#F59E0B',    // Neon dourado
  neonGreen:     '#00C97B',    // Verde manutenção (CTA secondary)
  neonCyan:      '#A855F7',    // Redirecionado para violeta
  gold:          '#C8933A',
  goldLight:     '#F59E0B',
  // ── Tipografia
  textPrimary:   '#F8FAFC',
  textSecondary: '#94a3b8',
  textMuted:     '#64748b',
  // ── Compat legado
  cyanBlue:      'linear-gradient(135deg, #6D28A8, #A855F7)',
  navy:          '#040308',
  blue:          '#A855F7',
  emerald:       '#A855F7',
  slate:         '#94a3b8',
  slateDim:      '#64748b',
};

// ─── ShowcasePage Component ────────────────────────────────────────────────
const ShowcasePage: React.FC = () => {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [scrolled, setScrolled] = useState(false);
  const observedRef = useRef<Set<string>>(new Set());
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkDaguaOpen, setLinkDaguaOpen] = useState(false); // Accordion: Bônus Link d'Água
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [qaOpen, setQaOpen] = useState(false);    // Accordion: QA & Segurança
  const [techOpen, setTechOpen] = useState(false); // Accordion: Arquitetura Técnica

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    // Delay 200ms para garantir que o DOM das seções está montado
    const timeout = setTimeout(() => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && e.target.id) {
              setVisible((prev) => new Set(prev).add(e.target.id));
            }
          });
        },
        { threshold: 0.05 }
      );
      document.querySelectorAll('[data-obs]').forEach((el) => {
        if (el.id && !observedRef.current.has(el.id)) {
          obs.observe(el);
          observedRef.current.add(el.id);
        }
      });
      return () => obs.disconnect();
    }, 200);
    return () => clearTimeout(timeout);
  }, []);

  const isVis = (id: string) => visible.has(id);

  // SAFE fadeIn: conteúdo SEMPRE visível (opacity:1).
  // IntersectionObserver adiciona a animação de slide — nunca bloqueia renderização.
  const fadeIn = (id: string, delay = 0): React.CSSProperties => ({
    opacity: 1,                          // sempre visível — jamais opacity:0
    transform: isVis(id) ? 'translateY(0)' : 'translateY(24px)',
    transition: `transform 0.65s ease ${delay}s`,
  });

  return (
    <div
      id="showcase-root"
      style={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 20% 0%, rgba(109,40,168,0.16) 0%, transparent 60%),
          radial-gradient(ellipse 80% 40% at 80% 10%, rgba(200,147,58,0.09) 0%, transparent 60%),
          radial-gradient(ellipse 60% 30% at 50% 80%, rgba(168,85,247,0.07) 0%, transparent 70%),
          #040308
        `,
        color: S.textPrimary,
        fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* ── CSS Keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes fadeDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse    { 0%,100%{ opacity:1; } 50%{ opacity:.55; } }
        @keyframes shimmer  { 0%{ background-position:-200% center; } 100%{ background-position:200% center; } }
        @keyframes float    { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-8px); } }
        @keyframes scanAnim { 0%{ transform:translateY(-100%); } 100%{ transform:translateY(400%); } }
        @keyframes acaiPulse { 0%,100%{ box-shadow:0 0 20px rgba(109,40,168,0.3); } 50%{ box-shadow:0 0 40px rgba(168,85,247,0.5); } }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(109,40,168,0.4); }
        a { text-decoration: none; }
        .screen-mock {
          position: relative;
          background: #0D0820;
          border: 1px solid rgba(109,40,168,0.25);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(109,40,168,0.08);
        }
        .screen-mock::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 28px;
          background: #080412;
          border-bottom: 1px solid rgba(109,40,168,0.15);
          z-index: 3;
        }
        .scanline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent);
          animation: scanAnim 3s linear infinite;
          z-index: 5;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── Sticky Nav ─────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(8,13,26,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(1.6)' : 'none',
          borderBottom: scrolled ? `1px solid ${S.border}` : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo — no contexto Showcase, retorna para /#/showcase */}
        <a href="/#/showcase" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <img
            src="/logos/logo-icon-gold-transp.png"
            alt="Encontro d'Agua Hub"
            aria-hidden="true"
            style={{
              width: '34px', height: '34px',
              objectFit: 'contain',
              borderRadius: '9px',
              filter: 'drop-shadow(0 0 10px rgba(200,147,58,0.5))',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: S.textPrimary, letterSpacing: '-0.01em' }}>
            Encontro D’Água Hub
          </span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Lang toggle */}
          <button
            id="showcase-lang-toggle"
            aria-label={`Switch to ${lang === 'pt' ? 'English' : 'Português'}`}
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            style={{
              background: S.surface,
              border: `1px solid ${S.border}`,
              borderRadius: '20px', padding: '6px 14px',
              color: S.textSecondary,
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
              transition: 'all 0.2s', minHeight: '36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = S.surfaceHover;
              e.currentTarget.style.color = S.textPrimary;
              e.currentTarget.style.borderColor = S.borderHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = S.surface;
              e.currentTarget.style.color = S.textSecondary;
              e.currentTarget.style.borderColor = S.border;
            }}
          >
            {lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}
          </button>

          <a href="/#/login?from=showcase" id="showcase-nav-login"
            style={{
              background: S.acaiGrad,
              borderRadius: '20px', padding: '8px 20px',
              color: '#fff',
              fontSize: '0.82rem', fontWeight: 800,
              transition: 'all 0.2s',
              boxShadow: '0 4px 18px rgba(109,40,168,0.40)',
              minHeight: '36px', display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(168,85,247,0.60)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(109,40,168,0.40)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {t.nav_login}
          </a>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section
        id="showcase-hero"
        aria-labelledby="hero-heading"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'clamp(7rem, 14vw, 10rem) 1.5rem clamp(5rem, 10vw, 7rem)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background orbs — Açaí + Solimões */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '25%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '720px', height: '720px',
          background: 'radial-gradient(circle, rgba(109,40,168,0.14) 0%, transparent 68%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: '380px', height: '380px',
          background: 'radial-gradient(circle, rgba(200,147,58,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', top: '60%', left: '5%',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Specialty pills — Açaí palette */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          justifyContent: 'center',
          marginBottom: '1.8rem',
          animation: 'fadeDown 0.55s ease both',
        }}>
          {t.specialties.map((s, i) => (
            <span key={i} style={{
              background: 'rgba(109,40,168,0.10)',
              border: '1px solid rgba(168,85,247,0.25)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#c4b5fd',
            }}>{s}</span>
          ))}
        </div>

        {/* Eyebrow — Solimões */}
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: S.solimoesLight,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '1.2rem',
          animation: 'fadeDown 0.6s ease 0.05s both',
        }}>
          {t.hero_eyebrow}
        </div>

        {/* H1 */}
        <h1
          id="hero-heading"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(2.2rem, 5.5vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: '1.6rem',
            color: '#f8fafc',
            animation: 'fadeUp 0.7s ease 0.1s both',
            maxWidth: '820px',
          }}
        >
          {t.hero_title_1}{' '}
          <span style={{
            background: S.acaiGrad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {t.hero_title_2}
          </span>
          <br />
          <span style={{
            background: S.solimoesGrad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>{t.hero_title_accent}</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          maxWidth: '620px',
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: '#94a3b8',
          lineHeight: 1.75,
          marginBottom: '3rem',
          animation: 'fadeUp 0.7s ease 0.18s both',
        }}>
          {t.hero_subtitle}
        </p>

        {/* CTA Group */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
          animation: 'fadeUp 0.7s ease 0.26s both',
        }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
              id="showcase-cta-primary"
              onClick={() => setIsModalOpen(true)}
              style={{
                background: S.acaiGrad,
                color: '#fff',
                padding: '16px 36px',
                borderRadius: '50px',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 8px 32px rgba(109,40,168,0.50)',
                transition: 'all 0.25s',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '52px',
                border: 'none',
                animation: 'acaiPulse 3s ease-in-out infinite',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(168,85,247,0.65)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(109,40,168,0.50)';
              }}
            >
              {t.hero_cta_primary}
              <ArrowIcon />
            </button>
            <a
              href="/#/login?from=showcase"
              id="showcase-cta-secondary"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#e2e8f0',
                padding: '16px 36px',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '1rem',
                border: `1px solid ${S.border}`,
                transition: 'all 0.25s',
                cursor: 'pointer',
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = S.border;
              }}
            >
              {t.hero_cta_secondary}
            </a>
          </div>
          <p style={{ color: S.slateDim, fontSize: '0.8rem', fontWeight: 500 }}>
            {t.hero_cta_sub}
          </p>
        </div>

        {/* Metrics bar — Açaí */}
        <div style={{
          marginTop: '5rem',
          background: 'rgba(109,40,168,0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(109,40,168,0.18)',
          borderRadius: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          overflow: 'hidden',
          animation: 'fadeUp 0.7s ease 0.38s both',
          maxWidth: '720px',
          width: '100%',
        }}>
          {t.metrics.map((m, i) => (
            <div
              key={i}
              style={{
                padding: '22px 32px',
                textAlign: 'center',
                borderRight: i < t.metrics.length - 1 ? '1px solid rgba(109,40,168,0.15)' : 'none',
                flex: '1 1 140px',
              }}
            >
              <div style={{
                fontSize: '1.9rem',
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                background: i % 2 === 0 ? S.acaiGrad : S.solimoesGrad,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '4px',
              }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: S.textMuted, fontWeight: 500, lineHeight: 1.4 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* V5.3: Badge de credibilidade removido da Hero — exibido no footer com contexto correto. */}

        {/* ── Demo Video Placeholder ─────────────────────────────────────── */}
        <div style={{
          marginTop: '4rem',
          width: '100%',
          maxWidth: '860px',
          animation: 'fadeUp 0.8s ease 0.6s both',
        }}>
          <div className="screen-mock">
            <div className="scanline" />
            {/* Fake window chrome */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '28px', zIndex: 4,
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28C840' }} />
              <span style={{ marginLeft: '8px', fontSize: '0.64rem', color: S.textMuted, fontFamily: 'monospace' }}>
                hub.encontrodagua.com — CRM Dashboard
              </span>
            </div>
            {/* Video body — Açaí theme */}
            <div style={{
              height: '300px', paddingTop: '28px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '14px',
              background: 'linear-gradient(180deg, #180B2E 0%, #0A0320 100%)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(109,40,168,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(109,40,168,0.06) 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px',
              }} />
              <button
                id="showcase-video-play"
                onClick={() => { trackShowcaseCTA('video_play'); setIsModalOpen(true); }}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'rgba(109,40,168,0.15)',
                  border: '2px solid rgba(168,85,247,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.3s',
                  position: 'relative', zIndex: 2,
                  boxShadow: '0 0 40px rgba(109,40,168,0.25)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(109,40,168,0.35)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(109,40,168,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#A855F7">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
              <p style={{ color: S.textSecondary, fontSize: '0.84rem', fontWeight: 500, position: 'relative', zIndex: 2 }}>
                {lang === 'pt' ? '💜 Demo interativa disponível — clique para agendar' : '💜 Interactive demo available — click to schedule'}
              </p>
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                {['Contatos', 'Board SDR', 'IA Mazô', 'Reports'].map((label, i) => (
                  <div key={i} style={{
                    flex: 1, height: '3px', borderRadius: '2px',
                    background: i === 0 ? '#A855F7' : `rgba(168,85,247,${0.15 + i * 0.12})`,
                  }} />
                ))}
              </div>
            </div>
          </div>
          <p style={{ color: S.textMuted, fontSize: '0.72rem', marginTop: '10px', textAlign: 'center' }}>
            {lang === 'pt' ? 'Vídeo completo em produção · Clique para agendar demo ao vivo' : 'Full video in production · Click to schedule a live demo'}
          </p>
        </div>

        {/* ── CRM Screenshots Grid ───────────────────────────────────────── */}
        <div style={{
          marginTop: '2.5rem',
          maxWidth: '860px', width: '100%',
          animation: 'fadeUp 0.8s ease 0.7s both',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: lang === 'pt' ? 'Board Kanban' : 'Kanban Board', icon: '📋', color: '#A855F7' },
              { label: lang === 'pt' ? 'Contatos + IA' : 'Contacts + AI', icon: '🧠', color: '#C4B5FD' },
              { label: lang === 'pt' ? 'Dashboard Analytics' : 'Analytics', icon: '📊', color: '#F59E0B' },
            ].map((screen, i) => (
              <div key={i} className="screen-mock" style={{ cursor: 'pointer' }}
                onClick={() => { trackShowcaseCTA(`screenshot_${screen.label}`); setIsModalOpen(true); }}
              >
                <div className="scanline" />
                <div style={{
                  height: '110px', paddingTop: '28px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: 'linear-gradient(180deg, #180B2E 0%, #0A0320 100%)',
                }}>
                  <div style={{ fontSize: '1.8rem' }}>{screen.icon}</div>
                  <span style={{ fontSize: '0.68rem', color: screen.color, fontWeight: 600 }}>{screen.label}</span>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
                    {[60,90,45,75,100,65,80].map((h, j) => (
                      <div key={j} style={{
                        width: '3px', height: `${h * 0.16}px`, borderRadius: '2px',
                        background: `rgba(168,85,247,${0.2 + h / 200})`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: S.textMuted, fontSize: '0.72rem', marginTop: '8px', textAlign: 'center' }}>
            {lang === 'pt' ? 'Prints reais do CRM em produção · hub.encontrodagua.com' : 'Real screenshots from production CRM · hub.encontrodagua.com'}
          </p>
        </div>
      </section>

      {/* ── SEGMENTAÇÃO: Escolha seu caminho ───────────────────────────── */}
      <section
        id="sec-segmentacao"
        data-obs
        aria-labelledby="segmentacao-heading"
        style={{
          padding: 'clamp(4rem, 8vw, 5rem) 1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          ...fadeIn('sec-segmentacao'),
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '20px',
            padding: '6px 18px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: S.emerald,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            {lang === 'pt' ? 'Para quem é' : 'Who it\'s for'}
          </div>
          <h2
            id="segmentacao-heading"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 800,
              color: '#f8fafc',
              marginBottom: '1rem',
            }}
          >
            {lang === 'pt' ? 'Escolha seu caminho' : 'Choose your path'}
          </h2>
          <p style={{ color: S.slate, fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            {lang === 'pt'
              ? 'Cada profissional tem uma necessidade. Aqui vai a sua.'
              : 'Every professional has unique needs. Here\'s yours.'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {/* Card 1: Negócios & Projetos */}
          <div
            id="segment-negocios"
            style={{
              background: 'rgba(14,165,233,0.05)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '22px',
              padding: '32px 28px',
              transition: 'all 0.28s',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(14,165,233,0.45)';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(14,165,233,0.09)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(14,165,233,0.05)';
            }}
          >
            <div style={{ fontSize: '2.4rem' }} aria-hidden="true">🚀</div>
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.15rem', marginBottom: '8px' }}>
                {lang === 'pt' ? 'Negócios & Projetos' : 'Business & Projects'}
              </h3>
              <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                {lang === 'pt'
                  ? 'Para consultores, freelancers e startups. Gestão de leads com pipeline visual, automação SDR e privacidade LGPD nativa por empresa.'
                  : 'For consultants, freelancers and startups. Lead management with visual pipeline, SDR automation and native LGPD privacy per company.'}
              </p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <button
                id="segment-negocios-cta"
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: S.cyanBlue,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {lang === 'pt' ? '🚀 Quero testar 7 dias' : '🚀 Try 7 days free'}
              </button>
            </div>
          </div>

          {/* Card 2: Empreendedores */}
          <div
            id="segment-empreendedor"
            style={{
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '22px',
              padding: '32px 28px',
              transition: 'all 0.28s',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(16,185,129,0.09)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(16,185,129,0.05)';
            }}
          >
            <div style={{ fontSize: '2.4rem' }} aria-hidden="true">💼</div>
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.15rem', marginBottom: '8px' }}>
                {lang === 'pt' ? 'Empreendedores & Times' : 'Entrepreneurs & Teams'}
              </h3>
              <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                {lang === 'pt'
                  ? 'CRM com pipeline visual, IA para qualificação de leads, automação SDR e dashboards de conversão. Foco em vender mais, não em planilhas.'
                  : 'Visual pipeline CRM, AI lead qualification, SDR automation, and conversion dashboards. Focus on selling, not spreadsheets.'}
              </p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <button
                id="segment-empreendedor-cta"
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {lang === 'pt' ? '💼 Quero testar 7 dias' : '💼 Try 7 days free'}
              </button>
            </div>
          </div>

          {/* Card 3: Bonus — Link d'Agua (Accordion) */}
          <div
            id="segment-linkdagua"
            role="button"
            tabIndex={0}
            aria-expanded={linkDaguaOpen}
            onClick={() => setLinkDaguaOpen(v => !v)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLinkDaguaOpen(v => !v); }}
            style={{
              background: linkDaguaOpen ? 'rgba(200,147,58,0.09)' : 'rgba(200,147,58,0.05)',
              border: linkDaguaOpen ? '1px solid rgba(200,147,58,0.42)' : '1px solid rgba(200,147,58,0.20)',
              borderRadius: '22px',
              padding: '32px 28px',
              transition: 'all 0.3s',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              userSelect: 'none' as const,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '2.4rem' }} aria-hidden="true">🔗</div>
                <div>
                  <div style={{ display: 'inline-block', background: 'rgba(200,147,58,0.12)', border: '1px solid rgba(200,147,58,0.30)', borderRadius: '12px', padding: '3px 10px', fontSize: '0.68rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '5px' }}>
                    🎁 {lang === 'pt' ? 'Bonus Incluso' : 'Bonus Included'}
                  </div>
                  <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.05rem', margin: 0 }}>
                    {lang === 'pt' ? "Link d\u2019\u00c1gua \u2014 Cart\u00e3o Digital" : "Link d\u2019\u00c1gua \u2014 Digital Card"}
                  </h3>
                </div>
              </div>
              <span style={{ fontSize: '1rem', color: '#F59E0B', fontWeight: 700, transform: linkDaguaOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.32s ease', flexShrink: 0 }}>▼</span>
            </div>
            {!linkDaguaOpen && (
              <p style={{ color: S.slateDim, fontSize: '0.8rem', margin: 0 }}>
                {lang === 'pt' ? 'Clique para ver o bonus' : "Click to see the bonus"}
              </p>
            )}
            {linkDaguaOpen && (
              <div onClick={e => e.stopPropagation()} style={{ borderTop: '1px solid rgba(200,147,58,0.15)', paddingTop: '14px', cursor: 'default' }}>
                <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '14px' }}>
                  {lang === 'pt'
                    ? "Cart\u00e3o digital profissional + QR Code personalizado + microsite. Iniciativa de Start Digital."
                    : "Professional digital card + custom QR Code + bio microsite. A Start Digital initiative."}
                </p>
                <a
                  id="segment-linkdagua-cta"
                  href="https://link.encontrodagua.com/vitrine"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: S.solimoesGrad, color: '#000', border: 'none', borderRadius: '30px', padding: '12px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', width: '100%', transition: 'all 0.2s', display: 'block', textAlign: 'center' as const }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {lang === 'pt' ? "🔗 Conhecer o Link d\u2019\u00c1gua" : "🔗 Learn about Link d\u2019\u00c1gua"}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Pain Points ─────────────────────────────────────── */}
      <section
        id="sec-pain"
        data-obs
        aria-labelledby="pain-heading"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          ...fadeIn('sec-pain'),
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2
            id="pain-heading"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              marginBottom: '0.8rem',
            }}
          >
            {t.pain_title}
          </h2>
          <p style={{ color: S.slate, fontSize: '1rem' }}>{t.pain_subtitle}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {t.pain_items.map((item, i) => (
            <div
              key={i}
              id={`pain-${i}`}
              style={{
                background: S.surface,
                border: `1px solid ${S.border}`,
                borderRadius: '18px',
                padding: '28px 24px',
                transition: 'all 0.25s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = S.surfaceHover;
                e.currentTarget.style.borderColor = S.borderHover;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = S.surface;
                e.currentTarget.style.borderColor = S.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontSize: '2rem',
                width: '52px', height: '52px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: '14px',
                marginBottom: '16px',
              }} aria-hidden="true">
                {item.icon}
              </div>
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules ─────────────────────────────────────────── */}
      <section
        id="sec-modules"
        data-obs
        aria-labelledby="modules-heading"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
          background: 'rgba(0,0,0,0.15)',
          ...fadeIn('sec-modules'),
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2
              id="modules-heading"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                color: '#f1f5f9',
                marginBottom: '0.8rem',
              }}
            >
              {t.modules_title}
            </h2>
            <p style={{ color: S.slate, fontSize: '0.95rem' }}>{t.modules_subtitle}</p>
          </div>

          {/* ── BLOCO A: Funcionalidades Nativas ───────────────── */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.4rem' }}>
              <div style={{ background: S.acaiGrad, borderRadius: '10px', padding: '4px 16px', fontSize: '0.72rem', fontWeight: 800, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>A</div>
              <h3 style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '1.05rem', margin: 0 }}>{t.modules_group_native}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '11px', marginBottom: '1.4rem' }}>
              {t.modules.filter(m => m.group === 'native').map((mod, i) => (
                <div key={`native-${i}`} id={`mod-native-${i}`}
                  style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: '16px', padding: '18px 16px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.22s', cursor: 'default' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = S.surfaceHover; e.currentTarget.style.borderColor = S.borderHover; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = S.surface; e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '1.45rem', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(109,40,168,0.12)', borderRadius: '10px', flexShrink: 0 }} aria-hidden="true">{mod.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' as const }}>
                      <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.87rem' }}>{mod.name}</span>
                      <span style={{ background: mod.badge === 'IA' || mod.badge === 'AI' ? 'rgba(139,92,246,0.2)' : 'rgba(16,185,129,0.15)', color: mod.badge === 'IA' || mod.badge === 'AI' ? '#a78bfa' : S.neonGreen, borderRadius: '7px', padding: '2px 6px', fontSize: '0.64rem', fontWeight: 800 }}>
                        {mod.badge === 'IA' || mod.badge === 'AI' ? '✦ IA' : `✓ ${mod.badge}`}
                      </span>
                    </div>
                    <p style={{ color: S.slateDim, fontSize: '0.79rem', margin: 0 }}>{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Crédito BLOCO A */}
            <p style={{ fontSize: '0.79rem', color: S.textMuted, fontStyle: 'italic', borderLeft: `3px solid ${S.borderGold}`, paddingLeft: '14px', lineHeight: 1.65, maxWidth: '700px', margin: 0 }}>📌 {t.modules_credit}</p>
          </div>

          {/* ── BLOCO B: Hub Personalizado ─────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.4rem' }}>
              <div style={{ background: S.solimoesGrad, borderRadius: '10px', padding: '4px 16px', fontSize: '0.72rem', fontWeight: 800, color: '#040308', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>B</div>
              <h3 style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '1.05rem', margin: 0 }}>{t.modules_group_custom}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: '11px', marginBottom: '1.4rem' }}>
              {t.modules.filter(m => m.group === 'custom').map((mod, i) => (
                <div key={`custom-${i}`} id={`mod-custom-${i}`}
                  style={{ background: S.surfaceWarm, border: `1px solid ${S.borderGold}`, borderRadius: '16px', padding: '18px 16px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.22s', cursor: 'default' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,147,58,0.12)'; e.currentTarget.style.borderColor = S.borderGoldHov; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = S.surfaceWarm; e.currentTarget.style.borderColor = S.borderGold; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '1.45rem', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(200,147,58,0.12)', borderRadius: '10px', flexShrink: 0 }} aria-hidden="true">{mod.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' as const }}>
                      <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.87rem' }}>{mod.name}</span>
                      <span style={{ background: 'rgba(200,147,58,0.2)', color: S.solimoesLight, borderRadius: '7px', padding: '2px 6px', fontSize: '0.64rem', fontWeight: 800 }}>✦ {mod.badge}</span>
                    </div>
                    <p style={{ color: S.slateDim, fontSize: '0.79rem', margin: 0 }}>{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Pitch BLOCO B */}
            <div style={{ background: S.surfaceWarm, border: `1px solid ${S.borderGold}`, borderRadius: '14px', padding: '18px 22px', maxWidth: '700px' }}>
              <p style={{ fontSize: '0.9rem', color: '#f1d98c', fontWeight: 600, margin: 0, lineHeight: 1.65 }}>💎 {t.modules_pitch}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section
        id="sec-faq"
        data-obs
        aria-labelledby="faq-heading"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
          maxWidth: '860px',
          margin: '0 auto',
          ...fadeIn('sec-faq'),
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            id="faq-heading"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              marginBottom: '0.8rem',
            }}
          >
            {t.faq_title}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.isArray(t.faq_items) && t.faq_items.map((item, i) => (
            <div
              key={i}
              style={{
                background: faqOpen === i ? S.surfaceHover : S.surface,
                border: `1px solid ${faqOpen === i ? S.borderHover : S.border}`,
                borderRadius: '14px',
                overflow: 'hidden',
                transition: 'all 0.25s',
              }}
            >
              <button
                id={`faq-item-${i}`}
                aria-expanded={faqOpen === i}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.q}
                <span style={{
                  fontSize: '1.4rem',
                  color: S.acaiLight,
                  transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.28s ease',
                  flexShrink: 0,
                  lineHeight: 1,
                }} aria-hidden="true">+</span>
              </button>
              {faqOpen === i && (
                <div style={{
                  padding: '0 22px 20px',
                  color: S.slate,
                  fontSize: '0.9rem',
                  lineHeight: 1.75,
                  borderTop: `1px solid ${S.border}`,
                  paddingTop: '14px',
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── QA & Segurança ─────────────────────────────────────────────── */}
      <section
        id="sec-qa"
        data-obs
        aria-labelledby="qa-heading"
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
          background: 'rgba(0,0,0,0.15)',
          ...fadeIn('sec-qa'),
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Accordion Header — always visible */}
          <button
            onClick={() => setQaOpen(prev => !prev)}
            style={{
              width: '100%',
              background: qaOpen ? 'rgba(109,40,168,0.10)' : 'rgba(109,40,168,0.05)',
              border: `1px solid ${qaOpen ? S.border : 'rgba(109,40,168,0.08)'}`,
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'all 0.22s',
              textAlign: 'left',
            }}
            aria-expanded={qaOpen}
            aria-controls="qa-content"
          >
            <div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: S.acaiLight,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>{t.qa_eyebrow}</div>
              <h2 id="qa-heading" style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                fontWeight: 800,
                color: '#f1f5f9',
                margin: 0,
              }}>{t.qa_title}</h2>
              <p style={{ color: S.slate, fontSize: '0.88rem', margin: '4px 0 0' }}>{t.qa_subtitle}</p>
            </div>
            <span style={{
              fontSize: '1.4rem',
              color: S.acaiLight,
              transform: qaOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              flexShrink: 0,
            }} aria-hidden="true">▾</span>
          </button>

          {/* Collapsible content */}
          <div
            id="qa-content"
            style={{
              overflow: 'hidden',
              maxHeight: qaOpen ? '2000px' : '0px',
              transition: 'max-height 0.4s ease',
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '14px',
              paddingTop: '1.5rem',
            }}>
              {Array.isArray(t.qa_items) && t.qa_items.map((item, i) => (
                <div
                  key={i}
                  id={`qa-item-${i}`}
                  style={{
                    background: 'rgba(109,40,168,0.06)',
                    border: '1px solid rgba(16,185,129,0.20)',
                    borderRadius: '16px',
                    padding: '24px 22px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    transition: 'all 0.22s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.20)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(16,185,129,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    color: S.neonGreen,
                  }} aria-hidden="true">
                    <ShieldIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{item.title}</span>
                      <span style={{
                        background: 'rgba(16,185,129,0.15)',
                        color: S.neonGreen,
                        borderRadius: '8px',
                        padding: '2px 8px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                      }}>✓ {item.status}</span>
                    </div>
                    <p style={{ color: S.slateDim, fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Arquitetura Técnica ─────────────────────────────────────────────── */}
      <section
        id="sec-tech"
        data-obs
        aria-labelledby="tech-heading"
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          ...fadeIn('sec-tech'),
        }}
      >
        {/* Accordion Header */}
        <button
          onClick={() => setTechOpen(prev => !prev)}
          style={{
            width: '100%',
            background: techOpen ? 'rgba(200,147,58,0.08)' : 'rgba(200,147,58,0.04)',
            border: `1px solid ${techOpen ? S.borderGold : 'rgba(200,147,58,0.08)'}`,
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            transition: 'all 0.22s',
            textAlign: 'left',
          }}
          aria-expanded={techOpen}
          aria-controls="tech-content"
        >
          <h2 id="tech-heading" style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            fontWeight: 800,
            color: '#f1f5f9',
            margin: 0,
          }}>{t.tech_title}</h2>
          <span style={{
            fontSize: '1.4rem',
            color: S.solimoes,
            transform: techOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            flexShrink: 0,
          }} aria-hidden="true">▾</span>
        </button>

        {/* Collapsible grid */}
        <div
          id="tech-content"
          style={{
            overflow: 'hidden',
            maxHeight: techOpen ? '1200px' : '0px',
            transition: 'max-height 0.4s ease',
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
            paddingTop: '1.5rem',
          }}>
            {Array.isArray(t.tech_stack) && t.tech_stack.map((tech, i) => (
              <div
                key={i}
                style={{
                  background: S.surface,
                  border: `1px solid ${S.borderGold}`,
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.22s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = S.surfaceWarm;
                  e.currentTarget.style.borderColor = S.borderGoldHov;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = S.surface;
                  e.currentTarget.style.borderColor = S.borderGold;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }} aria-hidden="true">{tech.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>{tech.name}</div>
                  <div style={{ fontSize: '0.72rem', color: S.solimoes, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{tech.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── 7-Day Trial CTA — The Hero Closer ───────────────── */}
      <section
        id="sec-trial"
        data-obs
        aria-labelledby="trial-heading"
        style={{
          padding: 'clamp(5rem, 10vw, 8rem) 1.5rem',
          ...fadeIn('sec-trial'),
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {/* Glassmorphism card */}
          <div style={{
            background: 'rgba(14,165,233,0.07)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(14,165,233,0.22)',
            borderRadius: '28px',
            padding: 'clamp(2.5rem, 6vw, 4rem) clamp(2rem, 5vw, 3.5rem)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Inner glow */}
            <div aria-hidden="true" style={{
              position: 'absolute',
              top: '-60%', left: '50%',
              transform: 'translateX(-50%)',
              width: '500px', height: '300px',
              background: 'radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Stars */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '3px',
              marginBottom: '1.2rem',
              color: '#fbbf24',
            }} aria-label="5 stars">
              {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
            </div>

            <h2
              id="trial-heading"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 900,
                color: '#f8fafc',
                marginBottom: '1rem',
                lineHeight: 1.15,
                position: 'relative',
              }}
            >
              {t.trial_title}
            </h2>
            <p style={{
              color: '#94a3b8',
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              lineHeight: 1.7,
              marginBottom: '2.4rem',
              maxWidth: '560px',
              margin: '0 auto 2.4rem',
              position: 'relative',
            }}>
              {t.trial_subtitle}
            </p>

            {/* Feature checklist */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '10px',
              marginBottom: '2.8rem',
              textAlign: 'left',
              position: 'relative',
            }}>
              {t.trial_features.map((feat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.88rem',
                  color: '#cbd5e1',
                  fontWeight: 500,
                }}>
                  <div style={{
                    width: '20px', height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: S.emerald,
                    flexShrink: 0,
                  }}>
                    <CheckIcon />
                  </div>
                  {feat}
                </div>
              ))}
            </div>

            {/* CTAs Wrapper */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              {/* Primary CTA 1 - Trial */}
              <a
                href="/#/login?from=showcase"
                id="showcase-trial-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: S.cyanBlue,
                  color: '#fff',
                  padding: '16px 36px',
                  borderRadius: '50px',
                  fontWeight: 800,
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                  boxShadow: '0 12px 48px rgba(14,165,233,0.48)',
                  transition: 'all 0.28s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 22px 64px rgba(14,165,233,0.65)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 12px 48px rgba(14,165,233,0.48)';
                }}
              >
                {t.trial_cta || 'Experimentar 7 dias'}
                <ArrowIcon />
              </a>

              {/* Primary CTA 2 - Amazô */}
              <button
                onClick={() => {
                   if (typeof window !== 'undefined' && (window as any).Typebot) {
                      try { (window as any).Typebot.open(); } catch(e){}
                   }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: S.emerald,
                  color: '#060C08',
                  padding: '16px 36px',
                  borderRadius: '50px',
                  fontWeight: 800,
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                  boxShadow: '0 12px 48px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.28s',
                  cursor: 'pointer',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 22px 64px rgba(16, 185, 129, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 12px 48px rgba(16, 185, 129, 0.4)';
                }}
              >
                <img src="/logos/logo-icon-gold-transp.png" alt="Hub AI" style={{ width: '18px', height: '18px', filter: 'brightness(0) invert(1)' }} /> Falar com a Amazô 
              </button>

              {/* Secondary CTA - WhatsApp Business (Lidi Moura - gestão humana) */}
              <a
                href={`https://wa.me/5541992557600?text=${encodeURIComponent('Olá, Lidi! Estou testando a demo e tenho uma dúvida sobre a personalização para o meu negócio.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'transparent',
                  border: `2px solid ${S.emerald}`,
                  color: S.emerald,
                  padding: '14px 34px',
                  borderRadius: '50px',
                  fontWeight: 800,
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                  transition: 'all 0.28s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                WhatsApp Suporte
              </a>
            </div>

            <p style={{
              color: S.slateDim,
              fontSize: '0.8rem',
              margin: 0,
              position: 'relative',
            }}>
              {t.trial_sub}
            </p>
          </div>
        </div>
      </section>

      <footer style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        borderTop: `1px solid ${S.border}`,
        background: 'rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          <img src="/logos/logo-icon-gold-transp.png" alt="Encontro d'Água Hub" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <span style={{ color: S.textSecondary, fontSize: '0.88rem', fontWeight: 600 }}>{t.footer_built}</span>
        </div>
        {/* Bio contextualizada — lugar correto */}
        <p style={{ color: S.slateDim, fontSize: '0.78rem', margin: '4px 0 12px' }}>
          🎓 Lidi Moura — Formada em Psicologia e Especialista em Dados · Certificações OCI, IA &amp; MySQL
        </p>
        {/* Links sociais */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
          <a
            href="https://github.com/encontro-dagua-hub"
            target="_blank" rel="noopener noreferrer"
            style={{ color: S.slateDim, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = S.acaiLight; }}
            onMouseLeave={e => { e.currentTarget.style.color = S.slateDim; }}
          >
            ⚙ GitHub Org
          </a>
          <a
            href="https://github.com/lidimoura"
            target="_blank" rel="noopener noreferrer"
            style={{ color: S.slateDim, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = S.acaiLight; }}
            onMouseLeave={e => { e.currentTarget.style.color = S.slateDim; }}
          >
            👩‍💻 GitHub (Lidi)
          </a>
          <a
            href="https://www.linkedin.com/company/encontro-d-agua-hub/"
            target="_blank" rel="noopener noreferrer"
            style={{ color: S.slateDim, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0A66C2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = S.slateDim; }}
          >
            💼 LinkedIn
          </a>
          <a
            href={`https://wa.me/5541992557600?text=${encodeURIComponent('Olá, Lidi! Estou testando a demo e tenho uma dúvida sobre a personalização para o meu negócio.')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ color: S.slateDim, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#25D366'; }}
            onMouseLeave={e => { e.currentTarget.style.color = S.slateDim; }}
          >
            💬 Suporte
          </a>
        </div>
        <p style={{ color: S.slateDim, fontSize: '0.72rem', margin: 0 }}>{t.footer_privacy}</p>
        <p style={{ color: S.slateDim, fontSize: '0.68rem', margin: '4px 0 0' }}>
          {t.footer_version}
        </p>
      </footer>
      {/* ── Lead Capture Modal ────────────────────────────────────────────── */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="provadagua"
        prefilledData={{ interest: 'provadagua_trial' }}
      />
    </div>
  );
};

export default ShowcasePage;
