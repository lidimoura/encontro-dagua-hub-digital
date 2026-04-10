import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, Key, Leaf, Shield, User, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { AiflowSupport } from '@/components/AiflowSupport';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { initGA4, trackTrialStart, trackLogin, trackSignUp } from '@/lib/analytics';

// ── Lead Gate Config ─────────────────────────────────────────────────────────
// Palavra-chave: controlada pela env var (padrão: provadagua)
const ACCESS_KEYWORD = import.meta.env.VITE_ACCESS_KEYWORD || 'provadagua';
const WHATSAPP_NUMBER = '5592992943998';
const PROVA_URL = 'https://prova.encontrodagua.com/#/showcase';

// ── God Mode trigger: URL param ?god=true ou triplo clique no logo
// ─────────────────────────────────────────────────────────────────────────────

type GateView = 'choose' | 'keyword' | 'lead_form';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Detecta God Mode via URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const isGodModeUrl = urlParams.get('god') === 'true';

  // ── God Mode toggle via triplo clique no logo ──────────────────────────
  const logoClickCountRef = useRef(0);
  const logoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGodMode, setIsGodMode] = useState(isGodModeUrl);

  const handleLogoTripleClick = () => {
    logoClickCountRef.current += 1;
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 600);
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
  const [keywordSuccess, setKeywordSuccess] = useState(false);

  // ── God Mode state ────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ── Handlers: Lead Gate — Keyword (V4.3: trial imediato via Edge Function) ─
  const handleKeywordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeywordLoading(true);
    setKeywordError(null);

    const normalizedInput = keyword.trim().toLowerCase().replace(/\s+/g, '');
    const normalizedKeyword = ACCESS_KEYWORD.toLowerCase().replace(/\s+/g, '');

    if (normalizedInput !== normalizedKeyword) {
      setKeywordLoading(false);
      setKeywordError('Palavra-chave incorreta. Solicite ao administrador.');
      return;
    }

    if (!leadName.trim() || !leadEmail.trim()) {
      setKeywordLoading(false);
      setKeywordError('Preencha seu nome e e-mail para continuar.');
      return;
    }

    try {
      // ── V4.3: Chama signup-showcase → cria user com email_confirm:true ─────
      // Sem barreiras de aprovação manual. Trial de 7 dias liberado na hora.
      const tempPassword = `Prova${Date.now()}!`;
      const normalizedEmail = leadEmail.trim().toLowerCase();

      const { data: signupData, error: signupError } = await supabase.functions.invoke('signup-showcase', {
        body: {
          name:     leadName.trim(),
          email:    normalizedEmail,
          password: tempPassword,
          language: 'pt',
        },
      });

      // Trata email já cadastrado: tenta login direto
      if (signupError || signupData?.error === 'email_already_registered') {
        if (signupData?.error === 'email_already_registered') {
          // Usuário já existe — informa e direciona para login admin
          setKeywordError('E-mail já cadastrado. Entre pelo acesso administrativo ou use outro e-mail.');
          setKeywordLoading(false);
          return;
        }
        throw new Error(signupError?.message || signupData?.error || 'Erro ao criar conta.');
      }

      // ── Auto-login imediato (email já confirmado pela Edge Function) ──────
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email:    normalizedEmail,
        password: tempPassword,
      });

      if (loginError) throw loginError;

      // ── Tracking GA4 ─────────────────────────────────────────────────────
      initGA4();
      trackSignUp('keyword_provadagua');
      trackTrialStart('keyword');

      // ── Redireciona direto para o dashboard — trial ativo! ────────────────
      navigate('/dashboard');
    } catch (err: any) {
      setKeywordError(err.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setKeywordLoading(false);
    }
  };

  // ── Handlers: God Mode Login ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  // ── Render: Success state ────────────────────────────────────────────
  if (keywordSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-md w-full relative z-10 px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/30">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Seja bem-vinda! 🌿</h1>
          <p className="text-slate-300 mb-2">
            Acesso liberado! Verifique seu e-mail para confirmar o cadastro.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Após confirmar, entre em contato pelo WhatsApp para receber seu onboarding personalizado.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Me cadastrei no Hub com a palavra-chave e preciso de ajuda com o acesso. Nome: ${leadName}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-2xl shadow-green-500/20 mb-3"
          >
            Falar com a equipe no WhatsApp
          </a>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 px-8 rounded-2xl transition-all"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // ── Render: God Mode (admin login) ──────────────────────────────────
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
          {/* Logo com triplo clique para alternar modo */}
          <div className="text-center mb-8 cursor-pointer" onClick={handleLogoTripleClick}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield className="w-3 h-3" /> God Mode Ativo
            </div>
            <h1 className="text-3xl font-bold text-white font-display tracking-tight mb-2">
              Acesso Administrativo
            </h1>
            <p className="text-slate-500 text-sm">lidimfc — Super Admin</p>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="god-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="god-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="admin@encontrodagua.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="god-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="god-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-purple-700 hover:bg-purple-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <><span>Entrar</span><ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            <button
              onClick={() => setIsGodMode(false)}
              className="hover:text-slate-400 transition-colors underline underline-offset-2"
            >
              ← Voltar ao acesso padrão
            </button>
          </p>
        </div>
        <AiflowSupport />
      </div>
    );
  }

  // ── Render: Lead Gate (padrão) ────────────────────────────────────────
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
              src="/logos/logo-full-dark-gold.png"
              alt="Encontro d'Água Hub"
              className="h-14 object-contain mx-auto"
            />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Leaf className="w-3 h-3" /> Reflorestar o Digital
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display tracking-tight mb-2">
            Bem-vinda ao Hub 🌿
          </h1>
          <p className="text-slate-400 text-sm">
            Acesso exclusivo por convite ou palavra-chave.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-white/8 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {/* ── TELA 1: Escolha o caminho ── */}
          {gateView === 'choose' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Como você chegou aqui?
                </p>
              </div>

              {/* Opção 1: Experimentar Ecossistema */}
              <button
                id="btn-lead-trial"
                onClick={() => window.open(PROVA_URL, '_blank')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 hover:border-emerald-400/50 hover:from-emerald-900/60 hover:to-teal-900/60 transition-all group text-left"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                  <ExternalLink className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">Experimentar Ecossistema</p>
                  <p className="text-emerald-400/80 text-xs mt-0.5">Acesse a vitrine da Provadágua — 7 dias grátis →</p>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-500/60 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-900/60 text-slate-600">ou</span>
                </div>
              </div>

              {/* Opção 2: Entrar no Hub (via palavra-chave) */}
              <button
                id="btn-keyword"
                onClick={() => setGateView('keyword')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 transition-all group text-left"
              >
                <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/20 transition-colors">
                  <Key className="w-5 h-5 text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">Entrar no Hub</p>
                  <p className="text-slate-500 text-xs mt-0.5">Acesso com palavra-chave — trial imediato</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </button>

              <p className="text-xs text-slate-600 text-center pt-2">
                Profissionais de Saúde e Empreendedores
              </p>
            </div>
          )}

          {/* ── TELA 2: Formulário com palavra-chave ── */}
          {gateView === 'keyword' && (
            <form onSubmit={handleKeywordSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-white mb-1">Cadastro de Acesso</h2>
                <p className="text-slate-400 text-xs">Preencha seus dados e a palavra-chave</p>
              </div>

              <div>
                <label htmlFor="lead-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Seu nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="lead-name"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder="Seu nome"
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lead-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Seu e-mail profissional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="lead-email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder="seu@email.com"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Palavra-chave de acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="keyword"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm"
                    placeholder="Sua palavra-chave..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Não tem?{' '}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:text-teal-400 underline"
                  >
                    Solicite ao admin
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
                {keywordLoading ? (
                  <><Loader2 className="animate-spin h-5 w-5" /><span>Abrindo acesso...</span></>
                ) : (
                  <><Leaf className="w-4 h-4" /> Entrar no Hub — Acesso Imediato</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setGateView('choose')}
                className="w-full text-slate-500 hover:text-slate-300 text-xs transition-colors py-1"
              >
                ← Voltar
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Encontro D'Água Hub. Todos os direitos reservados.
        </p>
      </div>

      <AiflowSupport />
    </div>
  );
};

export default Login;
