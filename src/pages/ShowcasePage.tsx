import React, { useState, useEffect, useRef } from 'react';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { initGA4, trackShowcaseCTA, trackLeadCapture } from '@/lib/analytics';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  modules: Array<{ icon: string; name: string; desc: string; badge: string }>;
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

// â”€â”€â”€ SVG Icon Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ i18n Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TRANSLATIONS: Record<'pt' | 'en', Translation> = {
  pt: {
    nav_login: 'Entrar no Hub',
    hero_eyebrow: 'Para Empreendedores Â· Profissionais Liberais Â· Agentes e ConsultÃ³rios',
    hero_title_1: 'O CRM com IA que',
    hero_title_2: 'organiza seus clientes e projetos',
    hero_title_accent: 'e faz sua operaÃ§Ã£o crescer.',
    hero_subtitle:
      'Encontro D\'Ãgua Hub Ã© o sistema operacional de gestÃ£o para profissionais e empreendedores. AutomaÃ§Ã£o de leads, IA embarcada, isolamento total de dados por empresa e conformidade com LGPD â€” tudo em um Ãºnico hub.',
    hero_cta_primary: 'Experimente a ProvadÃ¡gua por 7 dias',
    hero_cta_secondary: 'Ver demonstraÃ§Ã£o ao vivo',
    hero_cta_sub: 'GestÃ£o de Elite com Privacidade OCI Â· Sem cartÃ£o de crÃ©dito Â· Dados 100% isolados',
    trust_label: 'Confiado por profissionais e empreendedores',
    specialties: ['SaÃºde', 'Consultoria', 'Empreendedores', 'Profissionais Liberais', 'AgÃªncias'],
    metrics: [
      { value: '100%', label: 'Dados Isolados por Empresa', icon: 'ðŸ”’' },
      { value: '9', label: 'MÃ³dulos em ProduÃ§Ã£o', icon: 'âš¡' },
      { value: '4', label: 'Agentes de IA Ativos', icon: 'ðŸ¤–' },
      { value: '24/7', label: 'SDR Automatizado', icon: 'ðŸ“¡' },
    ],
    pain_title: 'VocÃª reconhece esses problemas?',
    pain_subtitle: 'Criamos soluÃ§Ãµes especÃ­ficas para a realidade de quem lidera um negÃ³cio ou carreira independente',
    pain_items: [
      {
        icon: 'ðŸ“',
        title: 'Dados de clientes e leads espalhados',
        desc: 'Planilhas, WhatsApp, e-mail e papel â€” impossÃ­vel acompanhar sem um sistema centralizado e seguro.',
      },
      {
        icon: 'â°',
        title: 'Tempo perdido em tarefas manuais',
        desc: 'Agendamentos, follow-ups e lembretes consomem horas que deveriam ser dedicadas a seus clientes e projetos.',
      },
      {
        icon: 'ðŸš«',
        title: 'Risco de vazamento de dados (LGPD)',
        desc: 'Softwares genÃ©ricos nÃ£o foram projetados para a privacidade que seu negÃ³cio exige. Seus dados estÃ£o vulnerÃ¡veis.',
      },
      {
        icon: 'ðŸ“Š',
        title: 'NÃ£o conseguir gerenciar seus clientes e projetos?',
        desc: 'Sem visibilidade do pipeline, sem follow-up automÃ¡tico e sem relatÃ³rios â€” vocÃª perde negÃ³cios sem nem perceber. O ecossistema ProvadÃ¡gua centraliza tudo.',
      },
    ],
    modules_title: 'Funcionalidades',
    modules_subtitle: 'Oferecemos uma base sÃ³lida de CRM que Ã© totalmente personalizada de acordo com a demanda de cada cliente. Usamos o prÃ³prio CRM do Hub como portfÃ³lio vivo dessa personalizaÃ§Ã£o.',
    modules_group_native: 'Nativas do CRM Base',
    modules_group_custom: 'ImplementaÃ§Ãµes Personalizadas do Hub',
    modules: [
      { icon: 'ðŸ“‹', name: 'Board Kanban', desc: 'Leads e oportunidades mapeados ao funil automaticamente', badge: 'Ativo', group: 'native' },
      { icon: 'ðŸ‘¥', name: 'Contatos', desc: 'Base de clientes e leads com sync bidirecional', badge: 'Ativo', group: 'native' },
      { icon: 'ðŸ’¬', name: 'Inbox / MazÃ´', desc: 'Agente IA de Customer Success para atender e qualificar', badge: 'IA', group: 'native' },
      { icon: 'âš–ï¸', name: 'Jury', desc: 'Contratos BR + Common Law', badge: 'Ativo', group: 'native' },
      { icon: 'ðŸ’°', name: 'Precy', desc: 'PrecificaÃ§Ã£o BRL/USD/EUR', badge: 'Ativo', group: 'native' },
      { icon: 'ðŸ“±', name: 'QR D\'Ã¡gua', desc: 'QR Codes + Bridge Pages para cartÃµes digitais', badge: 'Ativo', group: 'native' },
      { icon: 'ðŸ“Š', name: 'Reports', desc: 'Pipeline + Win/Loss em tempo real', badge: 'Ativo', group: 'native' },
      { icon: 'ðŸ§ª', name: 'Prompt Lab', desc: 'IA multi-persona para criaÃ§Ã£o de prompts e conteÃºdo', badge: 'IA', group: 'custom' },
      { icon: 'ðŸ”§', name: 'Admin', desc: 'UsuÃ¡rios, Tech Stack, Super Admin e multi-tenant', badge: 'Ativo', group: 'custom' },
    ],
    qa_eyebrow: 'Auditoria V3.0 â€” Abril 2026',
    qa_title: 'RelatÃ³rio de QA & SeguranÃ§a',
    qa_subtitle: 'TransparÃªncia tÃ©cnica Ã© parte da nossa proposta de valor',
    qa_items: [
      {
        icon: 'shield',
        title: 'Isolamento Multi-Tenant',
        status: 'APROVADO',
        desc: 'company_id RLS ativo em todas as tabelas crÃ­ticas. Dados de cada empresa completamente separados.',
      },
      {
        icon: 'shield',
        title: 'Chaves de API Seguras',
        status: 'APROVADO',
        desc: 'SUPABASE_SERVICE_ROLE_KEY rotacionada e armazenada apenas em Vercel Secrets. Nunca exposta no repositÃ³rio.',
      },
      {
        icon: 'shield',
        title: 'Super Admin (Migration 038)',
        status: 'APROVADO',
        desc: 'Controle de acesso por hierarquia. is_super_admin com bypass de RLS apenas para operaÃ§Ãµes autorizadas.',
      },
      {
        icon: 'shield',
        title: 'Bilinguismo PT/EN',
        status: 'APROVADO',
        desc: 'Interface completa em portuguÃªs e inglÃªs. Toggle nativo em todos os mÃ³dulos.',
      },
      {
        icon: 'shield',
        title: 'Validade de Acesso',
        status: 'APROVADO',
        desc: 'access_expires_at por usuÃ¡rio. Acesso temporÃ¡rio com expiraÃ§Ã£o automÃ¡tica. Controle total do admin.',
      },
      {
        icon: 'shield',
        title: 'Isolamento Demo',
        status: 'APROVADO',
        desc: 'is_demo_data guard em todos os services. Dados de produÃ§Ã£o nunca vazam para o ambiente de demonstraÃ§Ã£o.',
      },
    ],
    tech_title: 'Arquitetura TÃ©cnica',
    tech_stack: [
      { icon: 'âš›', name: 'React 18 + TypeScript', category: 'Frontend' },
      { icon: 'ðŸ—„', name: 'Supabase + PostgreSQL', category: 'Backend' },
      { icon: 'ðŸ”', name: 'RLS Multi-Tenant', category: 'SeguranÃ§a' },
      { icon: 'ðŸ¤–', name: 'Google Gemini', category: 'IA Principal' },
      { icon: 'âš¡', name: 'Vite + TailwindCSS', category: 'Build' },
      { icon: 'ðŸŒ', name: 'Vercel Edge', category: 'Deploy Global' },
      { icon: 'ðŸ”„', name: 'TanStack Query', category: 'State' },
      { icon: 'â˜', name: 'Edge Functions', category: 'Serverless' },
    ],
    trial_title: 'Experimente a ProvadÃ¡gua por 7 dias',
    trial_subtitle: 'GestÃ£o de Elite com Privacidade OCI. O CRM personalizado para o seu negÃ³cio, com seguranÃ§a e automaÃ§Ã£o.',
    trial_features: [
      'Isolamento total de dados por empresa',
      '4 Agentes de IA inclusos',
      'SDR automatizado 24/7',
      'RelatÃ³rio de QA/SeguranÃ§a',
      'Suporte dedicado',
      'Cancele a qualquer momento',
    ],
    trial_cta: 'Experimente a ProvadÃ¡gua por 7 dias â€” GrÃ¡tis',
    trial_sub: 'GestÃ£o de Elite com Privacidade OCI Â· Setup em menos de 5 minutos Â· Cancele a qualquer momento',
    footer_built: 'ConstruÃ­do com â¤ï¸ pela equipe Encontro D\'Ãgua',
    footer_version: 'V5.4 â€” ProvadÃ¡gua',
    footer_privacy: 'Privacidade Â· LGPD Â· Termos',
  },
  en: {
    nav_login: 'Enter Hub',
    hero_eyebrow: 'For Entrepreneurs Â· Independent Professionals Â· Agencies',
    hero_title_1: 'The AI-powered CRM that',
    hero_title_2: 'organizes your clients and projects',
    hero_title_accent: 'and makes your operation grow.',
    hero_subtitle:
      'Encontro D\'Ãgua Hub is the management operating system for professionals and entrepreneurs. Lead automation, embedded AI, complete per-company data isolation, and LGPD/GDPR compliance â€” all in one hub.',
    hero_cta_primary: 'Try ProvadÃ¡gua for 7 days',
    hero_cta_secondary: 'Watch live demo',
    hero_cta_sub: 'Elite Management with OCI Privacy Â· No credit card Â· 100% isolated data',
    trust_label: 'Trusted by professionals and entrepreneurs',
    specialties: ['Health', 'Consulting', 'Entrepreneurs', 'Freelancers', 'Agencies'],
    metrics: [
      { value: '100%', label: 'Data Isolated per Company', icon: 'ðŸ”’' },
      { value: '9', label: 'Modules in Production', icon: 'âš¡' },
      { value: '4', label: 'Active AI Agents', icon: 'ðŸ¤–' },
      { value: '24/7', label: 'Automated SDR', icon: 'ðŸ“¡' },
    ],
    pain_title: 'Do you recognize these problems?',
    pain_subtitle: 'We built specific solutions for the real challenges of business leaders and independent professionals',
    pain_items: [
      {
        icon: 'ðŸ“',
        title: 'Client and lead data scattered everywhere',
        desc: 'Spreadsheets, WhatsApp, email, and paper â€” impossible to track without a centralized, secure system.',
      },
      {
        icon: 'â°',
        title: 'Time wasted on manual tasks',
        desc: 'Scheduling, follow-ups, and reminders consume hours that should be dedicated to your clients and projects.',
      },
      {
        icon: 'ðŸš«',
        title: 'Data breach risk (LGPD/GDPR)',
        desc: 'Generic software wasn\'t designed for the privacy your business requires. Your data is vulnerable.',
      },
      {
        icon: 'ðŸ“Š',
        title: "Can't manage your clients and projects?",
        desc: 'No pipeline visibility, no automatic follow-up, no reports â€” you lose business without even noticing. The ProvadÃ¡gua ecosystem centralizes everything.',
      },
    ],
    modules_title: 'Features',
    modules_subtitle: 'We provide a solid CRM base that is fully customized to each client\'s needs. We use the Hub CRM itself as a living portfolio of this customization.',
    modules_group_native: 'Native CRM Base',
    modules_group_custom: 'Hub Custom Implementations',
    modules: [
      { icon: 'ðŸ“‹', name: 'Kanban Board', desc: 'Leads and opportunities mapped to the funnel automatically', badge: 'Active', group: 'native' },
      { icon: 'ðŸ‘¥', name: 'Contacts', desc: 'Client and lead database with bidirectional sync', badge: 'Active', group: 'native' },
      { icon: 'ðŸ’¬', name: 'Inbox / MazÃ´', desc: 'AI Customer Success agent to attend and qualify leads', badge: 'AI', group: 'native' },
      { icon: 'âš–ï¸', name: 'Jury', desc: 'BR Contracts + Common Law', badge: 'Active', group: 'native' },
      { icon: 'ðŸ’°', name: 'Precy', desc: 'Pricing in BRL/USD/EUR', badge: 'Active', group: 'native' },
      { icon: 'ðŸ“±', name: 'QR D\'Ã¡gua', desc: 'QR Codes + Digital Business Cards', badge: 'Active', group: 'native' },
      { icon: 'ðŸ“Š', name: 'Reports', desc: 'Real-time Pipeline + Win/Loss', badge: 'Active', group: 'native' },
      { icon: 'ðŸ§ª', name: 'Prompt Lab', desc: 'Multi-persona AI for prompt and content creation', badge: 'AI', group: 'custom' },
      { icon: 'ðŸ”§', name: 'Admin', desc: 'Users, Tech Stack, Super Admin and multi-tenant', badge: 'Active', group: 'custom' },
    ],
    qa_eyebrow: 'V3.0 Audit â€” April 2026',
    qa_title: 'QA & Security Report',
    qa_subtitle: 'Technical transparency is part of our value proposition',
    qa_items: [
      {
        icon: 'shield',
        title: 'Multi-Tenant Isolation',
        status: 'PASSED',
        desc: 'company_id RLS active on all critical tables. Each clinic\'s data is completely separated.',
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
      { icon: 'âš›', name: 'React 18 + TypeScript', category: 'Frontend' },
      { icon: 'ðŸ—„', name: 'Supabase + PostgreSQL', category: 'Backend' },
      { icon: 'ðŸ”', name: 'RLS Multi-Tenant', category: 'Security' },
      { icon: 'ðŸ¤–', name: 'Google Gemini', category: 'Primary AI' },
      { icon: 'âš¡', name: 'Vite + TailwindCSS', category: 'Build' },
      { icon: 'ðŸŒ', name: 'Vercel Edge', category: 'Global Deploy' },
      { icon: 'ðŸ”„', name: 'TanStack Query', category: 'State' },
      { icon: 'â˜', name: 'Edge Functions', category: 'Serverless' },
    ],
    trial_title: 'Try ProvadÃ¡gua for 7 days',
    trial_subtitle: 'Elite Management with OCI-grade Privacy. The CRM built for health professionals who demand the highest standard of patient data security.',
    trial_features: [
      'Complete data isolation per clinic',
      '4 AI Agents included',
      'Automated SDR 24/7',
      'QA/Security Report',
      'Dedicated support',
      'Cancel anytime',
    ],
    trial_cta: 'Try ProvadÃ¡gua for 7 days â€” Free',
    trial_sub: 'Elite Management with OCI Privacy Â· Setup in under 5 minutes Â· Cancel anytime',
    footer_built: 'Built with â¤ by the Encontro D\'Ãgua team',
    footer_version: 'V5.3 â€” ProvadÃ¡gua Rebranding Complete',
    footer_privacy: 'Privacy Â· LGPD/GDPR Â· Terms',
  },
};

