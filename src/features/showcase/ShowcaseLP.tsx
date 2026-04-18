import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase/client';

// ─── Access keyword — lida via ENV (V7.0: zero hardcode no bundle) ────────────
// Configurar VITE_ACCESS_KEYWORD=provadagua no .env e no painel Vercel/Supabase
const ACCESS_KEYWORD = (import.meta.env.VITE_ACCESS_KEYWORD as string || '').trim().toLowerCase();

// ─── Demo signup metadata (ISOLATION WALL) ───────────────────────────────────
// Every user created via this LP gets is_demo_data: true injected at the
// raw_user_meta_data level. The handle_new_user trigger (migration 033)
// reads company_id safely with NULLIF so NULL here is fine.
const DEMO_META = {
  is_demo_data: true,
  app_source: 'showcase_lp',
  role: 'vendedor', // visitor role — no admin access
};

// ─── Translations (self-contained — LP-only page) ────────────────────────────
const copy = {
  pt: {
    nav: { features: 'Funcionalidades', video: 'Demo', access: 'Acesso' },
    hero: {
      badge: "🌊 Prova d'Água — Ambiente de Demonstração",
      headline1: 'O CRM que',
      headline2: 'flui com o seu negócio.',
      sub: 'Gerencie leads, feche deals e automatize com IA — tudo numa plataforma elegante feita para empreendedores que pensam grande.',
      cta: 'Solicitar Acesso',
      ctaGuest: '⚡ Entrar como Convidado',
    },
    features: {
      title: 'Tudo que você precisa, nada que você não precisa.',
      sub: 'Construído para velocidade, clareza e resultados reais.',
      items: [
        { icon: '🎯', title: 'Kanban Inteligente', desc: 'Visualize e mova deals com IA que sugere próximos passos automaticamente.' },
        { icon: '🤖', title: 'Agentes de IA', desc: 'Precy (Pricing), Jurý (Contratos) e Mazô (CS) trabalham por você 24/7.' },
        { icon: '🔗', title: "Link d'Água", desc: 'Cartão digital + QR Code integrado. Sua vitrine profissional em um link.' },
        { icon: '📊', title: 'Dashboard em Tempo Real', desc: 'Pipeline, LTV, taxa de conversão — o pulso do seu negócio sempre visível.' },
        { icon: '🌍', title: 'Bilíngue Nativo', desc: 'Interface completa em PT e EN. Ideal para negócios internacionais.' },
        { icon: '🔒', title: 'Isolamento Total de Dados', desc: 'Ambiente demo 100% segregado. Seus dados reais nunca são expostos.' },
      ],
    },
    video: {
      title: 'Veja em ação.',
      sub: 'A demonstração completa do Hub — gravada ao vivo pela fundadora.',
      placeholder: '▶  Vídeo de demonstração em breve',
      placeholderSub: 'A PO está gravando. Fique ligado!',
    },
    portal: {
      title: 'Portão de Acesso',
      sub: 'Insira a chave para criar sua conta de demonstração.',
      keyLabel: 'Chave de Acesso',
      keyPlaceholder: 'Digite a palavra-chave...',
      keyHint: 'Solicite a chave de acesso com a equipe Encontro d\'Água.',
      keyError: '❌ Chave incorreta. Verifique e tente novamente.',
      keyBtn: '🔑 Verificar Chave',
      signupTitle: '✅ Acesso Liberado! Crie sua conta.',
      signupName: 'Nome completo',
      signupEmail: 'E-mail',
      signupPassword: 'Senha (mín. 6 caracteres)',
      signupPassPlaceholder: '••••••••',
      signupBtn: 'Criar Conta e Entrar →',
      signingUp: 'Criando conta...',
      successMsg: '🎉 Conta criada! Redirecionando para o Hub...',
      errorGeneric: '❌ Erro ao criar conta. Tente novamente.',
      errorEmailUsed: '⚠️ Este e-mail já possui cadastro. Clique em “Usar outra chave” e tente fazer login.',
      errorEmailConfirm: '✅ Cadastro realizado! Verifique sua caixa de entrada para confirmar o e-mail e depois faça o login.',
      errorRateLimit: '⏳ Muitas tentativas detectadas. Aguarde alguns minutos ou tente outra rede.',
      backToKey: '← Usar outra chave',
    },
    footer: {
      rights: "© 2025 Encontro d'Água Hub. Todos os direitos reservados.",
      tagline: 'Inspirado na natureza, codado para o mundo.',
    },
  },
  en: {
    nav: { features: 'Features', video: 'Demo', access: 'Access' },
    hero: {
      badge: "🌊 Water Proof — Demo Environment",
      headline1: 'The CRM that',
      headline2: 'flows with your business.',
      sub: 'Manage leads, close deals and automate with AI — all in an elegant platform built for entrepreneurs who think big.',
      cta: 'Request Access',
      ctaGuest: '⚡ Continue as Guest',
    },
    features: {
      title: "Everything you need, nothing you don't.",
      sub: 'Built for speed, clarity and real results.',
      items: [
        { icon: '🎯', title: 'Smart Kanban', desc: 'Visualize and move deals with AI that automatically suggests next steps.' },
        { icon: '🤖', title: 'AI Agents', desc: 'Precy (Pricing), Jurý (Contracts) and Mazô (CS) work for you 24/7.' },
        { icon: '🔗', title: "Link d'Água", desc: 'Digital card + integrated QR Code. Your professional showcase in one link.' },
        { icon: '📊', title: 'Real-Time Dashboard', desc: 'Pipeline, LTV, conversion rate — the pulse of your business always visible.' },
        { icon: '🌍', title: 'Natively Bilingual', desc: 'Full interface in PT and EN. Ideal for international businesses.' },
        { icon: '🔒', title: 'Total Data Isolation', desc: 'Demo environment 100% segregated. Your real data is never exposed.' },
      ],
    },
    video: {
      title: 'See it in action.',
      sub: 'The complete Hub demo — recorded live by the founder.',
      placeholder: '▶  Demo video coming soon',
      placeholderSub: 'The PO is recording. Stay tuned!',
    },
    portal: {
      title: 'Access Gate',
      sub: 'Enter the key to create your demo account.',
      keyLabel: 'Access Key',
      keyPlaceholder: 'Enter the keyword...',
      keyHint: 'Request the access key from the Encontro d\'Água team.',
      keyError: '❌ Incorrect key. Please check and try again.',
      keyBtn: '🔑 Verify Key',
      signupTitle: '✅ Access Granted! Create your account.',
      signupName: 'Full name',
      signupEmail: 'Email',
      signupPassword: 'Password (min. 6 characters)',
      signupPassPlaceholder: '••••••••',
      signupBtn: 'Create Account & Sign In →',
      signingUp: 'Creating account...',
      successMsg: '🎉 Account created! Redirecting to Hub...',
      errorGeneric: '❌ Error creating account. Please try again.',
      errorEmailUsed: '⚠️ This email already has an account. Click “Use a different key” to sign in.',
      errorEmailConfirm: '✅ Registration successful! Check your inbox to confirm your email, then sign in.',
      errorRateLimit: '⏳ Too many attempts detected. Please wait a few minutes or try a different network.',
      backToKey: '← Use a different key',
    },
    footer: {
      rights: "© 2025 Encontro d'Água Hub. All rights reserved.",
      tagline: 'Inspired by nature, coded for the world.',
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const ShowcaseLP: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const c = copy[language] ?? copy['en'];

  // ─ Portal state machine ────────────────────────────────────────────────────
  type PortalPhase = 'keyword' | 'signup' | 'success';
  const [phase, setPhase] = useState<PortalPhase>('keyword');
  const [keyword, setKeyword] = useState('');
  const [keyError, setKeyError] = useState(false);

  // ─ Sign-up form ───────────────────────────────────────────────────────────
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [signupStatus, setSignupStatus] = useState<'idle' | 'loading' | 'error_generic' | 'error_email' | 'error_ratelimit' | 'error_confirm'>('idle');

  const keyInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus inputs when phase changes
  useEffect(() => {
    if (phase === 'keyword') keyInputRef.current?.focus();
    if (phase === 'signup') nameInputRef.current?.focus();
  }, [phase]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // ── Step 1: Verify keyword ─────────────────────────────────────────────────
  const handleKeyVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim().toLowerCase() === ACCESS_KEYWORD) {
      setKeyError(false);
      setPhase('signup');
    } else {
      setKeyError(true);
      keyInputRef.current?.select();
    }
  };

  // ── Step 2: Demo Sign Up via supabase.auth.signUp() nativo (V6.6: sem Edge Function, sem CORS) ─
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus('loading');

    try {
      const normalizedEmail = signupForm.email.trim().toLowerCase();

      // ① Cadastro nativo — metadados passados via options.data
      const { data: signUpResult, error: signUpError } = await supabase.auth.signUp({
        email:    normalizedEmail,
        password: signupForm.password,
        options: {
          data: {
            full_name:  signupForm.name.trim(),
            user_type:  'lead_provadagua',
            is_demo_data: true,
            app_source: 'showcase_lp',
          },
        },
      });

      // ② Detecta rate limit (429)
      const isRateLimit =
        signUpError?.message?.toLowerCase().includes('rate limit') ||
        signUpError?.message?.toLowerCase().includes('too many') ||
        signUpError?.status === 429;

      if (isRateLimit) {
        setSignupStatus('error_ratelimit');
        return;
      }

      // V6.7: Detecta email-not-confirmed (Supabase SMTP esgotado ou confirm obrigatório)
      // Supabase retorna user.session === null quando confirmação de email está ativa
      const needsConfirm =
        signUpError?.message?.toLowerCase().includes('email not confirmed') ||
        signUpError?.message?.toLowerCase().includes('not confirmed') ||
        (signUpResult?.user && !signUpResult?.session);

      if (needsConfirm && !signUpError?.message?.toLowerCase().includes('already registered')) {
        setSignupStatus('error_confirm');
        return;
      }

      // ③ Detecta email já cadastrado (identidades vazias ou erro de duplicata)
      const alreadyExists =
        signUpError?.message?.toLowerCase().includes('already registered') ||
        signUpError?.message?.toLowerCase().includes('user already') ||
        (signUpResult?.user && signUpResult.user.identities?.length === 0);

      if (alreadyExists) {
        setSignupStatus('error_email');
        return;
      }

      if (signUpError) throw signUpError;

      // ④ Auto-login imediato
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email:    normalizedEmail,
        password: signupForm.password,
      });

      // V6.7: auto-login falhou por email-not-confirmed
      if (signInError) {
        const isNotConfirmed =
          signInError.message?.toLowerCase().includes('email not confirmed') ||
          signInError.message?.toLowerCase().includes('not confirmed');
        if (isNotConfirmed) {
          setSignupStatus('error_confirm');
          return;
        }
        console.error('[ShowcaseLP] signIn after signUp failed:', signInError.message);
        setSignupStatus('error_generic');
        return;
      }

      // ⑤ Limpa flag de onboarding para o modal disparar no /boards
      localStorage.removeItem('crm_onboarding_completed');

      setPhase('success');
      setTimeout(() => navigate('/boards'), 1800);

    } catch (err: any) {
      console.error('[ShowcaseLP] unexpected signup error:', err);
      // Captura rate limit vindo de throw genérico
      if (err?.message?.toLowerCase().includes('rate limit') || err?.message?.toLowerCase().includes('too many')) {
        setSignupStatus('error_ratelimit');
      } else {
        setSignupStatus('error_generic');
      }
    }
  };


  // Reset keyword phase
  const resetPortal = () => {
    setPhase('keyword');
    setKeyword('');
    setKeyError(false);
    setSignupStatus('idle');
    setSignupForm({ name: '', email: '', password: '' });
  };

  return (
    <div style={s.root}>
      <div style={s.noiseOverlay} />

      {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <img
            src="/logos/logo-full-dark-gold.png"
            alt="Encontro d'Água Hub"
            style={s.logo}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={s.navLinks}>
            <button style={s.navLink} onClick={() => scrollTo('features')}>{c.nav.features}</button>
            <button style={s.navLink} onClick={() => scrollTo('video')}>{c.nav.video}</button>
            <button style={s.navLink} onClick={() => scrollTo('access')}>{c.nav.access}</button>
          </div>
          <div style={s.navRight}>
            <button style={s.langToggle} onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}>
              {language === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}
            </button>
            <button style={s.navCta} onClick={() => scrollTo('access')}>{c.hero.cta}</button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section id="hero" style={s.hero}>
        <div style={s.glowLeft} />
        <div style={s.glowRight} />
        <div style={s.heroContent}>
          <span style={s.heroBadge}>{c.hero.badge}</span>
          <h1 style={s.heroHeadline}>
            {c.hero.headline1}{' '}
            <span style={s.heroGold}>{c.hero.headline2}</span>
          </h1>
          <p style={s.heroSub}>{c.hero.sub}</p>
          <div style={s.heroCtas}>
            <button style={s.ctaPrimary} onClick={() => scrollTo('access')}>{c.hero.cta}</button>
          </div>
        </div>
        <div style={s.heroStats}>
          {[
            { value: '500+', label: language === 'pt' ? 'Leads Gerenciados' : 'Leads Managed' },
            { value: '99.9%', label: language === 'pt' ? 'Uptime Garantido' : 'Guaranteed Uptime' },
            { value: '3 IAs', label: language === 'pt' ? 'Agentes Ativos' : 'Active Agents' },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <span style={s.statValue}>{stat.value}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════════ */}
      <section id="features" style={s.section}>
        <div style={s.inner}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>{c.features.title}</h2>
            <p style={s.sectionSub}>{c.features.sub}</p>
          </div>
          <div style={s.featureGrid}>
            {c.features.items.map((feat, i) => (
              <div key={i} style={s.featureCard}>
                <span style={s.featureIcon}>{feat.icon}</span>
                <h3 style={s.featureTitle}>{feat.title}</h3>
                <p style={s.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VIDEO ════════════════════════════════════════════════════════════ */}
      <section id="video" style={s.videoSection}>
        <div style={s.inner}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>{c.video.title}</h2>
            <p style={s.sectionSub}>{c.video.sub}</p>
          </div>
          <div style={s.videoWrapper}>
            <div style={s.videoPlaceholder}>
              <span style={s.videoIcon}>🎬</span>
              <p style={s.videoText}>{c.video.placeholder}</p>
              <p style={s.videoSubText}>{c.video.placeholderSub}</p>
            </div>
            {/*
              TO REPLACE WITH:
              <iframe
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Demo Video"
                allowFullScreen
              />
            */}
          </div>
        </div>
      </section>

      {/* ══ PORTAL DE ACESSO ═════════════════════════════════════════════════ */}
      <section id="access" style={s.section}>
        <div style={s.inner}>
          <div style={s.portalLayout}>

            {/* ── Left: copy ── */}
            <div style={s.portalLeft}>
              <h2 style={s.portalTitle}>{c.portal.title}</h2>
              <p style={s.sectionSub}>{c.portal.sub}</p>

              {/* Visual lock indicator */}
              <div style={s.lockIndicator}>
                <div style={phase === 'signup' || phase === 'success' ? s.lockUnlocked : s.lockLocked}>
                  <span style={s.lockIcon}>{phase === 'keyword' ? '🔒' : '🔓'}</span>
                  <div>
                    <p style={s.lockTitle}>
                      {phase === 'keyword'
                        ? (language === 'pt' ? 'Acesso Restrito' : 'Restricted Access')
                        : (language === 'pt' ? 'Acesso Liberado' : 'Access Granted')}
                    </p>
                    <p style={s.lockSub}>
                      {phase === 'keyword'
                        ? (language === 'pt' ? 'Use sua chave de acesso para continuar' : 'Use your access key to continue')
                        : (language === 'pt' ? 'Crie sua conta demo agora' : 'Create your demo account now')}
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div style={s.steps}>
                  {[
                    language === 'pt' ? '🔑 Inserir chave' : '🔑 Enter key',
                    language === 'pt' ? '📝 Criar conta' : '📝 Create account',
                    language === 'pt' ? '🚀 Acessar Hub' : '🚀 Access Hub',
                  ].map((step, i) => (
                    <div key={i} style={{
                      ...s.step,
                      opacity: i === 0 ? 1 : (i === 1 && phase !== 'keyword' ? 1 : (i === 2 && phase === 'success' ? 1 : 0.35)),
                    }}>
                      <div style={{
                        ...s.stepDot,
                        background: (i === 0 && phase !== 'keyword') || (i === 1 && phase === 'success') || (i === 2 && phase === 'success')
                          ? GOLD : i === 0 ? GOLD : SURFACE,
                        borderColor: i === 0 ? GOLD : (i === 1 && phase !== 'keyword' ? GOLD : BORDER),
                      }} />
                      <span style={s.stepLabel}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: active form ── */}
            <div style={s.portalRight}>

              {/* ─── PHASE: keyword ─── */}
              {phase === 'keyword' && (
                <form onSubmit={handleKeyVerify} style={s.form} id="form-keyword">
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>{c.portal.keyLabel}</label>
                    <input
                      id="input-access-key"
                      ref={keyInputRef}
                      type="password"
                      autoComplete="off"
                      value={keyword}
                      onChange={(e) => { setKeyword(e.target.value); setKeyError(false); }}
                      placeholder={c.portal.keyPlaceholder}
                      style={{ ...s.formInput, borderColor: keyError ? '#FF6B6B' : undefined }}
                      required
                    />
                    {keyError && <p style={s.formError}>{c.portal.keyError}</p>}
                    <p style={s.formHint}>{c.portal.keyHint}</p>
                  </div>
                  <button id="btn-verify-key" type="submit" style={s.submitBtn}>
                    {c.portal.keyBtn}
                  </button>
                </form>
              )}

              {/* ─── PHASE: signup ─── */}
              {phase === 'signup' && (
                <form onSubmit={handleSignUp} style={s.form} id="form-signup-demo">
                  <div style={s.signupTitleBar}>
                    <span style={s.signupTitleText}>{c.portal.signupTitle}</span>
                    <button type="button" onClick={resetPortal} style={s.backBtn}>{c.portal.backToKey}</button>
                  </div>

                  <div style={s.formGroup}>
                    <label style={s.formLabel}>{c.portal.signupName} *</label>
                    <input
                      id="signup-name"
                      ref={nameInputRef}
                      type="text"
                      required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="Lidi Moura"
                      style={s.formInput}
                    />
                  </div>

                  <div style={s.formGroup}>
                    <label style={s.formLabel}>{c.portal.signupEmail} *</label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) => { setSignupForm({ ...signupForm, email: e.target.value }); setSignupStatus('idle'); }}
                      placeholder="lidi@empresa.com"
                      style={s.formInput}
                    />
                  </div>

                  <div style={s.formGroup}>
                    <label style={s.formLabel}>{c.portal.signupPassword} *</label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder={c.portal.signupPassPlaceholder}
                      style={s.formInput}
                    />
                  </div>

                  {signupStatus === 'error_generic' && (
                    <p style={s.formError}>{c.portal.errorGeneric}</p>
                  )}
                  {signupStatus === 'error_email' && (
                    <p style={{ ...s.formError, color: '#F5A623' }}>{c.portal.errorEmailUsed}</p>
                  )}
                  {signupStatus === 'error_confirm' && (
                    <p style={{ ...s.formError, color: '#4ADE80', lineHeight: 1.5 }}>{c.portal.errorEmailConfirm}</p>
                  )}
                  {signupStatus === 'error_ratelimit' && (
                    <p style={{ ...s.formError, color: '#F5A623' }}>{c.portal.errorRateLimit}</p>
                  )}

                  <button
                    id="btn-signup-demo"
                    type="submit"
                    disabled={signupStatus === 'loading'}
                    style={{ ...s.submitBtn, opacity: signupStatus === 'loading' ? 0.7 : 1 }}
                  >
                    {signupStatus === 'loading' ? c.portal.signingUp : c.portal.signupBtn}
                  </button>

                  <p style={s.formHint}>
                    {language === 'pt'
                      ? '🔒 Conta isolada — você só verá dados de demonstração.'
                      : '🔒 Isolated account — you will only see demo data.'}
                  </p>
                </form>
              )}

              {/* ─── PHASE: success ─── */}
              {phase === 'success' && (
                <div style={s.successBox}>
                  <span style={s.successIcon}>🎉</span>
                  <p style={s.successText}>{c.portal.successMsg}</p>
                  <div style={s.spinner} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <img
            src="/logos/logo-full-dark-gold.png"
            alt="Hub"
            style={s.footerLogo}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <p style={s.footerTagline}>{c.footer.tagline}</p>
          <p style={s.footerRights}>{c.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD       = '#C9A84C';
const GOLD_LIGHT = '#E8C66A';
const GOLD_DARK  = '#9B7B2E';
const BG         = '#0A0A0F';
const BG2        = '#0F0F18';
const SURFACE    = 'rgba(255,255,255,0.04)';
const BORDER     = 'rgba(201,168,76,0.2)';
const TEXT       = '#F0EDE8';
const TEXT_MUTED = 'rgba(240,237,232,0.55)';

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'Inter','Outfit',system-ui,sans-serif", overflowX: 'hidden', position: 'relative' },

  noiseOverlay: {
    position: 'fixed', inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: 'none', zIndex: 0, opacity: 0.5,
  },

  // NAV
  nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` },
  navInner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 },
  logo: { height: 36, objectFit: 'contain' },
  navLinks: { display: 'flex', gap: 8 },
  navLink: { background: 'none', border: 'none', color: TEXT_MUTED, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 14px', borderRadius: 8 },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  langToggle: { background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: 20 },
  navCta: { background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, border: 'none', color: '#0A0A0F', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '8px 20px', borderRadius: 20 },

  // HERO
  hero: { position: 'relative', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center', overflow: 'hidden' },
  glowLeft: { position: 'absolute', left: '-10%', top: '20%', width: 500, height: 500, background: `radial-gradient(circle,${GOLD}22 0%,transparent 70%)`, pointerEvents: 'none' },
  glowRight: { position: 'absolute', right: '-10%', bottom: '10%', width: 400, height: 400, background: `radial-gradient(circle,#3B6FEF22 0%,transparent 70%)`, pointerEvents: 'none' },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 780 },
  heroBadge: { display: 'inline-block', background: `${GOLD}18`, border: `1px solid ${GOLD}55`, color: GOLD_LIGHT, fontSize: 13, fontWeight: 600, padding: '6px 18px', borderRadius: 100, marginBottom: 28, letterSpacing: '0.04em' },
  heroHeadline: { fontSize: 'clamp(36px,6vw,72px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-0.02em', color: TEXT },
  heroGold: { background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { fontSize: 'clamp(16px,2vw,20px)', color: TEXT_MUTED, lineHeight: 1.7, marginBottom: 44, maxWidth: 620, margin: '0 auto 44px' },
  heroCtas: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  ctaPrimary: { background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, border: 'none', color: '#0A0A0F', fontSize: 16, fontWeight: 700, cursor: 'pointer', padding: '14px 32px', borderRadius: 12, boxShadow: `0 8px 32px ${GOLD}44` },
  heroStats: { position: 'relative', zIndex: 1, display: 'flex', gap: 20, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center' },
  statCard: { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, backdropFilter: 'blur(12px)' },
  statValue: { fontSize: 28, fontWeight: 800, color: GOLD_LIGHT, lineHeight: 1 },
  statLabel: { fontSize: 12, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' },

  // SECTIONS
  section: { padding: '100px 24px', position: 'relative', zIndex: 1 },
  inner: { maxWidth: 1200, margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: 60 },
  sectionTitle: { fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 },
  sectionSub: { fontSize: 18, color: TEXT_MUTED, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' },

  // FEATURES
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 },
  featureCard: { background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(8px)' },
  featureIcon: { fontSize: 36, display: 'block', marginBottom: 16 },
  featureTitle: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  featureDesc: { fontSize: 15, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 },

  // VIDEO
  videoSection: { padding: '100px 24px', background: BG2, position: 'relative', zIndex: 1 },
  videoWrapper: { maxWidth: 900, margin: '0 auto', borderRadius: 24, overflow: 'hidden', border: `1px solid ${BORDER}`, aspectRatio: '16/9', position: 'relative', minHeight: 350 },
  videoPlaceholder: { width: '100%', height: '100%', background: `linear-gradient(135deg,${BG2},#12121E)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 350 },
  videoIcon: { fontSize: 64 },
  videoText: { fontSize: 22, fontWeight: 700, color: TEXT_MUTED, margin: 0 },
  videoSubText: { fontSize: 15, color: `${TEXT_MUTED}88`, margin: 0 },

  // PORTAL
  portalLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' },
  portalLeft: { paddingTop: 8 },
  portalTitle: { fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 },

  lockIndicator: { marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28 },
  lockLocked: { display: 'flex', alignItems: 'center', gap: 16, background: `rgba(255,107,107,0.08)`, border: `1px solid rgba(255,107,107,0.25)`, borderRadius: 16, padding: '20px 24px' },
  lockUnlocked: { display: 'flex', alignItems: 'center', gap: 16, background: `${GOLD}10`, border: `1px solid ${GOLD}44`, borderRadius: 16, padding: '20px 24px' },
  lockIcon: { fontSize: 32 },
  lockTitle: { fontSize: 16, fontWeight: 700, color: TEXT },
  lockSub: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },

  steps: { display: 'flex', flexDirection: 'column', gap: 14 },
  step: { display: 'flex', alignItems: 'center', gap: 14, transition: 'opacity 0.4s' },
  stepDot: { width: 12, height: 12, borderRadius: '50%', border: `2px solid`, flexShrink: 0, transition: 'all 0.3s' },
  stepLabel: { fontSize: 14, color: TEXT_MUTED },

  portalRight: {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 24,
    padding: '40px 36px',
    backdropFilter: 'blur(12px)',
    minHeight: 320,
    display: 'flex',
    alignItems: 'stretch',
  },

  // FORMS
  form: { display: 'flex', flexDirection: 'column', gap: 20, width: '100%' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  formLabel: { fontSize: 13, fontWeight: 600, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' },
  formInput: { background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px', fontSize: 15, color: TEXT, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  formHint: { fontSize: 12, color: `${TEXT_MUTED}88`, margin: 0, lineHeight: 1.5 },
  formError: { fontSize: 13, color: '#FF6B6B', margin: 0 },
  submitBtn: { background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, border: 'none', color: '#0A0A0F', fontSize: 15, fontWeight: 700, cursor: 'pointer', padding: '14px', borderRadius: 12, boxShadow: `0 6px 24px ${GOLD}44`, marginTop: 4 },

  signupTitleBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  signupTitleText: { fontSize: 15, fontWeight: 700, color: GOLD_LIGHT, lineHeight: 1.4 },
  backBtn: { background: 'none', border: 'none', color: TEXT_MUTED, fontSize: 12, cursor: 'pointer', padding: '2px 0', whiteSpace: 'nowrap', flexShrink: 0 },

  // SUCCESS
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, width: '100%', minHeight: 240, textAlign: 'center' },
  successIcon: { fontSize: 56 },
  successText: { fontSize: 18, fontWeight: 600, color: GOLD_LIGHT, lineHeight: 1.5, maxWidth: 300 },
  spinner: {
    width: 32, height: 32,
    border: `3px solid ${GOLD}44`,
    borderTop: `3px solid ${GOLD}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  // FOOTER
  footer: { borderTop: `1px solid ${BORDER}`, padding: '48px 24px', position: 'relative', zIndex: 1 },
  footerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' },
  footerLogo: { height: 32, opacity: 0.7, objectFit: 'contain' },
  footerTagline: { fontSize: 15, color: TEXT_MUTED, margin: 0 },
  footerRights: { fontSize: 13, color: `${TEXT_MUTED}88`, margin: 0 },
};

// Inject spinner keyframes once
if (typeof document !== 'undefined' && !document.getElementById('showcase-lp-spin')) {
  const style = document.createElement('style');
  style.id = 'showcase-lp-spin';
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export default ShowcaseLP;
