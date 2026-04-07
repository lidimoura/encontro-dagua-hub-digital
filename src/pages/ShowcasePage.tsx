import React, { useState, useEffect, useRef } from 'react';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';

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
    hero_eyebrow: 'Para Médicos · Fisioterapeutas · Psicólogos',
    hero_title_1: 'O CRM com IA que',
    hero_title_2: 'protege seus pacientes',
    hero_title_accent: 'e faz crescer seu consultório.',
    hero_subtitle:
      'Encontro D\'Água Hub é o sistema operacional de gestão para clínicas e consultórios. Automação de leads, IA embarcada, isolamento total de dados por empresa e conformidade com LGPD — tudo em um único hub.',
    hero_cta_primary: 'Experimente a Provadágua por 7 dias',
    hero_cta_secondary: 'Ver demonstração ao vivo',
    hero_cta_sub: 'Gestão de Elite com Privacidade OCI · Sem cartão de crédito · Dados 100% isolados',
    trust_label: 'Confiado por profissionais de saúde',
    specialties: ['Medicina', 'Fisioterapia', 'Psicologia', 'Nutrição', 'Odontologia'],
    metrics: [
      { value: '100%', label: 'Dados Isolados por Empresa', icon: '🔒' },
      { value: '9', label: 'Módulos em Produção', icon: '⚡' },
      { value: '4', label: 'Agentes de IA Ativos', icon: '🤖' },
      { value: '24/7', label: 'SDR Automatizado', icon: '📡' },
    ],
    pain_title: 'Você reconhece esses problemas?',
    pain_subtitle: 'Criamos soluções específicas para a realidade do profissional de saúde',
    pain_items: [
      {
        icon: '📁',
        title: 'Dados de pacientes espalhados',
        desc: 'Planilhas, WhatsApp, e-mail e papel — impossível acompanhar sem um sistema centralizado e seguro.',
      },
      {
        icon: '⏰',
        title: 'Tempo perdido em tarefas manuais',
        desc: 'Agendamentos, follow-ups e lembretes consomem horas que deveriam ser dedicadas ao paciente.',
      },
      {
        icon: '🚫',
        title: 'Risco de vazamento de dados (LGPD)',
        desc: 'Softwares genéricos não foram projetados para a privacidade que a saúde exige. Sua clínica está vulnerável.',
      },
    ],
    modules_title: 'Módulos em Produção',
    modules_subtitle: 'Todos os módulos ativos em hub.encontrodagua.com — operando 24/7',
    modules: [
      { icon: '📋', name: 'Board Kanban', desc: 'Leads mapeados ao funil automaticamente', badge: 'Ativo' },
      { icon: '👥', name: 'Contatos', desc: 'Base de pacientes com sync bidirecional', badge: 'Ativo' },
      { icon: '📬', name: 'Inbox / Mazô', desc: 'Agente IA de Customer Success', badge: 'IA' },
      { icon: '⚖️', name: 'Jury', desc: 'Contratos BR + Common Law', badge: 'Ativo' },
      { icon: '💰', name: 'Precy', desc: 'Precificação BRL/USD/EUR', badge: 'Ativo' },
      { icon: '📱', name: 'QR D\'água', desc: 'QR Codes + Bridge Pages', badge: 'Ativo' },
      { icon: '📊', name: 'Reports', desc: 'Pipeline + Win/Loss real', badge: 'Ativo' },
      { icon: '🧪', name: 'Prompt Lab', desc: 'IA multi-persona', badge: 'IA' },
      { icon: '🔧', name: 'Admin', desc: 'Usuários, Tech Stack, Super Admin', badge: 'Ativo' },
    ],
    qa_eyebrow: 'Auditoria V3.0 — Abril 2026',
    qa_title: 'Relatório de QA & Segurança',
    qa_subtitle: 'Transparência técnica é parte da nossa proposta de valor',
    qa_items: [
      {
        icon: 'shield',
        title: 'Isolamento Multi-Tenant',
        status: 'APROVADO',
        desc: 'company_id RLS ativo em todas as tabelas críticas. Dados de cada clínica completamente separados.',
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
    trial_subtitle: 'Gestão de Elite com Privacidade OCI. O CRM feito para profissionais de saúde que não abrem mão da segurança dos seus pacientes.',
    trial_features: [
      'Isolamento total de dados por clínica',
      '4 Agentes de IA inclusos',
      'SDR automatizado 24/7',
      'Relatório de QA/Segurança',
      'Suporte dedicado',
      'Cancele a qualquer momento',
    ],
    trial_cta: 'Experimente a Provadágua por 7 dias — Grátis',
    trial_sub: 'Gestão de Elite com Privacidade OCI · Setup em menos de 5 minutos · Cancele a qualquer momento',
    footer_built: 'Construído com ❤ pela equipe Encontro D\'Água',
    footer_version: 'V3.0 — Provadágua Mission Complete',
    footer_privacy: 'Privacidade · LGPD · Termos',
  },
  en: {
    nav_login: 'Enter Hub',
    hero_eyebrow: 'For Physicians · Physiotherapists · Psychologists',
    hero_title_1: 'The AI-powered CRM that',
    hero_title_2: 'protects your patients',
    hero_title_accent: 'and grows your practice.',
    hero_subtitle:
      'Encontro D\'Água Hub is the practice management operating system for clinics and offices. Lead automation, embedded AI, complete per-company data isolation, and LGPD/GDPR compliance — all in one hub.',
    hero_cta_primary: 'Try Provadágua for 7 days',
    hero_cta_secondary: 'Watch live demo',
    hero_cta_sub: 'Elite Management with OCI Privacy · No credit card · 100% isolated data',
    trust_label: 'Trusted by health professionals',
    specialties: ['Medicine', 'Physiotherapy', 'Psychology', 'Nutrition', 'Dentistry'],
    metrics: [
      { value: '100%', label: 'Data Isolated per Company', icon: '🔒' },
      { value: '9', label: 'Modules in Production', icon: '⚡' },
      { value: '4', label: 'Active AI Agents', icon: '🤖' },
      { value: '24/7', label: 'Automated SDR', icon: '📡' },
    ],
    pain_title: 'Do you recognize these problems?',
    pain_subtitle: 'We built specific solutions for the real challenges of healthcare professionals',
    pain_items: [
      {
        icon: '📁',
        title: 'Patient data scattered everywhere',
        desc: 'Spreadsheets, WhatsApp, email, and paper — impossible to track without a centralized, secure system.',
      },
      {
        icon: '⏰',
        title: 'Time wasted on manual tasks',
        desc: 'Scheduling, follow-ups, and reminders consume hours that should be dedicated to your patients.',
      },
      {
        icon: '🚫',
        title: 'Data breach risk (GDPR/LGPD)',
        desc: 'Generic software wasn\'t designed for the privacy healthcare requires. Your practice is vulnerable.',
      },
    ],
    modules_title: 'Production Modules',
    modules_subtitle: 'All modules live at hub.encontrodagua.com — running 24/7',
    modules: [
      { icon: '📋', name: 'Kanban Board', desc: 'Leads auto-mapped to sales funnel', badge: 'Live' },
      { icon: '👥', name: 'Contacts', desc: 'Patient database with bidirectional sync', badge: 'Live' },
      { icon: '📬', name: 'Inbox / Mazô', desc: 'AI Customer Success Agent', badge: 'AI' },
      { icon: '⚖️', name: 'Jury', desc: 'BR + Common Law contracts', badge: 'Live' },
      { icon: '💰', name: 'Precy', desc: 'Pricing BRL/USD/EUR', badge: 'Live' },
      { icon: '📱', name: 'QR D\'água', desc: 'QR Codes + Bridge Pages', badge: 'Live' },
      { icon: '📊', name: 'Reports', desc: 'Pipeline + real Win/Loss', badge: 'Live' },
      { icon: '🧪', name: 'Prompt Lab', desc: 'Multi-persona AI', badge: 'AI' },
      { icon: '🔧', name: 'Admin', desc: 'Users, Tech Stack, Super Admin', badge: 'Live' },
    ],
    qa_eyebrow: 'V3.0 Audit — April 2026',
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
    trial_subtitle: 'Elite Management with OCI-grade Privacy. The CRM built for health professionals who demand the highest standard of patient data security.',
    trial_features: [
      'Complete data isolation per clinic',
      '4 AI Agents included',
      'Automated SDR 24/7',
      'QA/Security Report',
      'Dedicated support',
      'Cancel anytime',
    ],
    trial_cta: 'Try Provadágua for 7 days — Free',
    trial_sub: 'Elite Management with OCI Privacy · Setup in under 5 minutes · Cancel anytime',
    footer_built: 'Built with ❤ by the Encontro D\'Água team',
    footer_version: 'V3.0 — Provadágua Mission Complete',
    footer_privacy: 'Privacy · LGPD/GDPR · Terms',
  },
};