// â”€â”€â”€ Shared style tokens â€” Paleta V5.3: Rio Negro + AÃ§aÃ­ + SolimÃµes â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Rio Negro: preto profundo | AÃ§aÃ­: roxo neon | SolimÃµes: dourado/argila
const S = {
  // â”€â”€ Gradientes principais
  acaiGrad:      'linear-gradient(135deg, #6D28A8, #A855F7)',
  solimoesGrad:  'linear-gradient(135deg, #C8933A, #F59E0B)',
  acaiSolimoes:  'linear-gradient(135deg, #6D28A8, #A855F7, #C8933A)',
  // â”€â”€ Compat earthNeon â†’ AÃ§aÃ­ (manter compilaÃ§Ã£o de seÃ§Ãµes antigas)
  earthNeon:     'linear-gradient(135deg, #6D28A8, #A855F7)',
  earthWarm:     'linear-gradient(135deg, #C8933A, #F59E0B)',
  forestDeep:    'linear-gradient(135deg, #1A0A2E, #2D1B55)',
  // â”€â”€ Fundos
  obsidian:      '#040308',    // Rio Negro profundo
  // â”€â”€ Superficies glassmorphism
  surface:       'rgba(109, 40, 168, 0.05)',
  surfaceHover:  'rgba(109, 40, 168, 0.12)',
  surfaceWarm:   'rgba(200, 147, 58, 0.06)',
  // â”€â”€ Bordas
  border:        'rgba(109, 40, 168, 0.12)',
  borderHover:   'rgba(109, 40, 168, 0.40)',
  borderGold:    'rgba(200, 147, 58, 0.20)',
  borderGoldHov: 'rgba(200, 147, 58, 0.48)',
  // â”€â”€ Cores de destaque
  acai:          '#6D28A8',    // AÃ§aÃ­ roxo
  acaiLight:     '#A855F7',    // Neon violeta
  solimoes:      '#C8933A',    // SolimÃµes dourado/argila
  solimoesLight: '#F59E0B',    // Neon dourado
  neonGreen:     '#00C97B',    // Verde manutenÃ§Ã£o (CTA secondary)
  neonCyan:      '#A855F7',    // Redirecionado para violeta
  gold:          '#C8933A',
  goldLight:     '#F59E0B',
  // â”€â”€ Tipografia
  textPrimary:   '#F8FAFC',
  textSecondary: '#94a3b8',
  textMuted:     '#64748b',
  // â”€â”€ Compat legado
  cyanBlue:      'linear-gradient(135deg, #6D28A8, #A855F7)',
  navy:          '#040308',
  blue:          '#A855F7',
  emerald:       '#A855F7',
  slate:         '#94a3b8',
  slateDim:      '#64748b',
};

