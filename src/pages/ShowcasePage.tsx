import React, { useState, useEffect } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Translation {
  hero_badge: string;
  hero_title: string;
  hero_title_accent: string;
  hero_subtitle: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  metrics_label: string;
  metrics: Array<{ value: string; label: string }>;
  modules_title: string;
  modules_subtitle: string;
  qa_title: string;
  qa_subtitle: string;
  qa_items: Array<{ icon: string; title: string; status: string; desc: string }>;
  modules: Array<{ icon: string; name: string; desc: string; status: string }>;
  tech_title: string;
  tech_stack: Array<{ name: string; category: string }>;
  cta_title: string;
  cta_subtitle: string;
  cta_button: string;
  footer_built: string;
  footer_version: string;
}

// ─── i18n Content ─────────────────────────────────────────────────────────
const TRANSLATIONS: Record<'pt' | 'en', Translation> = {
  pt: {
    hero_badge: '🚀 Provadágua V3.0 — Missão Concluída',
    hero_title: 'O CRM que nasceu',
    hero_title_accent: 'na floresta.',
    hero_subtitle:
      'Encontro D\'Água Hub é o sistema operacional de vendas para empreendedores amazônicos e mercados internacionais. SDR automatizado, IA embarcada, isolamento de dados por empresa e deploy em produção real.',
    hero_cta_primary: 'Solicitar Acesso',
    hero_cta_secondary: 'Ver Demonstração',
    metrics_label: 'Operando desde 2025',
    metrics: [
      { value: '100%', label: 'Dados Isolados por Empresa' },
      { value: '9', label: 'Módulos em Produção' },
      { value: '4', label: 'Agentes de IA Ativos' },
      { value: '24/7', label: 'SDR Automatizado' },
    ],
    modules_title: 'Módulos em Produção',
    modules_subtitle: 'Todos os módulos ativos e operacionais em hub.encontrodagua.com',
    qa_title: 'Relatório de QA & Segurança',
    qa_subtitle: 'Auditoria V3.0 — Abril 2026',
    qa_items: [
      {
        icon: '🔒',
        title: 'Isolamento Multi-Tenant',
        status: 'PASS',
        desc: 'company_id RLS ativo em todas as tabelas críticas. Leads Amanda, Médica e SDR completamente separados.',
      },
      {
        icon: '🛡️',
        title: 'Chaves de API',
        status: 'PASS',
        desc: 'SUPABASE_SERVICE_ROLE_KEY rotacionada e armazenada apenas no Vercel Secrets. Nunca exposta no repositório.',
      },
      {
        icon: '👑',
        title: 'Super Admin (Migration 038)',
        status: 'PASS',
        desc: 'lidimfc@gmail.com promovida a Super Admin (is_super_admin=true). Bypass de RLS para operações cross-tenant.',
      },
      {
        icon: '🌐',
        title: 'Bilinguismo PT/EN',
        status: 'PASS',
        desc: 'Showcase page bilingue com toggle. Sistema de i18n via LanguageContext em todos os módulos.',
      },
      {
        icon: '⏱️',
        title: 'access_expires_at',
        status: 'PASS',
        desc: 'Coluna adicionada em profiles. Leads temporários expiram automaticamente. Admin pode estender.',
      },
      {
        icon: '🧹',
        title: 'Demo Isolation',
        status: 'PASS',
        desc: 'IS_DEMO guard em todos os services. Dados de produção nunca vazam para o ambiente Provadágua.',
      },
    ],
    modules: [
      { icon: '📋', name: 'Board Kanban', desc: 'SDR leads auto-mapeados ao primeiro estágio', status: 'Ativo' },
      { icon: '👥', name: 'Contatos', desc: 'Base completa com sync bidirecional', status: 'Ativo' },
      { icon: '📬', name: 'Inbox / Mazô', desc: 'Agente IA de Customer Success', status: 'Ativo' },
      { icon: '⚖️', name: 'Jury', desc: 'Contratos BR + Common Law', status: 'Ativo' },
      { icon: '💰', name: 'Precy', desc: 'Precificação BRL/USD/EUR', status: 'Ativo' },
      { icon: '📱', name: 'QR D\'água', desc: 'QR Codes + Bridge Pages', status: 'Ativo' },
      { icon: '📊', name: 'Reports', desc: 'Pipeline + Win/Loss real', status: 'Ativo' },
      { icon: '🧪', name: 'Prompt Lab', desc: 'IA multi-persona', status: 'Ativo' },
      { icon: '🔧', name: 'Admin', desc: 'Usuários, Tech Stack, Super Admin', status: 'Ativo' },
    ],
    tech_title: 'Stack Técnica',
    tech_stack: [
      { name: 'React 18 + TypeScript', category: 'Frontend' },
      { name: 'Supabase + PostgreSQL', category: 'Backend' },
      { name: 'RLS Multi-Tenant', category: 'Segurança' },
      { name: 'Google Gemini', category: 'IA Principal' },
      { name: 'Vite + TailwindCSS', category: 'Build' },
      { name: 'Vercel Edge', category: 'Deploy' },
      { name: 'TanStack Query', category: 'State' },
      { name: 'Edge Functions', category: 'Serverless' },
    ],
    cta_title: 'Quer o seu Hub?',
    cta_subtitle:
      'Transforme sua operação de vendas com IA embarcada, SDR automatizado e dados 100% isolados por empresa.',
    cta_button: 'Falar com a Equipe',
    footer_built: 'Construído com ❤️ pela equipe Encontro D\'Água',
    footer_version: 'V3.0 — Provadágua Mission Complete',
  },
  en: {
    hero_badge: '🚀 Provadágua V3.0 — Mission Complete',
    hero_title: 'The CRM born in',
    hero_title_accent: 'the Amazon.',
    hero_subtitle:
      'Encontro D\'Água Hub is the sales operating system for Amazonian entrepreneurs and international markets. Automated SDR, embedded AI, per-company data isolation, and live production deployment.',
    hero_cta_primary: 'Request Access',
    hero_cta_secondary: 'Watch Demo',
    metrics_label: 'Operating since 2025',
    metrics: [
      { value: '100%', label: 'Data Isolated by Company' },
      { value: '9', label: 'Modules in Production' },
      { value: '4', label: 'Active AI Agents' },
      { value: '24/7', label: 'Automated SDR' },
    ],
    modules_title: 'Production Modules',
    modules_subtitle: 'All modules active at hub.encontrodagua.com',
    qa_title: 'QA & Security Report',
    qa_subtitle: 'V3.0 Audit — April 2026',
    qa_items: [
      {
        icon: '🔒',
        title: 'Multi-Tenant Isolation',
        status: 'PASS',
        desc: 'company_id RLS active on all critical tables. Amanda, Médica and SDR leads fully separated.',
      },
      {
        icon: '🛡️',
        title: 'API Keys',
        status: 'PASS',
        desc: 'SUPABASE_SERVICE_ROLE_KEY rotated and stored only in Vercel Secrets. Never exposed in the repository.',
      },
      {
        icon: '👑',
        title: 'Super Admin (Migration 038)',
        status: 'PASS',
        desc: 'lidimfc@gmail.com promoted to Super Admin (is_super_admin=true). Cross-tenant RLS bypass enabled.',
      },
      {
        icon: '🌐',
        title: 'Bilingualism PT/EN',
        status: 'PASS',
        desc: 'Showcase page bilingual with toggle. i18n via LanguageContext across all modules.',
      },
      {
        icon: '⏱️',
        title: 'access_expires_at',
        status: 'PASS',
        desc: 'Column added to profiles. Temporary leads expire automatically. Admin can extend.',
      },
      {
        icon: '🧹',
        title: 'Demo Isolation',
        status: 'PASS',
        desc: 'IS_DEMO guard in all services. Production data never leaks to the Provadágua environment.',
      },
    ],
    modules: [
      { icon: '📋', name: 'Kanban Board', desc: 'SDR leads auto-mapped to first stage', status: 'Active' },
      { icon: '👥', name: 'Contacts', desc: 'Full base with bidirectional sync', status: 'Active' },
      { icon: '📬', name: 'Inbox / Mazô', desc: 'AI Customer Success Agent', status: 'Active' },
      { icon: '⚖️', name: 'Jury', desc: 'BR + Common Law contracts', status: 'Active' },
      { icon: '💰', name: 'Precy', desc: 'Pricing BRL/USD/EUR', status: 'Active' },
      { icon: '📱', name: 'QR D\'água', desc: 'QR Codes + Bridge Pages', status: 'Active' },
      { icon: '📊', name: 'Reports', desc: 'Pipeline + real Win/Loss', status: 'Active' },
      { icon: '🧪', name: 'Prompt Lab', desc: 'Multi-persona AI', status: 'Active' },
      { icon: '🔧', name: 'Admin', desc: 'Users, Tech Stack, Super Admin', status: 'Active' },
    ],
    tech_title: 'Tech Stack',
    tech_stack: [
      { name: 'React 18 + TypeScript', category: 'Frontend' },
      { name: 'Supabase + PostgreSQL', category: 'Backend' },
      { name: 'RLS Multi-Tenant', category: 'Security' },
      { name: 'Google Gemini', category: 'Primary AI' },
      { name: 'Vite + TailwindCSS', category: 'Build' },
      { name: 'Vercel Edge', category: 'Deploy' },
      { name: 'TanStack Query', category: 'State' },
      { name: 'Edge Functions', category: 'Serverless' },
    ],
    cta_title: 'Want your own Hub?',
    cta_subtitle:
      'Transform your sales operation with embedded AI, automated SDR, and 100% per-company data isolation.',
    cta_button: 'Talk to the Team',
    footer_built: 'Built with ❤️ by the Encontro D\'Água team',
    footer_version: 'V3.0 — Provadágua Mission Complete',
  },
};

