import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, Key, Leaf, Shield, User, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { AiflowSupport } from '@/components/AiflowSupport';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { initGA4, trackTrialStart, trackLogin, trackSignUp } from '@/lib/analytics';

// ── Config ────────────────────────────────────────────────────────────────────
const ACCESS_KEYWORD = import.meta.env.VITE_ACCESS_KEYWORD || 'provadagua';
const WHATSAPP_SUPPORT = '5541992557600';
const WHATSAPP_KEYWORD_MSG = encodeURIComponent(
  'Olá! Estou na página de acesso da Provadágua e gostaria de solicitar a palavra-chave para experimentar o sistema.'
);

// ── Tipos ─────────────────────────────────────────────────────────────────────
type ShowcaseView = 'register' | 'signin';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  // ── Detecta origem: showcase ou hub puro (HashRouter-safe via useLocation) ──
  // Com HashRouter, location.search contém a query corretamente ex: ?from=showcase
  const _lqp = new URLSearchParams(location.search);
  const isShowcaseRoute =
    _lqp.get('from') === 'showcase' ||
    window.location.href.includes('?from=showcase') ||
    document.referrer.includes('showcase') ||
    document.referrer.includes('prova.');

  // ── God Mode ──────────────────────────────────────────────────────────────
  const logoClickCountRef = useRef(0);
  const logoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isGodModeUrl = _lqp.get('god') === 'true';
  const [isGodMode, setIsGodMode] = useState(isGodModeUrl);

  const handleLogoTripleClick = () => {
    logoClickCountRef.current += 1;
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => { logoClickCountRef.current = 0; }, 600);
    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      setIsGodMode(prev => !prev);
    }
  };

  // ── Hub SignIn state (modo puro /login) ───────────────────────────────────
  const [hubEmail, setHubEmail] = useState('');
  const [hubPassword, setHubPassword] = useState('');
  const [hubLoading, setHubLoading] = useState(false);
  const [hubError, setHubError] = useState<string | null>(null);
  const [showHubPassword, setShowHubPassword] = useState(false);

  // ── Showcase state ────────────────────────────────────────────────────────
  const [showcaseView, setShowcaseView] = useState<ShowcaseView>('register');
  const [keyword, setKeyword] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  // Showcase SignIn (toggle)
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinLoading, setSigninLoading] = useState(false);
  const [signinError, setSigninError] = useState<string | null>(null);
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // ── i18n ──────────────────────────────────────────────────────────────────
  const txt = {
    // Hub puro
    hubTitle:       isEn ? 'Hub Digital Access' : 'Acesso ao Hub Digital',
    hubSub:         isEn ? 'Enter with your credentials.' : 'Entre com suas credenciais.',
    hubEmailLbl:    'E-mail',
    hubPassLbl:     isEn ? 'Password' : 'Senha',
    hubSubmit:      isEn ? 'Sign In' : 'Entrar',
    hubLoading:     isEn ? 'Signing in...' : 'Entrando...',
    hubBlocked:     isEn
      ? 'Administrative access only. Please enter through the Provadágua showcase.'
      : 'Acesso administrativo restrito. Entre pela página da Provadágua.',
    hubNotTeam:     isEn ? 'Not part of the team? Discover the Provadágua →' : 'Não é da equipe? Conheça a Provadágua →',

    // Showcase — Cadastro
    regTitle:       isEn ? 'Access to Provadágua (Demo CRM)' : 'Acesso à Provadágua (Demo CRM)',
    regSub:         isEn ? 'New registration. Enter the access keyword.' : 'Novo cadastro. Insira a palavra-chave de acesso.',
    regTab:         isEn ? '+ New Registration' : '+ Novo Cadastro',
    regName:        isEn ? 'Your full name' : 'Seu nome completo',
    regEmail:       isEn ? 'Your professional email' : 'Seu e-mail profissional',
    regKeyword:     isEn ? 'Access keyword' : 'Palavra-chave de acesso',
    regKeyPlaceholder: isEn ? 'Your keyword...' : 'Sua palavra-chave...',
    regSubmit:      isEn ? '🌿 Start Free Trial' : '🌿 Iniciar Provadágua Grátis',
    regLoading:     isEn ? 'Opening access...' : 'Abrindo acesso...',
    regHaveAccount: isEn ? 'Already have an account? Sign in →' : 'Já tenho conta? Entrar →',
    regRequestKey:  isEn ? 'Request keyword from team' : 'Solicitar palavra-chave à equipe',
    regNoKey:       isEn ? "Don't have a keyword?" : 'Não tem a palavra-chave?',

    // Showcase — SignIn toggle
    signinTitle:    isEn ? 'Access to Provadágua (Demo CRM)' : 'Acesso à Provadágua (Demo CRM)',
    signinTab:      isEn ? '→ I have an account' : '→ Já tenho conta',
    signinSub:      isEn ? 'Access your existing account.' : 'Acesse sua conta existente.',
    signinSubmit:   isEn ? 'Sign In' : 'Entrar',
    signinLoading:  isEn ? 'Signing in...' : 'Entrando...',
    signinBack:     isEn ? '← New Registration' : '← Novo Cadastro',

    // Erros
    errMissing:     isEn ? 'Fill in your name and email.' : 'Preencha seu nome e e-mail.',
    errKeyword:     isEn ? 'Wrong keyword. Request from the team.' : 'Palavra-chave incorreta. Solicite à equipe.',
    errGeneric:     isEn ? 'Error. Try again.' : 'Erro. Tente novamente.',
    errEmailUsed:   isEn ? 'Email already registered. Sign in instead.' : 'E-mail já cadastrado. Use "Entrar".',
    errLogin:       isEn ? 'Login failed. Check credentials.' : 'Falha no login. Verifique as credenciais.',

    // God Mode
    adminTitle:     isEn ? 'Administrative Access' : 'Acesso Administrativo',
    adminSub:       'lidimfc — Super Admin',
    adminBack:      isEn ? '← Back to standard access' : '← Voltar ao acesso padrão',

    // Footer
    footer: isEn
      ? `© ${new Date().getFullYear()} Encontro D'Água Hub. All rights reserved.`
      : `© ${new Date().getFullYear()} Encontro D'Água Hub. Todos os direitos reservados.`,
  };

  // ── Handler: Hub SignIn ───────────────────────────────────────────────────
  const handleHubSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setHubLoading(true);
    setHubError(null);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: hubEmail,
        password: hubPassword,
      });
      if (signInError) throw signInError;

      const userId = signInData.user?.id;
      if (!userId) throw new Error('ID de usuário não encontrado.');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, access_level')
        .eq('id', userId)
        .single();

      const isHubAdmin = profile?.is_super_admin === true;
      if (!isHubAdmin) {
        await supabase.auth.signOut();
        setHubError(txt.hubBlocked);
        setHubLoading(false);
        return;
      }

      initGA4();
      trackLogin('hub_signin');
      navigate('/dashboard');
    } catch (err: any) {
      setHubError(err.message || txt.errLogin);
    } finally {
      setHubLoading(false);
    }
  };

  // ── Handler: God Mode Login ───────────────────────────────────────────────
  const handleGodModeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHubLoading(true);
    setHubError(null);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: hubEmail,
        password: hubPassword,
      });
      if (signInError) throw signInError;

      const userId = signInData.user?.id;
      if (!userId) throw new Error('ID de usuário não encontrado.');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, access_level')
        .eq('id', userId)
        .single();

      const isHubAdmin = profile?.is_super_admin === true;
      if (!isHubAdmin) {
        await supabase.auth.signOut();
        setHubError(txt.hubBlocked);
        setHubLoading(false);
        return;
      }

      initGA4();
      trackLogin('god_mode');
      navigate('/dashboard');
    } catch (err: any) {
      setHubError(err.message || txt.errLogin);
    } finally {
      setHubLoading(false);
    }
  };

  // ── Handler: Showcase Keyword Register ───────────────────────────────────
  const handleKeywordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeywordLoading(true);
    setKeywordError(null);

    const normalizedInput   = keyword.trim().toLowerCase().replace(/\s+/g, '');
    const normalizedKeyword = ACCESS_KEYWORD.toLowerCase().replace(/\s+/g, '');

    if (normalizedInput !== normalizedKeyword) {
      setKeywordError(txt.errKeyword);
      setKeywordLoading(false);
      return;
    }
    if (!leadName.trim() || !leadEmail.trim()) {
      setKeywordError(txt.errMissing);
      setKeywordLoading(false);
      return;
    }

    try {
      const tempPassword = `Prova${Date.now()}!`;
      const normalizedEmail = leadEmail.trim().toLowerCase();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let signupData: any = null;
      let signupError: any = null;

      try {
        const result = await supabase.functions.invoke('signup-showcase', {
          body: {
            name:     leadName.trim(),
            email:    normalizedEmail,
            password: tempPassword,
            language: isEn ? 'en' : 'pt',
          },
        });
        signupData  = result.data;
        signupError = result.error;
      } catch (invokeErr: any) {
        if (invokeErr?.name === 'AbortError') {
          throw new Error(isEn ? 'Request timeout. Check your connection.' : 'Tempo esgotado. Verifique sua conexão.');
        }
        throw invokeErr;
      } finally {
        clearTimeout(timeoutId);
      }

      if (signupData?.error === 'email_already_registered') {
        setKeywordError(txt.errEmailUsed);
        setKeywordLoading(false);
        return;
      }
      if (signupError) {
        throw new Error(signupError?.message || txt.errGeneric);
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email:    normalizedEmail,
        password: tempPassword,
      });
      if (loginError) throw loginError;

      initGA4();
      trackSignUp('keyword_provadagua');
      trackTrialStart('keyword');
      navigate('/dashboard');
    } catch (err: any) {
      setKeywordError(err.message || txt.errGeneric);
    } finally {
      setKeywordLoading(false);
    }
  };

  // ── Handler: Showcase SignIn toggle ──────────────────────────────────────
  const handleShowcaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninLoading(true);
    setSigninError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email:    signinEmail.trim().toLowerCase(),
        password: signinPassword,
      });
      if (error) throw error;
      initGA4();
      trackLogin('showcase_signin');
      navigate('/dashboard');
    } catch (err: any) {
      setSigninError(err.message || txt.errLogin);
    } finally {
      setSigninLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: God Mode (triplo clique no logo)
  // ══════════════════════════════════════════════════════════════════════════
  if (isGodMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher variant="compact" />
        </div>

        <div className="max-w-md w-full relative z-10 px-4">
          <div className="text-center mb-8 cursor-pointer" onClick={handleLogoTripleClick}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield className="w-3 h-3" /> God Mode Ativo
            </div>
            <h1 className="text-3xl font-bold text-white font-display tracking-tight mb-1">{txt.adminTitle}</h1>
            <p className="text-slate-500 text-sm">{txt.adminSub}</p>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            <form className="space-y-5" onSubmit={handleGodModeSubmit}>
              <div>
                <label htmlFor="god-email" className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="god-email" name="email" type="email" autoComplete="email" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="admin@encontrodagua.com"
                    value={hubEmail} onChange={e => setHubEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="god-password" className="block text-sm font-medium text-slate-300 mb-1.5">{isEn ? 'Password' : 'Senha'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="god-password" name="password" type={showHubPassword ? 'text' : 'password'}
                    autoComplete="current-password" required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={hubPassword} onChange={e => setHubPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowHubPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showHubPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {hubError && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">{hubError}</div>
              )}

              <button type="submit" disabled={hubLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-purple-700 hover:bg-purple-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                {hubLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>{isEn ? 'Enter' : 'Entrar'}</span><ArrowRight className="ml-2 h-4 w-4" /></>}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            <button onClick={() => setIsGodMode(false)} className="hover:text-slate-400 transition-colors underline underline-offset-2">
              {txt.adminBack}
            </button>
          </p>
        </div>
        <AiflowSupport />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Hub puro (/login sem parâmetro) — APENAS SignIn
  // ══════════════════════════════════════════════════════════════════════════
  if (!isShowcaseRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040a] relative overflow-hidden">
        {/* Ambient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-teal-500/8 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-amber-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher variant="compact" />
        </div>

        <div className="max-w-md w-full relative z-10 px-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <a
              href="/#/"
              onClick={(e) => { if (logoClickCountRef.current >= 2) { e.preventDefault(); handleLogoTripleClick(); } else { handleLogoTripleClick(); } }}
              className="inline-block mb-4 opacity-90 hover:opacity-100 transition-opacity"
              title="Hub Digital"
            >
              <img
                src="/logos/logo-icon-gold-transp.png"
                alt="Encontro d'\u00c1gua Hub"
                className="h-16 w-16 object-contain mx-auto"
              />
            </a>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">{txt.hubTitle}</h1>
            <p className="text-slate-500 text-sm">{txt.hubSub}</p>
          </div>

          <div className="bg-slate-900/60 border border-white/8 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            <form className="space-y-5" onSubmit={handleHubSignIn}>
              {/* Email */}
              <div>
                <label htmlFor="hub-email" className="block text-sm font-medium text-slate-300 mb-1.5">{txt.hubEmailLbl}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="hub-email" type="email" autoComplete="email" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder="seu@email.com"
                    value={hubEmail} onChange={e => setHubEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="hub-password" className="block text-sm font-medium text-slate-300 mb-1.5">{txt.hubPassLbl}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="hub-password" type={showHubPassword ? 'text' : 'password'}
                    autoComplete="current-password" required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={hubPassword} onChange={e => setHubPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowHubPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showHubPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {hubError && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">
                  {hubError}
                </div>
              )}

              <button
                type="submit"
                disabled={hubLoading}
                id="btn-hub-signin"
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] gap-2"
              >
                {hubLoading
                  ? <><Loader2 className="animate-spin h-5 w-5" /><span>{txt.hubLoading}</span></>
                  : <><Leaf className="w-4 h-4" /> {txt.hubSubmit}</>
                }
              </button>
            </form>
          </div>

          <div className="mt-4 text-center space-y-2">
            <p className="text-xs text-slate-600">{txt.footer}</p>
            <a
              id="hub-login-not-team"
              href="/#/showcase"
              className="inline-block text-xs text-purple-500 hover:text-purple-400 transition-colors"
            >
              {txt.hubNotTeam}
            </a>
          </div>
        </div>

        <AiflowSupport />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Showcase / Provadágua — Cadastrar com palavra-chave (ou toggle SignIn)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-amber-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-[20%] w-[30%] h-[30%] bg-teal-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="max-w-md w-full relative z-10 px-4">
        {/* Logo */}
        <div className="text-center mb-4">
          <a
            href="/#/showcase"
            onClick={() => handleLogoTripleClick()}
            className="inline-block mb-2 opacity-90 hover:opacity-100 transition-opacity"
          >
            <img
              src="/logos/logo-icon-gold-transp.png"
              alt="Encontro d'Água Hub"
              className="h-14 w-14 object-contain mx-auto"
            />
          </a>
          <h1 className="text-xl font-extrabold text-white mb-2">
            {showcaseView === 'register' ? txt.regTitle : txt.signinTitle}
          </h1>
        </div>

        {/* Abas: Novo Cadastro / Já tenho conta — V6.0: abas maiores e mais claras */}
        <div className="flex rounded-xl bg-slate-900/50 border border-white/10 p-1 mb-4 gap-1">
          <button
            id="tab-register"
            type="button"
            onClick={() => { setShowcaseView('register'); setKeywordError(null); setSigninError(null); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              showcaseView === 'register'
                ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {txt.regTab}
          </button>
          <button
            id="tab-signin"
            type="button"
            onClick={() => { setShowcaseView('signin'); setKeywordError(null); setSigninError(null); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              showcaseView === 'signin'
                ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {txt.signinTab}
          </button>
        </div>

        <div className="bg-slate-900/60 border border-white/8 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">

          {/* ── CADASTRAR (padrão) ── */}
          {showcaseView === 'register' && (
            <form onSubmit={handleKeywordSubmit} className="space-y-4">
              <p className="text-slate-500 text-xs text-center mb-2">{txt.regSub}</p>

              {/* Nome */}
              <div>
                <label htmlFor="lead-name" className="block text-sm font-medium text-slate-300 mb-1.5">{txt.regName}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="lead-name" type="text" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder={isEn ? 'Your name' : 'Seu nome'}
                    value={leadName} onChange={e => setLeadName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="lead-email" className="block text-sm font-medium text-slate-300 mb-1.5">{txt.regEmail}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="lead-email" type="email" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="seu@email.com"
                    value={leadEmail} onChange={e => setLeadEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Palavra-chave */}
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-slate-300 mb-1.5">{txt.regKeyword}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="keyword" type="text" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder={txt.regKeyPlaceholder}
                    value={keyword} onChange={e => setKeyword(e.target.value)}
                  />
                </div>

                {/* Solicitar palavra-chave */}
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xs text-slate-600">{txt.regNoKey}</p>
                  <a
                    id="btn-request-keyword"
                    href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${WHATSAPP_KEYWORD_MSG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    {txt.regRequestKey}
                  </a>
                </div>
              </div>

              {keywordError && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">
                  {keywordError}
                </div>
              )}

              <button
                type="submit"
                disabled={keywordLoading}
                id="btn-register-showcase"
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] gap-2"
              >
                {keywordLoading
                  ? <><Loader2 className="animate-spin h-5 w-5" /><span>{txt.regLoading}</span></>
                  : txt.regSubmit
                }
              </button>

              {/* Toggle → Entrar — V6.0: botão prominente com borda */}
              <button
                type="button"
                id="btn-toggle-signin"
                onClick={() => { setShowcaseView('signin'); setKeywordError(null); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/60 text-sm font-bold transition-all active:scale-[0.98]"
              >
                {txt.regHaveAccount}
              </button>
            </form>
          )}

          {/* ── ENTRAR (toggle) ── */}
          {showcaseView === 'signin' && (
            <form onSubmit={handleShowcaseSignIn} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-1">{txt.signinTitle}</h2>
                <p className="text-slate-400 text-xs">{txt.signinSub}</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="signin-email" type="email" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="seu@email.com"
                    value={signinEmail} onChange={e => setSigninEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-slate-300 mb-1.5">{isEn ? 'Password' : 'Senha'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="signin-password" type={showSigninPassword ? 'text' : 'password'} required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={signinPassword} onChange={e => setSigninPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowSigninPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showSigninPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {signinError && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">
                  {signinError}
                </div>
              )}

              <button
                type="submit"
                disabled={signinLoading}
                id="btn-showcase-signin"
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] gap-2"
              >
                {signinLoading
                  ? <><Loader2 className="animate-spin h-5 w-5" /><span>{txt.signinLoading}</span></>
                  : <><Leaf className="w-4 h-4" /> {txt.signinSubmit}</>
                }
              </button>

              {/* Toggle → Cadastrar */}
              <button
                type="button"
                id="btn-toggle-register"
                onClick={() => { setShowcaseView('register'); setSigninError(null); }}
                className="w-full text-slate-500 hover:text-purple-400 text-xs transition-colors py-1 text-center"
              >
                {txt.signinBack}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">{txt.footer}</p>
      </div>

      <AiflowSupport />
    </div>
  );
};

export default Login;