// â”€â”€â”€ ShowcasePage Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ShowcasePage: React.FC = () => {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [scrolled, setScrolled] = useState(false);
  const observedRef = useRef<Set<string>>(new Set());
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkDaguaOpen, setLinkDaguaOpen] = useState(false); // Accordion: BÃ´nus Link d'Ãgua

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target.id) {
            setVisible((prev) => new Set(prev).add(e.target.id));
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-obs]').forEach((el) => {
      if (el.id && !observedRef.current.has(el.id)) {
        obs.observe(el);
        observedRef.current.add(el.id);
      }
    });
    return () => obs.disconnect();
  }, []);

  const isVis = (id: string) => visible.has(id);

  const fadeIn = (id: string, delay = 0): React.CSSProperties => ({
    opacity: isVis(id) ? 1 : 0,
    transform: isVis(id) ? 'translateY(0)' : 'translateY(36px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
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

      {/* â”€â”€ CSS Keyframes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ Sticky Nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
        {/* Logo */}
        <a href="/#/" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div
            aria-hidden="true"
            style={{
              width: '34px', height: '34px',
              background: S.cyanBlue,
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 18px rgba(14,165,233,0.4)',
            }}
          >
            ðŸ’§
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: S.textPrimary, letterSpacing: '-0.01em' }}>
            Encontro Dâ€™Ãgua Hub
          </span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Lang toggle */}
          <button
            id="showcase-lang-toggle"
            aria-label={`Switch to ${lang === 'pt' ? 'English' : 'PortuguÃªs'}`}
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
            {lang === 'pt' ? 'ðŸ‡ºðŸ‡¸ EN' : 'ðŸ‡§ðŸ‡· PT'}
          </button>

          <a
            href="/#/login"
            id="showcase-nav-login"
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

      {/* â”€â”€ Hero Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
        {/* Background orbs â€” AÃ§aÃ­ + SolimÃµes */}
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

        {/* Specialty pills â€” AÃ§aÃ­ palette */}
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

        {/* Eyebrow â€” SolimÃµes */}
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
              href="/#/login"
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

        {/* Metrics bar â€” AÃ§aÃ­ */}
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

        {/* V5.3: Badge de credibilidade removido da Hero â€” exibido no footer com contexto correto. */}

        {/* â”€â”€ Demo Video Placeholder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                hub.encontrodagua.com â€” CRM Dashboard
              </span>
            </div>
            {/* Video body â€” AÃ§aÃ­ theme */}
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
                {lang === 'pt' ? 'ðŸ’œ Demo interativa disponÃ­vel â€” clique para agendar' : 'ðŸ’œ Interactive demo available â€” click to schedule'}
              </p>
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                {['Contatos', 'Board SDR', 'IA MazÃ´', 'Reports'].map((label, i) => (
                  <div key={i} style={{
                    flex: 1, height: '3px', borderRadius: '2px',
                    background: i === 0 ? '#A855F7' : `rgba(168,85,247,${0.15 + i * 0.12})`,
                  }} />
                ))}
              </div>
            </div>
          </div>
          <p style={{ color: S.textMuted, fontSize: '0.72rem', marginTop: '10px', textAlign: 'center' }}>
            {lang === 'pt' ? 'VÃ­deo completo em produÃ§Ã£o Â· Clique para agendar demo ao vivo' : 'Full video in production Â· Click to schedule a live demo'}
          </p>
        </div>

        {/* â”€â”€ CRM Screenshots Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div style={{
          marginTop: '2.5rem',
          maxWidth: '860px', width: '100%',
          animation: 'fadeUp 0.8s ease 0.7s both',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: lang === 'pt' ? 'Board Kanban' : 'Kanban Board', icon: 'ðŸ“‹', color: '#A855F7' },
              { label: lang === 'pt' ? 'Contatos + IA' : 'Contacts + AI', icon: 'ðŸ§ ', color: '#C4B5FD' },
              { label: lang === 'pt' ? 'Dashboard Analytics' : 'Analytics', icon: 'ðŸ“Š', color: '#F59E0B' },
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
            {lang === 'pt' ? 'Prints reais do CRM em produÃ§Ã£o Â· hub.encontrodagua.com' : 'Real screenshots from production CRM Â· hub.encontrodagua.com'}
          </p>
        </div>
      </section>

      {/* â”€â”€ SEGMENTAÃ‡ÃƒO: Escolha seu caminho â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
            {lang === 'pt' ? 'Para quem Ã©' : 'Who it\'s for'}
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
          {/* Card 1: SaÃºde */}
          <div
            id="segment-saude"
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
            <div style={{ fontSize: '2.4rem' }} aria-hidden="true">ðŸ©º</div>
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.15rem', marginBottom: '8px' }}>
                {lang === 'pt' ? 'SaÃºde & ConsultÃ³rio' : 'Health & Clinic'}
              </h3>
              <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                {lang === 'pt'
                  ? 'Para PsicÃ³logos, MÃ©dicos, Fisioterapeutas e terapeutas. GestÃ£o de leads com privacidade LGPD nativa, sem misturar dados de pacientes.'
                  : 'For Psychologists, Physicians, Physiotherapists. Lead management with native LGPD privacy, no patient data mixing.'}
              </p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <button
                id="segment-saude-cta"
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
                {lang === 'pt' ? 'ðŸ©º Quero testar 7 dias' : 'ðŸ©º Try 7 days free'}
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
            <div style={{ fontSize: '2.4rem' }} aria-hidden="true">ðŸ’¼</div>
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.15rem', marginBottom: '8px' }}>
                {lang === 'pt' ? 'Empreendedores & Times' : 'Entrepreneurs & Teams'}
              </h3>
              <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                {lang === 'pt'
                  ? 'CRM com pipeline visual, IA para qualificaÃ§Ã£o de leads, automaÃ§Ã£o SDR e dashboards de conversÃ£o. Foco em vender mais, nÃ£o em planilhas.'
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
                {lang === 'pt' ? 'ðŸ’¼ Quero testar 7 dias' : 'ðŸ’¼ Try 7 days free'}
              </button>
            </div>
          </div>

          {/* Card 3: Bonus â€” Link d'Agua (Accordion) */}
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
                <div style={{ fontSize: '2.4rem' }} aria-hidden="true">ðŸ”—</div>
                <div>
                  <div style={{ display: 'inline-block', background: 'rgba(200,147,58,0.12)', border: '1px solid rgba(200,147,58,0.30)', borderRadius: '12px', padding: '3px 10px', fontSize: '0.68rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '5px' }}>
                    ðŸŽ {lang === 'pt' ? 'Bonus Incluso' : 'Bonus Included'}
                  </div>
                  <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.05rem', margin: 0 }}>
                    {lang === 'pt' ? "Link d\u2019\u00c1gua \u2014 Cart\u00e3o Digital" : "Link d\u2019\u00c1gua \u2014 Digital Card"}
                  </h3>
                </div>
              </div>
              <span style={{ fontSize: '1rem', color: '#F59E0B', fontWeight: 700, transform: linkDaguaOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.32s ease', flexShrink: 0 }}>â–¼</span>
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
                  {lang === 'pt' ? "ðŸ”— Conhecer o Link d\u2019\u00c1gua" : "ðŸ”— Learn about Link d\u2019\u00c1gua"}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* â”€â”€ Pain Points â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ Modules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '14px',
          }}>
            {t.modules.map((mod, i) => (
              <div
                key={i}
                id={`mod-${i}`}
                style={{
                  background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRadius: '16px',
                  padding: '22px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.22s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = S.surfaceHover;
                  e.currentTarget.style.borderColor = S.borderHover;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = S.surface;
                  e.currentTarget.style.borderColor = S.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '1.6rem',
                  width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(14,165,233,0.1)',
                  borderRadius: '11px',
                  flexShrink: 0,
                }} aria-hidden="true">
                  {mod.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{mod.name}</span>
                    <span style={{
                      background: mod.badge === 'AI' ? 'rgba(139,92,246,0.2)' : 'rgba(16,185,129,0.15)',
                      color: mod.badge === 'AI' ? '#a78bfa' : S.emerald,
                      borderRadius: '8px',
                      padding: '2px 7px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                    }}>
                      {mod.badge === 'AI' ? 'âœ¦ AI' : `âœ“ ${mod.badge}`}
                    </span>
                  </div>
                  <p style={{ color: S.slateDim, fontSize: '0.8rem', margin: 0 }}>{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* â”€â”€ 7-Day Trial CTA â€” The Hero Closer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                href="/#/login"
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

              {/* Primary CTA 2 - AmazÃ´ */}
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
                <img src="/logos/logo-icon.png" alt="Hub AI" style={{ width: '18px', height: '18px', filter: 'brightness(0)' }} /> Falar com a AmazÃ´ 
              </button>

              {/* Secondary CTA - WhatsApp */}
              <a
                href="https://wa.me/5541992557600"
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
        background: S.cardBg, borderTop: `1px solid ${S.border}`,
        padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
          <img src="/logos/logo-icon-gold-transp.png" alt="Encontro D'Ãgua" style={{ height: '40px', objectFit: 'contain', marginBottom: '4px' }} />
          <span style={{ color: S.textSecondary, fontSize: '0.88rem', fontWeight: 600 }}>{t.footer_built}</span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="https://github.com/encontro-dagua" target="_blank" rel="noreferrer" style={{ color: S.textDim, fontSize: '0.8rem', textDecoration: 'none' }}>GitHub Org</a>
            <a href="https://www.linkedin.com/in/lidimoura" target="_blank" rel="noreferrer" style={{ color: S.textDim, fontSize: '0.8rem', textDecoration: 'none' }}>LinkedIn</a>
          </div>
          <p style={{ color: S.slateDim, fontSize: '0.72rem', margin: 0 }}>{t.footer_privacy}</p>
          <p style={{ color: S.slateDim, fontSize: '0.68rem', margin: 0 }}>{t.footer_version}</p>
        </div>
      </footer>
      {/* â”€â”€ Lead Capture Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
