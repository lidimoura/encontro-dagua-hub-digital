import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, Key, Leaf, Shield, User, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { AiflowSupport } from '@/components/AiflowSupport';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { initGA4, trackTrialStart, trackLogin, trackSignUp } from '@/lib/analytics';

// ── Lead Gate Config ─────────────────────────────────────────────────────────
const ACCESS_KEYWORD = import.meta.env.VITE_ACCESS_KEYWORD || 'provadagua';
// Número oficial de suporte (Curitiba Business)
const WHATSAPP_SUPPORT = '5541992557600';
const PROVA_URL = 'https://prova.encontrodagua.com/#/showcase';

type GateView = 'choose' | 'keyword';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  // Detecta God Mode via URL param
  const urlParams = new URLSearchParams(window.location.search);
  const isGodModeUrl = urlParams.get('god') === 'true';

  // ── God Mode toggle via triplo clique no logo ──────────────────────────
  const logoClickCountRef = useRef(0);
  const logoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // ── Gate view state ────────────────────────────────────────────────────
  const [gateView, setGateView] = useState<GateView>('choose');
  const [keyword, setKeyword] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  // ── God Mode state ────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // i18n helpers (fallback para garantir nunca exibir undefined)
  // ─────────────────────────────────────────────────────────────────────────
  const isEn = language === 'en';

  const txt = {
    badge:       isEn ? '🌀 Reforesting the Digital' : '🌀 Reflorestar o Digital',
    welcome:     isEn ? 'Welcome to the Hub 🌿' : 'Bem-vinda ao Hub 🌿',
    subtitle:    isEn ? 'Exclusive access by invitation or keyword.' : 'Acesso exclusivo por convite ou palavra-chave.',
    optTrialLbl: isEn ? 'Request Access / See Demo' : 'Solicitar Acesso / Ver Demo',
    optTrialSub: isEn ? 'Explore the Hub without commitment — Provadágua showcase →' : 'Conheça o Hub sem compromisso — vitrine Provadágua →',
    optHubLbl:   isEn ? 'Enter the Hub' : 'Entrar no Hub',
    optHubSub:   isEn ? 'Access with keyword — immediate trial' : 'Acesso com palavra-chave — trial imediato',
    noCard:      isEn ? 'Exclusive access. No credit card.' : 'Acesso exclusivo. Sem cartão de crédito.',
    kwTitle:     isEn ? 'Keyword Access' : 'Acesso via Palavra-chave',
    kwSub:       isEn ? 'For clients with admin-authorized access' : 'Para clientes com acesso liberado pelo administrador',
    kwName:      isEn ? 'Your full name' : 'Seu nome completo',
    kwEmail:     isEn ? 'Your professional email' : 'Seu e-mail profissional',
    kwField:     isEn ? 'Access keyword' : 'Palavra-chave de acesso',
    kwPlaceholder: isEn ? 'Your keyword...' : 'Sua palavra-chave...',
    kwNoKey:     isEn ? "Don't have one?" : 'Não tem?',
    kwRequest:   isEn ? 'Request from admin' : 'Solicitar ao admin',
    kwSubmit:    isEn ? '🌿 Enter Hub — Immediate Access' : '🌿 Entrar no Hub — Acesso Imediato',
    kwLoading:   isEn ? 'Opening access...' : 'Abrindo acesso...',
    kwBack:      isEn ? '← Back' : '← Voltar',
    hubBlocked:  isEn
      ? 'Restricted administrative access. Please enter through the Provadágua page.'
      : 'Acesso administrativo restrito. Por favor, entre pela página da Provadágua.',
    errMissing:  isEn ? 'Fill in your name and email to continue.' : 'Preencha seu nome e e-mail para continuar.',
    errKeyword:  isEn ? 'Wrong keyword. Request from admin.' : 'Palavra-chave incorreta. Solicite ao administrador.',
    errGeneric:  isEn ? 'Registration error. Try again.' : 'Erro ao registrar. Tente novamente.',
    errEmailUsed:isEn ? 'Email already registered. Contact admin.' : 'E-mail já cadastrado. Entre em contato com o administrador.',
    footer:      isEn ? `© ${new Date().getFullYear()} Encontro D'Água Hub. All rights reserved.` : `© ${new Date().getFullYear()} Encontro D'Água Hub. Todos os direitos reservados.`,
    adminTitle:  isEn ? 'Administrative Access' : 'Acesso Administrativo',
    adminSub:    isEn ? 'lidimfc — Super Admin' : 'lidimfc — Super Admin',
    adminBack:   isEn ? '← Back to standard access' : '← Voltar ao acesso padrão',
  };

  // ── Handler: Keyword Submit (V5.3 — trial imediato + acesso separado) ─────
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
      // ── V5.3: Chama signup-showcase com timeout de 15s ────────────────────
      const tempPassword = `Prova${Date.now()}!`;
      const normalizedEmail = leadEmail.trim().toLowerCase();

      // Timeout controller — evita loading infinito
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

      // Tratar email já cadastrado
      if (signupData?.error === 'email_already_registered') {
        setKeywordError(txt.errEmailUsed);
        setKeywordLoading(false);
        return;
      }

      if (signupError) {
        throw new Error(signupError?.message || txt.errGeneric);
      }

      // ── Auto-login imediato ────────────────────────────────────────────────
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email:    normalizedEmail,
        password: tempPassword,
      });

      if (loginError) throw loginError;

      // ── GA4 Tracking ──────────────────────────────────────────────────────
      initGA4();
      trackSignUp('keyword_provadagua');
      trackTrialStart('keyword');

      // ── Redireciona para /dashboard — sandbox isolada da Provadágua ────────
      navigate('/dashboard');

    } catch (err: any) {
      setKeywordError(err.message || txt.errGeneric);
    } finally {
      setKeywordLoading(false);
    }
  };

  // ── Handler: God Mode Login (Hub exclusivo da Lidi) ───────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const userId = signInData.user?.id;
      if (!userId) throw new Error('ID de usuário não encontrado.');

      // ── V5.3: Verificar se o usuário é admin/equipe do Hub ─────────────────
      // Apenas super_admin e is_super_admin podem usar o God Mode
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, access_level')
        .eq('id', userId)
        .single();

      const isHubAdmin = profile?.is_super_admin === true;

      if (!isHubAdmin) {
        // Não é admin do Hub — bloquear e redirecionar para vitrine
        await supabase.auth.signOut();
        setError(txt.hubBlocked);
        setLoading(false);
        return;
      }

      initGA4();
      trackLogin('god_mode');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || (isEn ? 'Login failed' : 'Falha ao realizar login'));
    } finally {
      setLoading(false);
    }
  };

  // ── Render: God Mode (admin Hub exclusivo) ──────────────────────────
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
            <h1 className="text-3xl font-bold text-white font-display tracking-tight mb-1">
              {txt.adminTitle}
            </h1>
            <p className="text-slate-500 text-sm">{txt.adminSub}</p>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                    value={email} onChange={e => setEmail(e.target.value)}
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
                    id="god-password" name="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password" required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-purple-700 hover:bg-purple-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><span>{isEn ? 'Enter' : 'Entrar'}</span><ArrowRight className="ml-2 h-4 w-4" /></>}
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

  // ── Render: Lead Gate (padrão — Provadágua) ───────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-teal-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-amber-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-[20%] w-[30%] h-[30%] bg-green-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="max-w-md w-full relative z-10 px-4">
        {/* Logo — triplo clique ativa God Mode */}
        <div className="text-center mb-8">
          <button
            onClick={handleLogoTripleClick}
            className="inline-block mb-4 opacity-90 hover:opacity-100 transition-opacity"
            title="Hub Digital"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <img
              src="/logos/logo-icon-gold-transp.png"
              alt="Encontro d'Água Hub"
              className="h-16 w-16 object-contain mx-auto"
            />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Leaf className="w-3 h-3" /> {txt.badge}
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display tracking-tight mb-2">
            {txt.welcome}
          </h1>
          <p className="text-slate-400 text-sm">{txt.subtitle}</p>
        </div>

        <div className="bg-slate-900/60 border border-white/8 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {/* ── TELA 1: Escolha o caminho ── */}
          {gateView === 'choose' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {isEn ? 'How did you get here?' : 'Como você chegou aqui?'}
                </p>
              </div>

              {/* Opção 1: Ver Demo / Solicitar Acesso */}
              <button
                id="btn-lead-trial"
                onClick={() => window.open(PROVA_URL, '_blank')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 hover:border-emerald-400/50 hover:from-emerald-900/60 hover:to-teal-900/60 transition-all group text-left"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                  <ExternalLink className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{txt.optTrialLbl}</p>
                  <p className="text-emerald-400/80 text-xs mt-0.5">{txt.optTrialSub}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-500/60 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-900/60 text-slate-600">{isEn ? 'or' : 'ou'}</span>
                </div>
              </div>

              {/* Opção 2: Entrar no Hub com palavra-chave */}
              <button
                id="btn-keyword"
                onClick={() => setGateView('keyword')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 transition-all group text-left"
              >
                <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/20 transition-colors">
                  <Key className="w-5 h-5 text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{txt.optHubLbl}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{txt.optHubSub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </button>

              <p className="text-xs text-slate-600 text-center pt-2">{txt.noCard}</p>
            </div>
          )}

          {/* ── TELA 2: Formulário com palavra-chave ── */}
          {gateView === 'keyword' && (
            <form onSubmit={handleKeywordSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-white mb-1">{txt.kwTitle}</h2>
                <p className="text-slate-400 text-xs">{txt.kwSub}</p>
              </div>

              <div>
                <label htmlFor="lead-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  {txt.kwName}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="lead-name" type="text" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder={isEn ? 'Your name' : 'Seu nome'}
                    value={leadName} onChange={e => setLeadName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lead-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  {txt.kwEmail}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="lead-email" type="email" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder="seu@email.com"
                    value={leadEmail} onChange={e => setLeadEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-slate-300 mb-1.5">
                  {txt.kwField}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="keyword" type="text" required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder={txt.kwPlaceholder}
                    value={keyword} onChange={e => setKeyword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {txt.kwNoKey}{' '}
                  <a
                    href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(isEn ? 'Hello! I need an access keyword for the Hub.' : 'Olá! Preciso de uma palavra-chave de acesso ao Hub.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:text-teal-400 underline"
                  >
                    {txt.kwRequest}
                  </a>
                </p>
              </div>

              {keywordError && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">
                  {keywordError}
                </div>
              )}

              <button
                type="submit"
                disabled={keywordLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] gap-2"
              >
                {keywordLoading
                  ? <><Loader2 className="animate-spin h-5 w-5" /><span>{txt.kwLoading}</span></>
                  : <><Leaf className="w-4 h-4" /> {txt.kwSubmit}</>
                }
              </button>

              <button type="button" onClick={() => setGateView('choose')} className="w-full text-slate-500 hover:text-slate-300 text-xs transition-colors py-1">
                {txt.kwBack}
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