// ─── Shared style tokens ───────────────────────────────────────────────────
const S = {
  cyanBlue: 'linear-gradient(135deg, #0ea5e9, #0077ff)',
  navy: '#080d1a',
  surface: 'rgba(255,255,255,0.035)',
  surfaceHover: 'rgba(14,165,233,0.08)',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(14,165,233,0.28)',
  blue: '#0ea5e9',
  emerald: '#10b981',
  slate: '#94a3b8',
  slateDim: '#475569',
};

// ─── ShowcasePage Component ────────────────────────────────────────────────
const ShowcasePage: React.FC = () => {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [scrolled, setScrolled] = useState(false);
  const observedRef = useRef<Set<string>>(new Set());
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        background: `radial-gradient(ellipse 120% 60% at 50% -10%, rgba(14,165,233,0.14) 0%, transparent 70%), ${S.navy}`,
        color: '#e2e8f0',
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
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(14,165,233,0.35); }
        a { text-decoration: none; }
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
            💧
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>
            Encontro D'Água Hub
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
              borderRadius: '20px',
              padding: '6px 14px',
              color: S.slate,
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              minHeight: '36px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
              e.currentTarget.style.color = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = S.surface;
              e.currentTarget.style.color = S.slate;
            }}
          >
            {lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}
          </button>

          <a
            href="/#/login"
            id="showcase-nav-login"
            style={{
              background: S.cyanBlue,
              borderRadius: '20px',
              padding: '8px 20px',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(14,165,233,0.32)',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 22px rgba(14,165,233,0.52)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(14,165,233,0.32)';
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
        {/* Background orbs */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '25%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '720px', height: '720px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 68%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: '380px', height: '380px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Specialty pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          justifyContent: 'center',
          marginBottom: '1.8rem',
          animation: 'fadeDown 0.55s ease both',
        }}>
          {t.specialties.map((s, i) => (
            <span key={i} style={{
              background: 'rgba(14,165,233,0.1)',
              border: '1px solid rgba(14,165,233,0.22)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#7dd3fc',
            }}>{s}</span>
          ))}
        </div>

        {/* Eyebrow */}
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: S.blue,
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
            background: S.cyanBlue,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {t.hero_title_2}
          </span>
          <br />
          {t.hero_title_accent}
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
                background: S.cyanBlue,
                color: '#fff',
                padding: '16px 36px',
                borderRadius: '50px',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 8px 32px rgba(14,165,233,0.42)',
                transition: 'all 0.25s',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '52px',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(14,165,233,0.58)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.42)';
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

        {/* Metrics bar */}
        <div style={{
          marginTop: '5rem',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${S.border}`,
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
                borderRight: i < t.metrics.length - 1 ? `1px solid ${S.border}` : 'none',
                flex: '1 1 140px',
              }}
            >
              <div style={{
                fontSize: '1.9rem',
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                background: S.cyanBlue,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '4px',
              }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: S.slateDim, fontWeight: 500, lineHeight: 1.4 }}>
                {m.label}
              </div>
            </div>
          ))}
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
          {/* Card 1: Saúde */}
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
            <div style={{ fontSize: '2.4rem' }} aria-hidden="true">🩺</div>
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.15rem', marginBottom: '8px' }}>
                {lang === 'pt' ? 'Saúde & Consultório' : 'Health & Clinic'}
              </h3>
              <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                {lang === 'pt'
                  ? 'Para Psicólogos, Médicos, Fisioterapeutas e terapeutas. Gestão de leads com privacidade LGPD nativa, sem misturar dados de pacientes.'
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
                {lang === 'pt' ? '🩺 Quero testar 7 dias' : '🩺 Try 7 days free'}
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

          {/* Card 3: Kit Básico / Link d'Água */}
          <div
            id="segment-linkdagua"
            style={{
              background: 'rgba(251,191,36,0.05)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '22px',
              padding: '32px 28px',
              transition: 'all 0.28s',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.45)';
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(251,191,36,0.09)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(251,191,36,0.05)';
            }}
          >
            <div style={{ fontSize: '2.4rem' }} aria-hidden="true">🔗</div>
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.15rem', marginBottom: '8px' }}>
                {lang === 'pt' ? 'Kit Básico — Link d’Água' : 'Basic Kit — Link d’Água'}
              </h3>
              <p style={{ color: S.slate, fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
                {lang === 'pt'
                  ? 'Cartão digital profissional + QR Code personalizado + microsite com sua bio e links. Simples, rápido, impactante.'
                  : 'Professional digital card + custom QR Code + bio microsite. Simple, fast, impactful.'}
              </p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <a
                id="segment-linkdagua-cta"
                href="https://link.encontrodagua.com/vitrine"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                  display: 'block',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {lang === 'pt' ? '🔗 Ver Link d’Água' : '🔗 See Link d’Água'}
              </a>
            </div>
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
                      {mod.badge === 'AI' ? '✦ AI' : `✓ ${mod.badge}`}
                    </span>
                  </div>
                  <p style={{ color: S.slateDim, fontSize: '0.8rem', margin: 0 }}>{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QA & Security Report ────────────────────────────── */}
      <section
        id="sec-qa"
        data-obs
        aria-labelledby="qa-heading"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
          ...fadeIn('sec-qa'),
        }}
      >
        <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: S.emerald,
              marginBottom: '1.2rem',
              letterSpacing: '0.06em',
            }}>
              <ShieldIcon />
              {t.qa_eyebrow}
            </div>
            <h2
              id="qa-heading"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                color: '#f1f5f9',
                marginBottom: '0.8rem',
              }}
            >
              {t.qa_title}
            </h2>
            <p style={{ color: S.slate, fontSize: '0.95rem' }}>{t.qa_subtitle}</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '14px',
          }}>
            {t.qa_items.map((item, i) => (
              <div
                key={i}
                id={`qa-${i}`}
                style={{
                  background: 'rgba(16,185,129,0.04)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ color: S.emerald, marginTop: '2px', flexShrink: 0 }}>
                    <ShieldIcon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '5px' }}>
                      {item.title}
                    </div>
                    <div style={{
                      background: 'rgba(16,185,129,0.15)',
                      color: S.emerald,
                      borderRadius: '8px',
                      padding: '2px 9px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      letterSpacing: '0.06em',
                    }}>
                      <CheckIcon />
                      {item.status}
                    </div>
                  </div>
                </div>
                <p style={{ color: S.slateDim, fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────────────────── */}
      <section
        id="sec-tech"
        data-obs
        aria-labelledby="tech-heading"
        style={{
          padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
          background: 'rgba(0,0,0,0.15)',
          ...fadeIn('sec-tech'),
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="tech-heading"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              marginBottom: '3rem',
            }}
          >
            {t.tech_title}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {t.tech_stack.map((tech, i) => (
              <div
                key={i}
                style={{
                  background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRadius: '12px',
                  padding: '12px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                  cursor: 'default',
                  minWidth: '130px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = S.surfaceHover;
                  e.currentTarget.style.borderColor = S.borderHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = S.surface;
                  e.currentTarget.style.borderColor = S.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>{tech.name}</span>
                <span style={{ color: S.slateDim, fontSize: '0.7rem', fontWeight: 600 }}>{tech.category}</span>
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

            {/* Primary CTA */}
            <a
              href="/#/"
              id="showcase-trial-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: S.cyanBlue,
                color: '#fff',
                padding: '18px 52px',
                borderRadius: '50px',
                fontWeight: 800,
                fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                boxShadow: '0 12px 48px rgba(14,165,233,0.48)',
                transition: 'all 0.28s',
                cursor: 'pointer',
                marginBottom: '1rem',
                position: 'relative',
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
              {t.trial_cta}
              <ArrowIcon />
            </a>

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

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        borderTop: `1px solid ${S.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div aria-hidden="true" style={{
            width: '24px', height: '24px',
            background: S.cyanBlue,
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px',
          }}>💧</div>
          <span style={{ color: S.slate, fontSize: '0.82rem', fontWeight: 500 }}>{t.footer_built}</span>
        </div>
        <p style={{ color: S.slateDim, fontSize: '0.74rem', margin: '4px 0' }}>{t.footer_version}</p>
        <p style={{ color: S.slateDim, fontSize: '0.72rem', margin: 0 }}>{t.footer_privacy}</p>
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
