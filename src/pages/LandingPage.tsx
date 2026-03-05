import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Sparkles, Zap, Users, TrendingUp, QrCode, Menu, X, ChevronLeft, ChevronRight, ArrowRight,
  Globe, CheckCircle, Copy, Play, Bot, Brain, MessageCircle, Linkedin, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCode } from 'react-qrcode-logo';
import { ApplicationModal } from '@/components/ApplicationModal';
import { PhoneSimulator } from '@/components/PhoneSimulator';
import { CRMSimulator } from '@/components/CRMSimulator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTranslation } from '@/hooks/useTranslation';

// TEAM_MEMBERS MOVED INSIDE COMPONENT TO USE TRANSLATION

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const TEAM_MEMBERS = [
    {
      id: 'lidi',
      name: "Lidi",
      role: t('founderRole'),
      type: "human",
      image: "/profile.png",
      color: "border-amber-500 text-amber-400",
      linkedin: "https://linkedin.com/in/sua-url",
      pitch: t('founderPitch')
    },
    {
      id: 'precy',
      name: "Precy",
      role: t('techLeadRole'),
      type: "ai",
      color: "border-blue-500 text-blue-400",
      pitch: t('precyPitch')
    },
    {
      id: 'amazo',
      name: "Amazô",
      role: t('csRole'),
      type: "ai",
      image: "/avatar-amazo.jpeg",
      color: "border-fuchsia-500 text-fuchsia-400",
      pitch: t('amazoPitch')
    },
    {
      id: 'antigravity',
      name: "Antigravity",
      role: t('devRole'),
      type: "ai",
      color: "border-purple-500 text-purple-400",
      pitch: t('antigravityPitch')
    }
  ];

  // Prompt Lab State
  const [idea, setIdea] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  // CRM Simulator Interactive State
  const [showAIInsight, setShowAIInsight] = useState(true);
  const [cardMoved, setCardMoved] = useState(false);

  // Amazo Init
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js'; Typebot.initBubble({ typebot: "template-chatbot-amazo-landigpage", apiHost: "https://typebot.co", theme: { button: { backgroundColor: "#4a044e", customIconSrc: "https://s3.typebot.io/public/workspaces/cmcppn5am0002jx04z0h8go9a/typebots/al5llo2evf2ahjg5u4valfnc/bubble-icon?v=1766194905653", }, chatWindow: { backgroundColor: "#F8F8F8" } }, });`;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); document.querySelector('typebot-bubble')?.remove(); };
  }, []);

  // AMAZÔ CHAT - Keep user on page (NO new tab)
  const openAmazoChat = () => {
    // Try Typebot.open() first
    if (typeof window !== 'undefined' && (window as any).Typebot) {
      try {
        (window as any).Typebot.open();
        return;
      } catch (error) {
        console.warn('Typebot.open() failed:', error);
      }
    }

    // Fallback: Visual cue to floating widget
    const bubble = document.querySelector('typebot-bubble');
    if (bubble) {
      // Scroll to bottom where widget is
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

      // Show visual indicator
      const indicator = document.createElement('div');
      indicator.innerHTML = '⬇️ Chat Amazô no canto inferior direito';
      indicator.style.cssText = 'position: fixed; bottom: 100px; right: 20px; background: linear-gradient(135deg, #d946ef, #a855f7); color: white; padding: 12px 20px; border-radius: 12px; font-weight: bold; z-index: 9999; animation: bounce 1s infinite; box-shadow: 0 4px 20px rgba(217, 70, 239, 0.5);';
      document.body.appendChild(indicator);

      setTimeout(() => indicator.remove(), 4000);
    } else {
      // Last resort: alert
      alert('🤖 Amazô IA está carregando. Aguarde alguns segundos e tente novamente.');
    }
  };

  // Test Prompt with correct API config
  const handleTestPrompt = async () => {
    if (!optimizedResult) return;
    setIsTesting(true);
    setTestResponse(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key do Gemini não configurada');

      const genAI = new GoogleGenerativeAI(apiKey);

      // Use same model as handleOptimize (gemini-2.5-flash-lite)
      let model;
      try {
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      } catch {
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      }

      const result = await model.generateContent(optimizedResult);
      const response = await result.response;
      const text = response.text().trim();

      setTestResponse(text);
    } catch (error) {
      console.error('Erro ao testar prompt:', error);
      setTestResponse('❌ Erro ao testar. Verifique sua conexão.');
    } finally {
      setIsTesting(false);
    }
  };

  // OLD openAmazoChat - REMOVED
  const OLD_openAmazoChat_REMOVED = () => {
    if (typeof window !== 'undefined' && (window as any).Typebot) {
      (window as any).Typebot.open();
    } else {
      const bubble = document.querySelector('typebot-bubble');
      const shadow = bubble?.shadowRoot;
      const button = shadow?.querySelector('.button-container');
      if (button instanceof HTMLElement) {
        button.click();
      } else {
        console.warn('Typebot not found. Make sure the Typebot script is loaded.');
      }
    }
  };

  const handleOptimize = async () => {
    if (!idea.trim()) return;
    setIsOptimizing(true);
    setOptimizedResult(null);
    setTestResponse(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key do Gemini não configurada');
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      // Try gemini-2.5-flash-lite first, fallback to gemini-1.5-flash (same as internal PromptLab)
      let model;
      try {
        model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      } catch {
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      }

      const systemPrompt = `Atue como um Engenheiro de Prompt Sênior especializado em otimização de prompts para LLMs.

Sua missão é transformar ideias brutas em prompts estruturados, detalhados e prontos para obter o melhor resultado de uma LLM.

REGRAS DE OTIMIZAÇÃO:
1. Seja específico e detalhado
2. Defina claramente o papel/persona que a IA deve assumir
3. Especifique o formato de saída desejado
4. Inclua exemplos quando relevante
5. Adicione restrições e requisitos importantes
6. Use linguagem clara e objetiva
7. Estruture o prompt em seções quando necessário

FORMATO DE SAÍDA:
Retorne APENAS o prompt otimizado, sem explicações adicionais ou meta-comentários.
O prompt deve estar pronto para ser copiado e colado diretamente em uma LLM.

IDEIA BRUTA DO USUÁRIO:
${idea}

Agora, gere o prompt perfeito:`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text().trim();

      setOptimizedResult(text);
    } catch (error) {
      console.error('Erro ao otimizar prompt:', error);
      setOptimizedResult('❌ Erro ao otimizar. Verifique sua conexão ou tente novamente.');
    } finally {
      setIsOptimizing(false);
    }
  };



  // Gallery Projects State
  const [galleryProjects, setGalleryProjects] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch real gallery projects
  useEffect(() => {
    const fetchGalleryProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('in_gallery', true)
          .order('created_at', { ascending: false })
          .limit(10); // Show up to 10 projects

        if (!error && data) {
          setGalleryProjects(data);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGalleryProjects();
  }, []);

  // Gallery scroll functions
  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      const scrollAmount = 300;
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#02040a] text-white font-sans overflow-x-hidden relative">
      <style>{`@keyframes floatRiver { 0% { transform: scale(1.0); } 50% { transform: scale(1.05); } 100% { transform: scale(1.0); } } .river-animation { animation: floatRiver 25s infinite ease-in-out alternate; }`}</style>

      {/* PARALLAX BG */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <div className="w-full h-full bg-cover bg-center river-animation" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* HEADER */}
      <header className="fixed w-full z-[9999] top-0 py-4 px-6 bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-xl font-bold text-white tracking-tight">Encontro D'água .hub 🌀</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#solucoes" className="text-slate-200 hover:text-amber-400 text-sm font-medium">{t('solutions')}</a>
            <a href="#showcase" className="text-slate-200 hover:text-amber-400 text-sm font-medium">{t('gallery')}</a>
            <a href="#sobre" className="text-slate-200 hover:text-amber-400 text-sm font-medium">{t('aboutUs')}</a>

            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="p-2 text-slate-200 hover:text-amber-400 transition-all active:scale-95"
              title={language === 'en' ? 'Mudar para Português' : 'Switch to English'}
            >
              <span className="text-base leading-none">{language === 'en' ? '🇺🇸' : '🇧🇷'}</span>
            </button>

            {user ? (
              <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-fuchsia-900 rounded-full text-sm font-bold">{t('dashboard')}</button>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="text-white text-sm font-bold">{t('login')}</button>
                <button onClick={() => setIsApplicationModalOpen(true)} className="px-6 py-2 bg-amber-500 text-black rounded-full text-sm font-bold hover:bg-amber-400 shadow-lg">{t('becomeClient')}</button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:text-amber-400 transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm md:hidden z-[9998]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel - Unified for all screen sizes */}
            <div className="fixed top-0 right-0 h-full w-[280px] bg-[#02040a] border-l border-white/10 z-[9999] animate-slide-in-right shadow-2xl">
              <div className="flex flex-col h-full p-6">
                {/* Close Button */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="self-end p-2 text-white hover:text-amber-400 transition-colors mb-8"
                >
                  <X size={24} />
                </button>

                <nav className="flex flex-col gap-6">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigate('/'); }}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    {t('home')}
                  </a>
                  <a
                    href="#solucoes"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    {t('solutions')}
                  </a>
                  <a
                    href="#showcase"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    {t('gallery')}
                  </a>
                  <a
                    href="#sobre"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    {t('aboutUs')}
                  </a>

                  <div className="border-t border-white/10 my-4" />

                  {/* Mobile Language Selector */}
                  <div className="flex items-center justify-between text-white px-2">
                    <span className="text-sm font-medium">{t('language') || 'Idioma / Language'}</span>
                    <button
                      onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      title={language === 'en' ? 'Mudar para Português' : 'Switch to English'}
                    >
                      <span className="text-xl leading-none">{language === 'en' ? '🇺🇸' : '🇧🇷'}</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10 my-4" />

                  {user ? (
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full px-6 py-3 bg-fuchsia-900 hover:bg-fuchsia-800 rounded-full text-sm font-bold transition-colors"
                    >
                      {t('dashboard')}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                        className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold transition-colors"
                      >
                        {t('enter')}
                      </button>
                      <button
                        onClick={() => { setIsMenuOpen(false); setIsApplicationModalOpen(true); }}
                        className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-sm font-bold transition-colors shadow-lg"
                      >
                        {t('becomeClient')}
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Add animation styles */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 w-full">

        {/* HERO */}
        <section className="min-h-[90vh] flex flex-col justify-center items-center px-6 text-center pt-20">
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-amber-400 shadow-xl">
              {t('landingBadge')}
            </div>
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl">
              {t('accessibleTech')} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-fuchsia-500">{t('accessibleTechHighlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white font-medium max-w-3xl mx-auto drop-shadow-xl">
              {t('heroSubtitleLanding')}
            </p>
            <div className="pt-10 w-full flex justify-center">
              <button onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce flex flex-col items-center gap-2 text-white hover:text-amber-400">
                <span className="text-xs uppercase tracking-widest font-bold">{t('knowHub')}</span>
                <ArrowRight className="w-6 h-6 rotate-90 text-amber-500" />
              </button>
            </div>
          </div>
        </section>

        {/* ========== B. NOSSAS SOLUÇÕES ========== */}

        {/* INTRO: Nossas Soluções */}
        <section id="solucoes" className="py-16 px-6 bg-[#02040a] text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('ourSolutions')}
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-4">
              {t('solutionsDesc')}
            </p>
          </div>
        </section>

        {/* ────────────────────────────────────────────────── */}
        {/* SOLUÇÃO #1 — LINK D'ÁGUA (DESTAQUE PRINCIPAL)     */}
        {/* ────────────────────────────────────────────────── */}
        <section className="py-20 px-6 bg-gradient-to-br from-[#02040a] via-[#05021a] to-[#02040a] border-y border-teal-500/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left: copy */}
              <div className="flex-1 text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-black uppercase tracking-wider mb-6">
                  <Globe className="w-3 h-3" /> Produto Principal
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                  Link d'Água
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    Sua vitrine digital
                  </span>
                </h2>
                <p className="text-xl text-slate-300 mb-4 max-w-xl">
                  Uma página profissional com <strong className="text-white">todos os seus links, serviços e contatos</strong> em um único endereço compartilhável.
                </p>
                <ul className="space-y-3 mb-10">
                  {[
                    '📱 Link único que vai no WhatsApp, Instagram e cartão',
                    '🛍️ Vitrine de produtos e serviços com fotos',
                    '📊 Analytics de cliques em tempo real',
                    '🔗 QR Code gerado automaticamente',
                    '✅ Sem precisar de site — funciona em qualquer celular',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://link.encontrodagua.com/vitrine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-black rounded-2xl hover:from-teal-400 hover:to-cyan-400 transition-all shadow-2xl shadow-teal-500/30 text-center flex items-center justify-center gap-2 text-lg"
                  >
                    <Globe size={20} /> Ver Vitrine
                  </a>
                  <button
                    onClick={() => setIsApplicationModalOpen(true)}
                    className="px-8 py-4 bg-white/5 border border-teal-500/30 text-teal-300 font-bold rounded-2xl hover:bg-white/10 transition-all text-center"
                  >
                    Quero o meu
                  </button>
                </div>
              </div>

              {/* Right: live preview card */}
              <div className="flex-shrink-0 w-full max-w-xs">
                <div className="relative">
                  <div className="absolute -inset-4 bg-teal-500/10 rounded-3xl blur-xl" />
                  <div className="relative bg-[#0a1a1a] border border-teal-500/20 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-lg font-black text-black">L</div>
                      <div>
                        <p className="font-bold text-white text-sm">Lidi Moura</p>
                        <p className="text-xs text-teal-400">link.encontrodagua.com/lidi</p>
                      </div>
                    </div>
                    {['WhatsApp', 'Instagram', 'Portfólio', 'Agendamento'].map((link) => (
                      <div key={link} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                        <span className="text-sm text-slate-300">{link}</span>
                        <ArrowRight size={14} className="text-teal-400" />
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                      <p className="text-[10px] text-teal-500 font-mono">247 cliques esta semana ↑</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROMPT LAB (INTERATIVO) - Solução #1 */}
        <section className="py-20 px-6 bg-[#05020a] text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-6"><Brain className="w-3 h-3" /> <span>{t('promptLabTag')}</span></div>
            <h3 className="text-3xl font-bold text-white mb-4">{t('promptLabTitle')}</h3>
            <p className="text-lg text-slate-300 mb-4">
              {t('promptLabHeadline')} <span className="text-fuchsia-400 font-semibold">{t('promptLabHeadlineHighlight')}</span> {t('promptLabSub')}
            </p>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              {t('promptLabDesc')}
            </p>

            <div className="flex gap-2 mb-6 bg-slate-900/50 p-2 rounded-2xl border border-white/10">
              <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleOptimize()} placeholder={t('inputPlaceholder')} className="flex-1 bg-transparent border-none px-4 py-3 text-white focus:ring-0 text-lg" />
              <button onClick={handleOptimize} disabled={isOptimizing} className="bg-fuchsia-700 hover:bg-fuchsia-600 px-6 py-3 rounded-xl font-bold text-white disabled:opacity-50">
                {isOptimizing ? t('optimizing') : t('optimize')}
              </button>
            </div>

            {optimizedResult && (
              <div className="text-left bg-[#0f0518] border border-fuchsia-500/20 p-6 rounded-2xl shadow-xl animate-fade-in relative">
                <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap mb-6 p-4 bg-black/30 rounded-lg">{optimizedResult}</pre>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-green-400"><ThumbsUp size={18} /></button>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400"><ThumbsDown size={18} /></button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(optimizedResult); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000) }} className="text-white bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      {copySuccess ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />} {t('copy')}
                    </button>
                    <button onClick={() => setIsApplicationModalOpen(true)} className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/30">
                      <Sparkles size={16} /> {t('accessPro')}
                    </button>
                  </div>
                </div>

                {/* RESULTADO DO TESTE */}
                {testResponse && (
                  <div className="mt-4 p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border-2 border-blue-500/40 rounded-2xl animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-blue-200 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> {t('aiResponse')}
                      </h4>
                      <button onClick={() => { navigator.clipboard.writeText(testResponse); }} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                        <Copy size={14} /> {t('copy')}
                      </button>
                    </div>
                    <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed bg-black/30 p-4 rounded-lg">{testResponse}</pre>
                  </div>
                )}

                {/* BOTÃO TESTAR */}
                {optimizedResult && !isTesting && (
                  <button onClick={handleTestPrompt} className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg flex items-center justify-center gap-2">
                    <Play size={18} /> {t('testPrompt')}
                  </button>
                )}
                {isTesting && (
                  <div className="w-full mt-4 px-6 py-3 bg-blue-900/30 text-blue-300 rounded-xl font-bold flex items-center justify-center gap-2">
                    {t('testing')}
                  </div>
                )}
              </div>
            )}


            <div className="mt-8 p-6 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-xl max-w-2xl mx-auto">
              <p className="text-lg font-bold text-fuchsia-300 mb-3">{t('wantJustPromptLab')}</p>
              <ul className="text-sm text-slate-300 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">🔥</span>
                  <span><strong>{t('promptLabBenefits')}</strong></span>
                </li>
              </ul>
              <button
                onClick={() => window.open('https://wa.me/5592992943998?text=Quero o plano Pro Mensal por R$ 3,00', '_blank')}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-fuchsia-500 hover:to-purple-500 transition-all shadow-lg"
              >
                {t('subscribePro')}
              </button>
            </div>
          </div>
        </section>

        {/* QR D'ÁGUA — ferramenta interna do Hub (não promovida externamente) */}
        <section className="py-12 px-6 bg-[#02040a]">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4 p-5 rounded-2xl bg-white/3 border border-white/5">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <QrCode className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm">QR d'Água</p>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 uppercase tracking-wider">Ferramenta Interna</span>
                  </div>
                  <p className="text-xs text-slate-500">Geração de QR Codes personalizados para clientes Hub — acessível pelo painel de gestão.</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplicationModalOpen(true)}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 whitespace-nowrap border border-purple-500/20 px-4 py-2 rounded-xl hover:bg-purple-500/10 transition-all"
              >
                Sou cliente → acessar
              </button>
            </div>
          </div>
        </section>

        {/* GALERIA DE CLIENTES DO HUB */}
        <section id="showcase" className="py-20 px-6 bg-[#05020a] text-center">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" /> Galeria de Clientes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('clientGallery')}</h2>
            <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
              {t('clientGalleryDesc')}
            </p>

            {/* Horizontal Scroll Container with Navigation Arrows */}
            <div className="relative -mx-4 px-4">
              {/* Left Arrow - Desktop only */}
              <button
                onClick={() => scrollGallery('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded-full text-white transition-all shadow-xl hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Right Arrow - Desktop only */}
              <button
                onClick={() => scrollGallery('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded-full text-white transition-all shadow-xl hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight size={24} />
              </button>

              <div ref={galleryRef} className="flex flex-row gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {!loadingGallery && galleryProjects.length > 0 ? (
                  // Real projects from database
                  galleryProjects.map((project) => (
                    <a
                      key={project.id}
                      href={`/#/v/${project.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-[280px] bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-amber-500/50 transition snap-start cursor-pointer group"
                    >
                      <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-xl p-3 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                        <QRCode
                          value={`${window.location.origin}/#/v/${project.slug}`}
                          size={112}
                          ecLevel="H"
                          fgColor={project.color || '#620939'}
                          bgColor="transparent"
                          qrStyle="dots"
                          eyeRadius={10}
                          logoImage={project.qr_logo_url || ''}
                          logoWidth={project.qr_logo_url ? 28 : 0}
                          logoHeight={project.qr_logo_url ? 28 : 0}
                          removeQrCodeBehindLogo={true}
                        />
                      </div>
                      <h3 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{project.client_name}</h3>
                      <p className="text-xs text-slate-400 mb-3">{project.project_type || 'Cartão Digital'}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{project.description || project.page_title || 'QR Code personalizado'}</p>
                    </a>
                  ))
                ) : (
                  // Fallback mockups when no real data
                  <>
                    <div className="flex-shrink-0 w-[280px] bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-amber-500/50 transition snap-start">
                      <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-xl p-3 flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                      <h3 className="font-bold text-white mb-1">Dra. Ana Silva</h3>
                      <p className="text-xs text-slate-400 mb-3">Advogada • Direito da Família</p>
                      <p className="text-xs text-slate-500">Cartão Digital com links para WhatsApp, Instagram e agendamento</p>
                    </div>

                    <div className="flex-shrink-0 w-[280px] bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-blue-500/50 transition snap-start">
                      <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-xl p-3 flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                      <h3 className="font-bold text-white mb-1">Restaurante Amazônia</h3>
                      <p className="text-xs text-slate-400 mb-3">Gastronomia Regional</p>
                      <p className="text-xs text-slate-500">QR Code no cardápio para pedidos direto no WhatsApp</p>
                    </div>

                    <div className="flex-shrink-0 w-[280px] bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-fuchsia-500/50 transition snap-start">
                      <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-xl p-3 flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                      <h3 className="font-bold text-white mb-1">João Consultor</h3>
                      <p className="text-xs text-slate-400 mb-3">Consultoria de Negócios</p>
                      <p className="text-xs text-slate-500">Link único para portfólio e redes sociais</p>
                    </div>
                  </>
                )}
              </div>

              {/* Scroll Indicator */}
              <div className="text-center mt-2">
                <p className="text-xs text-slate-500">{t('swipeToSee')}</p>
              </div>
            </div>

            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            <div className="mt-8 text-sm text-slate-500">
              {t('wantToAppear')}
            </div>
          </div>
        </section>

        {/* AMAZÔ IA - Solução #3 */}
        <section className="py-20 px-6 bg-[#02040a] border-t border-white/5 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Bot className="w-3 h-3" /> {t('amazoTag')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('amazoTitle')}</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              {t('amazoDesc')}
            </p>

            <div className="bg-gradient-to-br from-fuchsia-900/20 to-purple-900/20 p-8 rounded-3xl border border-fuchsia-500/20 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('talkToAmazo')}</h3>
              <p className="text-slate-300 text-sm mb-6">
                {t('talkToAmazoDesc')}
              </p>
              <button
                onClick={openAmazoChat}
                className="px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl font-bold hover:from-fuchsia-500 hover:to-purple-500 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <MessageCircle size={20} /> {t('chatWithAmazo')}
              </button>
            </div>
          </div>
        </section>

        {/* CRM NATIVO - Solução #4 */}
        <CRMSimulator onCTAClick={() => setIsApplicationModalOpen(true)} />


        {/* ========== C. SOBRE NÓS (INSTITUTIONAL) ========== */}

        {/* 1. MANIFESTO (TEXTO) */}
        <section id="sobre" className="py-20 px-6 bg-[#05020a]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">{t('manifesto')}</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                {t('manifestoText')}
              </p>
            </div>
          </div>
        </section>

        {/* 2. TECNOLOGIA PARA TODOS */}
        <section className="py-24 px-6 bg-[#02040a] text-center">
          <div className="max-w-5xl mx-auto">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500"><Globe size={32} /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('techForAll')}</h2>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {["Atypical Parents", "Neurodivergent", "Indigenous & Reclaiming", "Entrepreneur Parents", "Local Businesses", "Riverside Communities", "PwD", "LGBTQIAPN+", "Black & Brown People", "Communities", "NGOs"].map((tag) => (
                <span key={tag} className="px-5 py-2 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-sm font-semibold cursor-default">{tag}</span>
              ))}
            </div>

            <div className="bg-gradient-to-r from-fuchsia-900/20 to-amber-900/20 p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-2">{t('noOneLeftBehind')}</h3>
              <p className="text-slate-400 text-sm mb-6">{t('socialImpact')}</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button onClick={() => window.open('https://wa.me/5592992943998?text=Olá Lidi! Sou do grupo de impacto social e gostaria da consultoria gratuita de 10min.', '_blank')} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto shadow-lg">
                  <MessageCircle size={18} /> {t('socialConsult')}
                </button>
                <button onClick={openAmazoChat} className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto shadow-lg">
                  <Bot size={18} /> {t('chatWithAmazo')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. EQUIPE */}
        <section id="time" className="py-20 px-6 bg-[#02040a] relative z-10">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-white">{t('team')}</h2></div>
          <div className="relative max-w-lg mx-auto h-[400px] flex items-center justify-center">
            <button onClick={() => setActiveTeamIndex((p) => p === 0 ? TEAM_MEMBERS.length - 1 : p - 1)} className="absolute left-0 z-20 p-2 bg-slate-800 rounded-full text-white"><ChevronLeft /></button>

            <div className="text-center p-8 bg-[#0f0518] border border-white/10 rounded-3xl w-full mx-8 shadow-2xl flex flex-col items-center">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl border-2 ${TEAM_MEMBERS[activeTeamIndex].color.split(' ')[0]} bg-slate-800 mb-4 overflow-hidden`}>
                {TEAM_MEMBERS[activeTeamIndex].image ? <img src={TEAM_MEMBERS[activeTeamIndex].image} alt="" className="w-full h-full object-cover" /> : '🤖'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{TEAM_MEMBERS[activeTeamIndex].name}</h3>
              <span className={`text-xs uppercase font-bold tracking-widest mb-4 block ${TEAM_MEMBERS[activeTeamIndex].color.split(' ')[1]}`}>{TEAM_MEMBERS[activeTeamIndex].role}</span>
              <p className="text-slate-300 text-sm italic mb-4">"{TEAM_MEMBERS[activeTeamIndex].pitch}"</p>
              {TEAM_MEMBERS[activeTeamIndex].linkedin && (
                <a href={TEAM_MEMBERS[activeTeamIndex].linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white"><Linkedin size={20} /></a>
              )}
            </div>

            <button onClick={() => setActiveTeamIndex((p) => p === TEAM_MEMBERS.length - 1 ? 0 : p + 1)} className="absolute right-0 z-20 p-2 bg-slate-800 rounded-full text-white"><ChevronRight /></button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 text-center text-slate-600 text-xs bg-[#02040a] border-t border-white/5">
          <p className="mb-2 text-white font-bold">Encontro D'água .hub 🌀</p>
          <p>Base CRM developed for students... Powered by Encontro D'água Hub</p>
          <p className="mt-2 text-slate-700">{t('footerRights')}</p>
        </footer>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </div>
  );
}