// ─── ShowcasePage Component ────────────────────────────────────────────────
const ShowcasePage: React.FC = () => {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const t = TRANSLATIONS[lang];

  // Scroll effect for header
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Intersection observer for section animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div id="showcase-root" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 40%, #091521 100%)',
      color: '#e2e8f0',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
      overflowX: 'hidden',
    }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* ── Sticky Nav ─────────────────────────────────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,14,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #00d4ff, #0077ff)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>💧</div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            Encontro D'Água Hub
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language toggle */}
          <button
            id="showcase-lang-toggle"
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            {lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}
          </button>

          <a
            href="/#/login"
            id="showcase-login-btn"
            style={{
              background: 'linear-gradient(135deg, #0077ff, #00d4ff)',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 20px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,119,255,0.3)',
            }}
          >
            {lang === 'pt' ? 'Entrar' : 'Login'}
          </a>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section id="showcase-hero" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '8rem 2rem 6rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(0,119,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div id="showcase-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0,119,255,0.1)',
          border: '1px solid rgba(0,119,255,0.3)',
          borderRadius: '24px',
          padding: '8px 20px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#60a5fa',
          marginBottom: '2rem',
          animation: 'fadeInDown 0.6s ease both',
        }}>
          {t.hero_badge}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(2.4rem, 6vw, 5rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          color: '#fff',
          animation: 'fadeInUp 0.7s ease 0.1s both',
        }}>
          {t.hero_title}{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0077ff, #00d4ff, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {t.hero_title_accent}
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          maxWidth: '640px',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#94a3b8',
          lineHeight: 1.7,
          marginBottom: '3rem',
          animation: 'fadeInUp 0.7s ease 0.2s both',
        }}>
          {t.hero_subtitle}
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'fadeInUp 0.7s ease 0.3s both',
        }}>
          <a
            href="/#/"
            id="showcase-cta-primary"
            style={{
              background: 'linear-gradient(135deg, #0077ff, #0055cc)',
              color: '#fff',
              padding: '16px 36px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(0,119,255,0.35)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,119,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,119,255,0.35)';
            }}
          >
            {t.hero_cta_primary}
          </a>
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
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            {t.hero_cta_secondary}
          </a>
        </div>

        {/* Metrics bar */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginTop: '5rem',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          flexWrap: 'wrap',
          animation: 'fadeInUp 0.7s ease 0.5s both',
        }}>
          {t.metrics.map((m, i) => (
            <div key={i} style={{
              padding: '24px 36px',
              textAlign: 'center',
              borderRight: i < t.metrics.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              minWidth: '140px',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                background: 'linear-gradient(135deg, #0077ff, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '4px',
              }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules Section ─────────────────────────────────── */}
      <section
        id="showcase-modules"
        data-animate
        style={{
          padding: '6rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          opacity: isVisible('showcase-modules') ? 1 : 0,
          transform: isVisible('showcase-modules') ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.7s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '1rem',
          }}>
            {t.modules_title}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>{t.modules_subtitle}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {t.modules.map((mod, i) => (
            <div
              key={i}
              id={`module-card-${i}`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'all 0.25s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,119,255,0.07)';
                e.currentTarget.style.borderColor = 'rgba(0,119,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontSize: '1.8rem',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,119,255,0.1)',
                borderRadius: '12px',
                flexShrink: 0,
              }}>
                {mod.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>{mod.name}</span>
                  <span style={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}>
                    ✅ {mod.status}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QA & Security Report ────────────────────────────── */}
      <section
        id="showcase-qa"
        data-animate
        style={{
          padding: '6rem 2rem',
          background: 'rgba(0,0,0,0.2)',
          opacity: isVisible('showcase-qa') ? 1 : 0,
          transform: isVisible('showcase-qa') ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.7s ease',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#10b981',
              marginBottom: '1rem',
            }}>
              🛡️ {t.qa_subtitle}
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              color: '#fff',
            }}>
              {t.qa_title}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {t.qa_items.map((item, i) => (
              <div
                key={i}
                id={`qa-item-${i}`}
                style={{
                  background: 'rgba(16,185,129,0.04)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '16px',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{item.title}</div>
                    <div style={{
                      background: 'rgba(16,185,129,0.15)',
                      color: '#10b981',
                      borderRadius: '8px',
                      padding: '2px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'inline-block',
                      marginTop: '2px',
                      letterSpacing: '0.05em',
                    }}>
                      ✓ {item.status}
                    </div>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────────────────── */}
      <section
        id="showcase-tech"
        data-animate
        style={{
          padding: '6rem 2rem',
          maxWidth: '900px',
          margin: '0 auto',
          opacity: isVisible('showcase-tech') ? 1 : 0,
          transform: isVisible('showcase-tech') ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.7s ease',
        }}
      >
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
          fontWeight: 800,
          color: '#fff',
          textAlign: 'center',
          marginBottom: '3rem',
        }}>
          {t.tech_title}
        </h2>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
        }}>
          {t.tech_stack.map((tech, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,119,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(0,119,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{tech.name}</span>
              <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>{tech.category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────── */}
      <section
        id="showcase-cta"
        data-animate
        style={{
          padding: '8rem 2rem',
          textAlign: 'center',
          opacity: isVisible('showcase-cta') ? 1 : 0,
          transform: isVisible('showcase-cta') ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.7s ease',
        }}
      >
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'rgba(0,119,255,0.06)',
          border: '1px solid rgba(0,119,255,0.2)',
          borderRadius: '28px',
          padding: '4rem 3rem',
        }}>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '1rem',
          }}>
            {t.cta_title}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            {t.cta_subtitle}
          </p>
          <a
            href="/#/"
            id="showcase-final-cta"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #0077ff, #00d4ff)',
              color: '#fff',
              padding: '18px 48px',
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '1.1rem',
              textDecoration: 'none',
              boxShadow: '0 12px 40px rgba(0,119,255,0.4)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,119,255,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,119,255,0.4)';
            }}
          >
            {t.cta_button} →
          </a>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ color: '#334155', fontSize: '0.85rem', margin: 0 }}>{t.footer_built}</p>
        <p style={{ color: '#1e293b', fontSize: '0.75rem', margin: '4px 0 0' }}>{t.footer_version}</p>
      </footer>

      {/* ── CSS Animations ──────────────────────────────────── */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
};

export default ShowcasePage;
