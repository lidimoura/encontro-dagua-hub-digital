import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, Key, Leaf, Shield, User, Eye, EyeOff } from 'lucide-react';
import { AiflowSupport } from '@/components/AiflowSupport';
import { useTranslation } from '@/hooks/useTranslation';

// ── Lead Gate Config ─────────────────────────────────────────────────────────
// A palavra-chave é validada client-side (proteção leve) e futuramente
// pode ser movida para uma Edge Function para maior segurança.
const ACCESS_KEYWORD = import.meta.env.VITE_ACCESS_KEYWORD || 'ReflorestarDigital';
const WHATSAPP_NUMBER = '5592992943998';

// ── God Mode trigger: URL param ?god=true ou triplo clique no logo
// ─────────────────────────────────────────────────────────────────────────────

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

  // ── Lead Gate state ────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordError, setKeywordError] = useState<string | null>(null);
  const [keywordSuccess, setKeywordSuccess] = useState(false);

  // ── God Mode state ────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ── Handlers: Lead Gate ───────────────────────────────────────────────
  const handleKeywordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeywordLoading(true);
    setKeywordError(null);

    // Normaliza: remove espaços, case-insensitive
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
      // Registra o lead no Supabase (tabela profiles / leads)
      // Cria usuário com senha temporária baseada no email para isolamento
      const tempPassword = `Hub${Date.now()}!`;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: leadEmail.trim().toLowerCase(),
        password: tempPassword,
        options: {
          data: {
            full_name: leadName.trim(),
            lead_source: 'keyword_gate',
            keyword_used: 'ReflorestarDigital',
          },
          emailRedirectTo: `${window.location.origin}/#/login`,
        },
      });

      if (signUpError && signUpError.message.includes('already registered')) {
        // Usuário já existe → sugere login (admin pode ter criado)
        setKeywordSuccess(true);
        setKeywordLoading(false);
        return;
      }

      if (signUpError) throw signUpError;

      setKeywordSuccess(true);

      // Notifica via WhatsApp (opcional)
      // Em produção, substituir por webhook/Edge Function
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
            Acesso por convite. Use sua palavra-chave para entrar.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-white/8 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {!showKeywordInput ? (
            // ── Tela inicial ──
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-600 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20 mb-2">
                <Key className="w-8 h-8 text-white" />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                O Hub Digital funciona por <strong className="text-white">acesso exclusivo</strong>.
                Se você possui uma palavra-chave, clique em continuar.
              </p>

              <button
                onClick={() => setShowKeywordInput(true)}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/10 gap-2"
              >
                <Key className="w-4 h-4" /> Tenho a palavra-chave
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-900/60 text-slate-600">ou</span>
                </div>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Quero entrar no Hub Digital. Como funciona?')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/8 transition-all gap-2"
              >
                Solicitar acesso pelo WhatsApp
              </a>

              <p className="text-xs text-slate-600 pt-2">
                Profissionais de Saúde e Empreendedores &mdash; acesso por indicação.
              </p>
            </div>
          ) : (
            // ── Formulário Lead Gate ──
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
                  Não tem? <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:text-teal-400 underline"
                  >Solicite ao admin</a>
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
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <><Leaf className="w-4 h-4" /> Solicitar acesso</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowKeywordInput(false)}
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
