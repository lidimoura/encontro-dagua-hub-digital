import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Sparkles, Zap, Users, TrendingUp, QrCode, Menu, X, ChevronLeft, ChevronRight, ArrowRight,
  Globe, CheckCircle, Copy, Play, Bot, Brain, MessageCircle, Linkedin, Github, ThumbsUp, ThumbsDown,
  Heart, Briefcase, Link as LinkIcon, ChevronDown, Leaf, ShieldCheck, Target, BarChart3, Filter
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCode } from 'react-qrcode-logo';
import { ApplicationModal } from '@/components/ApplicationModal';
import { KommoPartnerSection } from '@/components/KommoPartnerSection';
import { PhoneSimulator } from '@/components/PhoneSimulator';
import { CRMSimulator } from '@/components/CRMSimulator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTranslation } from '@/hooks/useTranslation';
import { handleStripeCheckout } from '@/lib/stripe';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { translations } from '@/lib/translations';


// ── Canais Oficiais de Roteamento (V10.3) ──────────────────────────────────
const AMAZO_G10_URL = 'https://amazo-guia-g10.streamlit.app/';
const WA_BUSINESS_PHONE = '5541992557600';
const HUB_EMAIL = 'encontrodaguahub@gmail.com';
const HUB_CALENDAR_URL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultoria%20%26%20Diagn%C3%B3stico%20%E2%80%94%20Encontro%20d%27%C3%81gua%20Hub&add=${encodeURIComponent(HUB_EMAIL)}&details=${encodeURIComponent('Olá Lídi Moura (encontrodaguahub@gmail.com), gostaria de agendar uma consultoria/diagnóstico estratégico de Dados, IA e Kommo CRM.')}`;

// ── IcebergDetails: detalhes técnicos e credenciais (Responsivo V10.3) ──────
function IcebergDetails() {
  const [open, setOpen] = React.useState(false);
  const items = [
    {
      title: 'Análise de Dados, BI & Estruturação',
      content: 'Organização completa de dados, regras de negócio, catálogos e documentos do zero. Dashboards executivos e pesquisas de satisfação automatizadas com Power BI (Certificada Fundação Bradesco), Python e Streamlit.',
    },
    {
      title: 'IA Aplicada, RAG & Automação (G10 & G11 ONE)',
      content: 'Arquitetura de Agentes de IA no GPTMaker integrados ao Kommo CRM e sistemas SDR-RAG auditáveis (Amazô.guia G10). Especializações G10 IA for Tech e G11 IA for Business (Oracle Next Education + Alura).',
    },
    {
      title: 'Liderança Técnica & Data Science (Campeã G9)',
      content: 'Formada em Data Science pelo programa ONE (G9) e Líder Técnica da equipe campeã em 1º lugar no Hackathon G9 NoCountry, conduzindo arquitetura de dados, integração Cloud e pitch oficial.',
    },
    {
      title: 'Cloud Oracle (OCI), Segurança & Stack',
      content: 'Certificada OCI Foundations Associate e OCI AI Foundations Associate. Backend em Supabase (PostgreSQL + RLS multi-tenant), APIs REST, Webhooks, React/TypeScript e conformidade LGPD by design.',
    },
  ];

  return (
    <div className="mt-6 w-full text-center">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all group"
      >
        <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        {open ? 'Ocultar detalhes técnicos e credenciais' : 'Ver detalhes técnicos, certificações e stack (para clientes, recrutadores e hunters)'}
        <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left animate-in fade-in slide-in-from-top-2 duration-300">
          {items.map(item => (
            <div key={item.title} className="bg-slate-900/70 border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 transition-colors">
              <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                {item.title}
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [prefilledInterest, setPrefilledInterest] = useState<string | undefined>(undefined);
  const [isAgenteIAExpanded, setIsAgenteIAExpanded] = useState(false);

  // Helper: abrir LeadCaptureModal pré-configurado para Agente IA
  const openAgenteIAModal = () => {
    setPrefilledInterest('agente_ia_80');
    setIsLeadModalOpen(true);
  };

  const TEAM_MEMBERS = [
    {
      id: 'lidi',
      name: "Lidi Moura",
      role: "Analista de Dados, IA e Automação · Parceira Certificada Kommo · OCI & OCI AI Foundations Associate",
      type: "human",
      image: "/profile.png",
      color: "border-amber-500 text-amber-400",
      linkedin: "https://linkedin.com/in/lidimoura",
      github: "https://github.com/lidimoura",
      portfolio: "https://link.encontrodagua.com/r/portifolio-lidimoura",
      pitch: "Analista de Dados, IA e Automação com formação em Psicologia e +10 anos em Customer Success. Parceira Certificada Kommo CRM, certificada Oracle Cloud (OCI & OCI AI Foundations Associate) e Power BI (Fundação Bradesco). Concluiu Data Science no G9/ONE — onde foi Líder Técnica da equipe campeã (1º lugar) do Hackathon G9 NoCountry — e integra os programas G10 IA for Tech e G11 IA for Business do ONE (Oracle Next Education + Alura).",
      badges: [
        "📊 Analista de Dados, IA & Automação",
        "🤝 Parceira Certificada Kommo CRM",
        "☁️ OCI & OCI AI Foundations Associate",
        "📈 Power BI (Fundação Bradesco)",
        "🏆 1º Lugar Hackathon G9 NoCountry (Líder Técnica · Data Science)",
        "🚀 ONE: G9 Data Science · G10 IA for Tech · G11 IA for Business"
      ]
    },
    {
      id: 'precy',
      name: "Precy",
      role: t('techLeadRole'),
      type: "ai",
      image: "",
      emoji: "🤖",
      color: "border-blue-500 text-blue-400",
      pitch: t('precyPitch')
    },
    {
      id: 'jury',
      name: "Jury",
      role: t('csRole'),
      type: "ai",
      image: "",
      emoji: "⚖️",
      color: "border-fuchsia-500 text-fuchsia-400",
      pitch: t('juryPitch')
    },
    {
      id: 'antigravity',
      name: "Antigravity",
      role: t('devRole'),
      type: "ai",
      image: "/logos/logo-light.png",
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

  // AMAZÔ.GUIA G10 — Redireciona diretamente para a versão atualizada do G10
  useEffect(() => { document.querySelector('typebot-bubble')?.remove(); }, []);
  const openAmazoChat = () => {
    window.open(AMAZO_G10_URL, '_blank', 'noopener,noreferrer');
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
            <img
              src="/logos/logo-transp.png"
              alt="Encontro d'Água"
              className="h-10 object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#solucoes" className="text-slate-200 hover:text-amber-400 text-sm font-medium">{t('solutions')}</a>
            <a href="#servicos" className="text-slate-200 hover:text-amber-400 text-sm font-medium">{language === 'en' ? 'Solutions & Kommo' : 'Soluções & Kommo'}</a>
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
                <a href="https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20vim%20pela%20LP%20do%20Encontro%20d%27%C3%81gua%20Hub%20e%20quero%20agendar%20um%20diagn%C3%B3stico%20para%20o%20meu%20neg%C3%B3cio." target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-amber-500 text-black rounded-full text-sm font-bold hover:bg-amber-400 shadow-lg">{t('becomeClient')}</a>
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
                    href="#servicos"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    {language === 'en' ? 'Solutions & Kommo' : 'Soluções & Kommo'}
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
                        onClick={() => { setIsMenuOpen(false); window.open('https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20vim%20pela%20LP%20do%20Encontro%20d%27%C3%81gua%20Hub%20e%20quero%20agendar%20um%20diagn%C3%B3stico%20para%20o%20meu%20neg%C3%B3cio.', '_blank'); }}
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

        {/* ════════════════════════════════════════════════════ */}
        {/* SEGMENTAÇÃO: Removida na V5.3 (Agora no Showcase)  */}
        {/* ════════════════════════════════════════════════════ */}
        {/* IcebergDetails movido para o card da Lidi na seção Team */}

        {/* ══════════════════════════════════════════════ */}
        {/* 🔥 OFERTA DE LANÇAMENTO — Agente de IA R$80 (V4.4)             */}
        {/* ══════════════════════════════════════════════ */}
        {!isAgenteIAExpanded ? (
          <section className="py-8 px-6 bg-gradient-to-r from-[#0f0c0b] to-[#1a100a] border-y border-[#b07f59]/20 text-center cursor-pointer hover:bg-[#1a100a] transition-colors" onClick={() => setIsAgenteIAExpanded(true)}>
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">Agente de IA (GPTMaker + Kommo) <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Lançamento</span></h3>
                  <p className="text-slate-400 text-sm">Atendimento inteligente com seus dados, catálogo e regras de negócio estruturados por especialista.</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-2">
                Ver Detalhes (A partir de R$ 80/mês + implementação) <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </section>
        ) : (
        <section
          id="sec-agente-ia-launch"
          aria-labelledby="agente-ia-heading"
          className="py-20 px-6 bg-gradient-to-br from-[#0f0c0b] via-[#2d1b2e] to-[#4a2e21] border-y border-[#b07f59]/20 relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 z-20">
            <button onClick={() => setIsAgenteIAExpanded(false)} className="p-3 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full text-slate-300 transition-colors backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Glow de fundo */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#b07f59]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">

            {/* Badge de urgência */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-widest animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                🔥 Oferta de Lançamento — Vagas Limitadas
              </span>
            </div>

            {/* Content grid */}
            <div className="flex flex-col lg:flex-row items-center gap-14">

              {/* Left: Copy */}
              <div className="flex-1 text-center lg:text-left">
                <h2
                  id="agente-ia-heading"
                  className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
                >
                  Seu próprio<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                    Agente de IA 24/7
                  </span>
                </h2>
                <p className="text-slate-300 text-lg mb-2 leading-relaxed">
                  Igual à <strong className="text-amber-400">Amazô</strong> — estruturado no <strong className="text-white">GPTMaker</strong> e integrado ao <strong className="text-white">Kommo CRM</strong>, treinado com a voz e os dados reais do seu negócio para atender e qualificar leads no WhatsApp e Instagram.
                  Não tem seus documentos, catálogo ou regras de negócio prontos? Nós organizamos e estruturamos toda a sua base de conhecimento do zero.
                </p>
                <p className="text-slate-500 text-sm mb-8">
                  Por <strong className="text-white text-base">Lidi Moura</strong> — Analista de Dados, IA e Automação · Parceira Certificada Kommo · Certificada OCI, OCI AI Foundations Associate & Power BI (Fundação Bradesco) · Campeã Hackathon G9 NoCountry (Líder Técnica) · ONE G9, G10 & G11.
                </p>

                {/* Feature checklist */}
                <ul className="space-y-3 mb-10 text-left">
                  {[
                    { icon: '💬', text: 'Atendimento inteligente no WhatsApp e Instagram com GPTMaker + Kommo CRM' },
                    { icon: '🗂️', text: 'Organização completa dos seus dados: documentos, regras de negócio, catálogo e FAQ (se não tiver pronto, nós estruturamos)' },
                    { icon: '🤖', text: 'Configurado com a identidade e tom do seu negócio' },
                    { icon: '🗣️', text: 'Qualifica leads e encaminha para o CRM automaticamente' },
                    { icon: '📊', text: 'Relatórios de conversão e histórico de atendimentos' },
                    { icon: '📋', text: 'Pesquisa de satisfação + Power BI para inteligência de dados' },
                    { icon: '🫴', text: 'Qualificação de leads + onboarding personalizado' },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="text-base flex-shrink-0">{icon}</span>
                      {text}
                    </li>
                  ))}
                </ul>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    id="btn-agente-ia-launch"
                    onClick={() => window.open('https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20quero%20contratar%20meu%20Agente%20de%20IA%20%28a%20partir%20de%20R%24%2080%2Fm%C3%AAs%20%2B%20implementa%C3%A7%C3%A3o%29%20com%20GPTMaker%20e%20Kommo.', '_blank')}
                    className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-[#02040a] font-black rounded-2xl transition-all shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                  >
                    Quero meu Agente IA
                    <span className="ml-1 bg-black/20 rounded-lg px-2 py-0.5 text-xs font-black">a partir de R$ 80/mês + implementação</span>
                  </button>
                <a
                    href={HUB_CALENDAR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white/5 border border-amber-500/30 text-amber-300 font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} /> Agendar Diagnóstico na Agenda do Hub
                  </a>
                </div>
              </div>

              {/* Right: Mockup Card */}
              <div className="flex-shrink-0 w-full max-w-sm">
                <div className="relative">
                  <div className="absolute -inset-4 bg-amber-500/10 rounded-3xl blur-xl" />
                  <div className="relative bg-gradient-to-br from-[#1a0a00] to-[#0a0500] border border-amber-500/30 rounded-3xl p-7 shadow-2xl">

                    {/* Bot avatar */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#0f0c0b] border border-white/10 flex items-center justify-center shadow-lg overflow-hidden p-2">
                        <img src="/logos/logo-light.png" alt="Hub AI" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(200,147,58,0.4)]" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Agente de IA</p>
                        <p className="text-xs text-amber-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Atendimento Contínuo
                        </p>
                      </div>
                    </div>

                    {/* Chat mockup */}
                    <div className="space-y-3 mb-6">
                      <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-300 max-w-[85%]">
                        Olá! Posso ajudar com informações sobre nossos serviços 😊
                      </div>
                      <div className="bg-amber-500/15 border border-amber-500/20 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-amber-200 max-w-[85%] ml-auto text-right">
                        Como funciona a implementação para o meu negócio?
                      </div>
                      <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-300 max-w-[85%]">
                        Estruturamos seus documentos, catálogo e regras de negócio e configuramos seu Agente no GPTMaker + Kommo. Posso agendar seu diagnóstico? 📅
                      </div>
                    </div>

                    {/* Price badge */}
                    <div className="border-t border-amber-500/20 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-xs">Plano Agente IA</p>
                          <p className="text-white font-black text-lg">A partir de R$ 80<span className="text-xs font-normal text-slate-400">/mês + implementação</span></p>
                        </div>
                        <button
                          onClick={() => window.open('https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20quero%20contratar%20meu%20Agente%20de%20IA%20%28a%20partir%20de%20R%24%2080%2Fm%C3%AAs%20%2B%20implementa%C3%A7%C3%A3o%29%20com%20GPTMaker%20e%20Kommo.', '_blank')}
                          className="px-4 py-2 bg-amber-500 text-black rounded-xl text-xs font-black hover:bg-amber-400 transition-colors"
                        >
                          Contratar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>{/* /grid */}

            {/* Social proof micro-line */}
            <p className="text-center text-slate-600 text-xs mt-12">
              ✓ Sem fidelidade · ✓ Cancele quando quiser · ✓ Suporte humano via WhatsApp
            </p>
          </div>
        </section>
        )}

        {/* ────────────────────────────────────────────────── */}
        {/* SOLUÇÃO #1 — LINK D'ÁGUA (DESTAQUE PRINCIPAL)     */}
        {/* ────────────────────────────────────────────────── */}
        <section className="py-20 px-6 bg-gradient-to-br from-[#02040a] via-[#05021a] to-[#02040a] border-y border-teal-500/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left: copy */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-black uppercase tracking-wider mb-6">
                  <Globe className="w-3 h-3" /> {t('linkDaguaBadge')}
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                  {t('linkDaguaTitle')}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    {t('linkDaguaSubtitle')}
                  </span>
                </h2>
                <p className="text-xl text-slate-300 mb-4 max-w-xl mx-auto lg:mx-0" dangerouslySetInnerHTML={{ __html: t('linkDaguaDesc') }} />
                <ul className="space-y-3 mb-10">
                  {[
                    t('feat1'),
                    t('feat2'),
                    t('feat3'),
                    t('feat4'),
                    t('feat5'),
                  ].map((item) => (
                    <li key={item} className="flex items-start justify-center lg:justify-start gap-3 text-slate-300 text-sm">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="https://link.encontrodagua.com/vitrine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-black rounded-2xl hover:from-teal-400 hover:to-cyan-400 transition-all shadow-2xl shadow-teal-500/30 text-center flex items-center justify-center gap-2 text-lg"
                  >
                    <Globe size={20} /> {t('viewShowcase')}
                  </a>
                  <button
                    onClick={() => window.open('https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20vim%20pela%20LP%20do%20Hub%20e%20quero%20solicitar%20meu%20cart%C3%A3o%20digital%20Link%20d%27%C3%81gua.', '_blank')}
                    className="px-8 py-4 bg-white/5 border border-teal-500/30 text-teal-300 font-bold rounded-2xl hover:bg-white/10 transition-all text-center"
                  >
                    {t('getMine')}
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
                        <p className="font-bold text-white text-sm">{t('linksTitle')}</p>
                        <p className="text-xs text-teal-400">{t('linksSubtitle')}</p>
                      </div>
                    </div>
                    {[t('link1'), t('link2'), t('link3'), t('link4')].map((link, index) => (
                      <div key={link} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                        <span className="text-sm text-slate-300">{link}</span>
                        <ArrowRight size={14} className="text-teal-400" />
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                      <p className="text-[10px] text-teal-500 font-mono">{t('linkStats')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VÍDEO LINK D'ÁGUA DEMO */}
            <div className="w-full mt-16 max-w-4xl mx-auto relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.15)] bg-slate-900 aspect-video group">
              <video
                src="/assets/videos/link-dagua-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              ></video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80 pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                <div>
                  <h3 className="text-white font-bold text-xl drop-shadow-lg">Demo Link d'Água</h3>
                  <p className="text-slate-300 text-sm">Preview da Experiência</p>
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

            <div className="flex gap-2 mb-6 bg-slate-900/50 p-2 rounded-2xl border border-fuchsia-500/40 relative">
              <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleOptimize()} placeholder={t('inputPlaceholder')} className="flex-1 bg-transparent border-none px-4 py-3 text-white focus:ring-2 focus:ring-fuchsia-500 rounded-xl text-lg" />
              <button onClick={handleOptimize} disabled={isOptimizing} className="bg-fuchsia-700 hover:bg-fuchsia-600 px-6 py-3 rounded-xl font-bold text-white disabled:opacity-50 flex items-center gap-2">
                {isOptimizing ? t('optimizing') : <><Sparkles size={16} /> {language === 'en' ? 'Optimize' : 'Otimizar'}</>}
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
                    <button onClick={() => window.open('https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20testei%20o%20Prompt%20Lab%20do%20Hub%20e%20quero%20conversar%20sobre%20consultoria%20e%20agentes%20de%20IA.', '_blank')} className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/30">
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


            <div className="mt-8 p-8 bg-gradient-to-br from-fuchsia-900/25 via-[#0d0718] to-purple-900/20 border border-fuchsia-500/30 rounded-3xl max-w-2xl mx-auto text-center shadow-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-widest mb-3">
                ✨ Cortesia Estratégica do Hub
              </span>
              <h4 className="text-2xl font-extrabold text-white mb-2">
                Experimente a Engenharia de Prompts do Hub
              </h4>
              <p className="text-slate-300 text-sm mb-5 max-w-lg mx-auto leading-relaxed">
                Disponibilizamos este laboratório interativo como cortesia para você testar na prática o padrão e o refinamento de prompts que aplicamos na criação de agentes inteligentes.
              </p>
              <div className="mb-6">
                <p className="text-slate-400 text-xs mb-2.5 font-medium">Testado e calibrado para diversos papéis e contextos:</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['Engenheiro de Software', 'Product Manager', 'Cientista de Dados', 'Designer UI/UX', 'Especialista em Vendas', 'Arquiteto de Bots', 'Treinador de IA'].map((role) => (
                    <span key={role} className="bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-300 text-xs font-medium px-2.5 py-1 rounded-lg">{role}</span>
                  ))}
                </div>
              </div>

              <a
                href="https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20testei%20o%20Prompt%20Lab%20do%20Hub%20e%20quero%20conversar%20sobre%20IA%20e%20automa%C3%A7%C3%B5es%20para%20o%20meu%20neg%C3%B3cio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 rounded-xl font-bold text-white text-sm shadow-lg shadow-fuchsia-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Sparkles size={16} /> Quero agentes de IA sob medida no WhatsApp →
              </a>
            </div>
          </div>
        </section>

        {/* OLD QR SECTION REMOVED */}

        {/* GALERIA DE CLIENTES DO HUB — oculta V5.5, reativar quando base real */}
        {false && (<section id="showcase" className="py-20 px-6 bg-[#05020a] text-center">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" /> {t('galleryTag')}
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
                      <div className="w-36 h-36 mx-auto mb-4 bg-white rounded-2xl p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xl" style={{ boxShadow: `0 4px 24px 0 ${(project.color || '#1a1a2e')}44` }}>
                        <QRCodeSVG
                          value={`${window.location.origin}/#/v/${project.slug}`}
                          size={116}
                          level="M"
                          fgColor="#111111"
                          bgColor="#FFFFFF"
                          imageSettings={project.qr_logo_url ? {
                            src: project.qr_logo_url,
                            width: 24,
                            height: 24,
                            excavate: true,
                          } : undefined}
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
                    {[
                      { name: 'Dra. Ana Silva', type: 'Advogada • Direito da Família', desc: 'Cartão Digital com links para WhatsApp, Instagram e agendamento', slug: 'ana-silva', color: '#0ea5e9' },
                      { name: 'Restaurante Amazônia', type: 'Gastronomia Regional', desc: 'QR Code no cardápio para pedidos direto no WhatsApp', slug: 'restaurante-amazonia', color: '#f59e0b' },
                      { name: 'João Consultor', type: 'Consultoria de Negócios', desc: 'Link único para portfólio e redes sociais', slug: 'joao-consultor', color: '#a855f7' },
                    ].map((mock) => (
                      <div key={mock.slug} className="flex-shrink-0 w-[280px] bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-amber-500/50 transition snap-start">
                        <div className="w-36 h-36 mx-auto mb-4 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-xl" style={{ boxShadow: `0 4px 24px 0 ${mock.color}44` }}>
                          <QRCodeSVG
                            value={`https://link.encontrodagua.com/${mock.slug}`}
                            size={116}
                            level="M"
                            fgColor="#111111"
                            bgColor="#FFFFFF"
                          />
                        </div>
                        <h3 className="font-bold text-white mb-1">{mock.name}</h3>
                        <p className="text-xs text-slate-400 mb-3">{mock.type}</p>
                        <p className="text-xs text-slate-500">{mock.desc}</p>
                      </div>
                    ))}
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
        </section>)} {/* fim gallery oculta */}

        {/* AMAZÔ IA BLOCK REMOVED AS CHAT BUBBLE IS ACTIVE */}

        {/* CRM NATIVO - Solução #4 */}
        <CRMSimulator onCTAClick={() => setIsApplicationModalOpen(true)} />

        {/* ── CTA PROVADÁGUA — inserido após demo CRM V5.6 ── */}
        <section className="py-16 px-6 bg-[#02040a]">
          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-[#02040a] to-amber-900/10 p-10 text-center shadow-2xl">
              {/* Glows */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 right-0 w-60 h-60 bg-amber-600/8 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                  🌊 Prova d'Água Kommo CRM — {language === 'en' ? 'Guided Free Trial' : 'Teste Grátis Guiado'}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
                  {language === 'en'
                    ? 'Your New Prova d\'Água: Try Kommo CRM with our guided setup'
                    : 'Sua Prova d\'Água de Gestão: Experimente o Kommo CRM na prática'}
                </h2>
                <p className="text-slate-400 text-sm mb-6 max-w-xl mx-auto">
                  {language === 'en'
                    ? 'As a Certified Kommo Partner and Data Analyst, we help you test Kommo CRM with your own business rules, catalog, WhatsApp, and GPTMaker AI Agent.'
                    : 'Como Parceira Certificada Kommo e Analista de Dados, liberamos o teste gratuito do Kommo CRM acompanhado de orientação inicial para você ver na prática como organizar seus dados, catálogo, WhatsApp e Agente de IA (GPTMaker) em um único funil comercial.'}
                </p>
                  <a
                  id="lp-cta-provadagua"
                  href="https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20quero%20solicitar%20minha%20Prova%20d%27%C3%81gua%20%28Teste%20Gr%C3%A1tis%20do%20Kommo%20CRM%29%20com%20orienta%C3%A7%C3%A3o%20do%20Hub."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-extrabold text-base shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98] hover:-translate-y-0.5"
                >
                  {language === 'en'
                    ? 'Request Kommo Free Trial on WhatsApp →'
                    : 'Solicitar Teste Grátis do Kommo no WhatsApp →'}
                </a>
                <div className="mt-4">
                  <a
                    href={HUB_CALENDAR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4 transition-colors"
                  >
                    📅 Prefere agendar direto? Agendar Diagnóstico na Agenda (encontrodaguahub@gmail.com) →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SOLUÇÕES, DADOS ESTRUTURADOS E PACOTES KOMMO (USD) — ENCONTRO D'ÁGUA HUB
            ══════════════════════════════════════════════════════════════════════ */}
        <section id="servicos" className="py-24 px-6 bg-[#04020a] relative border-t border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest mb-4">
                💼 Foco em Resultado, Organização de Dados & Satisfação
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Como estruturamos e escalamos o seu negócio
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Mais do que ferramentas soltas, entregamos a solução completa para o seu problema comercial — unindo <strong className="text-white">Análise e Organização de Dados</strong>, <strong className="text-white">GPTMaker</strong> e <strong className="text-white">Kommo CRM</strong> de acordo com a realidade da sua operação.
              </p>
            </div>

            {/* 3 Formatos de Atuação (Foco em Valor, Sem Preços de Consultoria Expostos) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-6 text-xl">
                    🧠
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">1. Diagnóstico, Consultoria & Mentoria</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Mapeamento estratégico do seu processo atual, desenho da arquitetura comercial (StartSe AI Canvas), inteligência de dados e direcionamento prático para destravar gargalos de atendimento e vendas.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-base font-bold text-purple-300">Atendimento Personalizado</p>
                  <p className="text-xs text-slate-500 mt-1">Sessões estratégicas agendadas conforme sua necessidade</p>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border border-purple-500/30 hover:border-purple-500/60 transition-all flex flex-col justify-between relative shadow-xl shadow-purple-950/30">
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-black uppercase tracking-wider">
                  Colaborativo
                </span>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-6 text-xl">
                    🤝
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">2. Implementação Conjunta</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Mão na massa em parceria com você ou sua equipe. Estruturamos dados, funis no Kommo e agentes no GPTMaker enquanto capacitamos seu time para operar com total segurança e autonomia.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-base font-bold text-amber-300">Capacitação + Entrega Simultânea</p>
                  <p className="text-xs text-slate-400 mt-1">Dimensionado de acordo com o momento do seu negócio</p>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-teal-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 mb-6 text-xl">
                    ⚡
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">3. Implementação Completa & Suporte</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Entrega ponta a ponta executada pela Lídi Moura: da organização inicial dos seus documentos e catálogos até a configuração completa, bateria de testes (QA) e acompanhamento contínuo.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-base font-bold text-teal-300">Solução Chave na Mão (Turnkey)</p>
                  <p className="text-xs text-slate-500 mt-1">Entrega validada por QA + evolução contínua sob demanda</p>
                </div>
              </div>
            </div>

            {/* Destaque Especial: Organização e Estruturação de Dados (Analista de Dados) */}
            <div className="mb-16 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-teal-950/30 via-slate-900/70 to-purple-950/30 border border-teal-500/30 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
                    🗂️ Diferencial Exclusivo · Analista de Dados
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    Não tem seus documentos, catálogo ou regras de negócio organizados? Nós fazemos isso por você.
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    Um Agente de IA ou CRM só entrega resultado real se a base de dados estiver limpa e bem estruturada. Como <strong className="text-white">Analista de Dados</strong>, Lídi Moura organiza e estrutura tudo o que o seu negócio precisa antes mesmo da automação entrar no ar:
                  </p>
                </div>
                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                  <div className="p-4 rounded-2xl bg-black/35 border border-white/10">
                    <p className="font-bold text-teal-300 mb-1">📄 Documentos & Base RAG</p>
                    <p className="text-slate-400">Estruturação de manuais, políticas, PDFs e conhecimentos internos para alimentar a IA sem alucinações.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/35 border border-white/10">
                    <p className="font-bold text-amber-300 mb-1">🛍️ Catálogo & Ofertas</p>
                    <p className="text-slate-400">Padronização de produtos, serviços, descrições, condições e perguntas frequentes (FAQ).</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/35 border border-white/10">
                    <p className="font-bold text-purple-300 mb-1">⚙️ Regras de Negócio</p>
                    <p className="text-slate-400">Mapeamento claro de etapas do funil, critérios de qualificação de leads e gatilhos de passagem para humanos.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/35 border border-white/10">
                    <p className="font-bold text-blue-300 mb-1">📊 Inteligência Analítica</p>
                    <p className="text-slate-400">Pesquisa de satisfação automatizada, indicadores comerciais e dashboards em Power BI / Python.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Planos Oficiais do Kommo em Dólar (USD) + Agente IA GPTMaker */}
            <div className="mb-16">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-2">
                  Transparência Oficial · Plataforma Principal No-Code
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                  Pacotes Oficiais Kommo CRM (em USD) & Agente de IA (GPTMaker)
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Como as licenças da plataforma <strong className="text-white">Kommo</strong> são sempre cotadas oficialmente em dólar (USD), mantemos os valores oficiais em dólar para total transparência. Já nossos serviços de estruturação de dados, implementação e acompanhamento são apresentados sob medida após entendermos o seu cenário.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Kommo Base (USD) */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-blue-500/30 transition flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-2">Licença Kommo CRM</span>
                    <h4 className="text-lg font-bold text-white mb-1">Plano Base</h4>
                    <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                      Centralização de WhatsApp, Instagram e e-mail em uma única caixa de entrada com funil de vendas visual (Kanban) para organizar cada cliente.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500">Licença oficial da plataforma</p>
                    <p className="text-2xl font-black text-white">US$ 15<span className="text-xs font-normal text-slate-400"> /usuário/mês</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">+ implementação e estruturação sob medida</p>
                  </div>
                </div>

                {/* Kommo Avançado (USD) */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-900/30 to-slate-900/60 border border-blue-500/40 transition flex flex-col justify-between relative shadow-lg">
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase">Mais Escolhido</span>
                  <div>
                    <span className="text-xs text-blue-300 font-bold uppercase tracking-wider block mb-2">Licença Kommo CRM</span>
                    <h4 className="text-lg font-bold text-white mb-1">Plano Avançado</h4>
                    <p className="text-slate-300 text-xs mb-4 leading-relaxed">
                      Tudo do Base + Salesbot (robô de vendas), automações de pipeline sem código, follow-ups automáticos e relatórios de performance.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400">Licença oficial da plataforma</p>
                    <p className="text-2xl font-black text-white">US$ 25<span className="text-xs font-normal text-slate-300"> /usuário/mês</span></p>
                    <p className="text-[10px] text-blue-300 mt-1">+ implementação e estruturação sob medida</p>
                  </div>
                </div>

                {/* Kommo Empresarial (USD) */}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-blue-500/30 transition flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block mb-2">Licença Kommo CRM</span>
                    <h4 className="text-lg font-bold text-white mb-1">Plano Empresarial</h4>
                    <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                      Tudo do Avançado + gestão para alto volume de leads, Lead Scoring, perfis avançados de segurança e atendimento em escala.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500">Licença oficial da plataforma</p>
                    <p className="text-2xl font-black text-white">US$ 45<span className="text-xs font-normal text-slate-400"> /usuário/mês</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">+ implementação e estruturação sob medida</p>
                  </div>
                </div>

                {/* Agente de IA GPTMaker */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-900/25 to-slate-900/60 border border-amber-500/40 transition flex flex-col justify-between relative shadow-lg">
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase">IA Conversacional</span>
                  <div>
                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-2">GPTMaker + Dados</span>
                    <h4 className="text-lg font-bold text-white mb-1">Agente de IA 24/7</h4>
                    <p className="text-slate-300 text-xs mb-4 leading-relaxed">
                      Agente inteligente treinado com os documentos, catálogo e regras do seu negócio para atender no WhatsApp e integrar ao Kommo.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-amber-300">Manutenção mensal acessível</p>
                    <p className="text-xl font-black text-white">A partir de R$ 80<span className="text-xs font-normal text-slate-300">/mês</span></p>
                    <p className="text-[10px] text-amber-300/90 mt-1">+ implementação e estruturação da base</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Transparência & Governança de Entrega */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/20 via-purple-950/20 to-slate-900/40 border border-blue-500/20 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-base font-bold text-blue-300 mb-2 flex items-center gap-2">
                    ℹ️ Por que apresentamos o Kommo em USD e consultoria sob diagnóstico?
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    As licenças do <strong>Kommo CRM</strong> são cobradas oficialmente em dólar (USD) pela fornecedora. Já os serviços de organização de dados, criação de agentes no <strong>GPTMaker</strong> e implementação de funis variam conforme o momento de cada empresa — por isso construímos uma proposta justa e personalizada após ouvir você, garantindo que seu problema seja resolvido com total satisfação.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-bold text-purple-300 mb-2 flex items-center gap-2">
                    💳 Condições de Contratação, QA e Entrega
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Projetos e implementações iniciam institucionalmente com <strong>sinal de 30% a 50%</strong> conforme proposta aprovada, e o restante é acordado na entrega. Todas as entregas passam por bateria de testes, validação de qualidade (QA) e acompanhamento inicial de follow-up.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs Finais da Seção: WhatsApp Business + Agendamento Direto */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20vim%20pela%20LP%20do%20Encontro%20d%27%C3%81gua%20Hub%20e%20quero%20conversar%20sobre%20como%20estruturar%20meus%20dados%2C%20Kommo%20CRM%20e%20Agente%20de%20IA."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm md:text-base rounded-2xl shadow-xl shadow-purple-600/30 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <MessageCircle size={20} /> Falar no WhatsApp Business (55 41 99255-7600) →
              </a>
              <a
                href={HUB_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-amber-500/40 hover:bg-white/10 text-amber-300 font-extrabold text-sm md:text-base rounded-2xl transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                📅 Agendar Consultoria (encontrodaguahub@gmail.com) →
              </a>
            </div>
          </div>
        </section>

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
              {(language === 'en' ? ["Atypical Parents", "Neurodivergent", "Indigenous & Reclaiming", "Entrepreneur Parents", "Local Businesses", "Riverside Communities", "PwD", "LGBTQIAPN+", "Black & Brown People", "Communities", "NGOs"] : ["Mães e Pais Atípicos", "Neurodivergentes", "Povos Indígenas & Originários", "Mães e Pais Empreendedores", "Negócios Locais", "Comunidades Ribeirinhas", "PcD", "LGBTQIAPN+", "Pessoas Pretas e Pardas", "Comunidades & Coletivos", "ONGs & Impacto Social"]).map((tag) => (
                <span key={tag} className="px-5 py-2 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-sm font-semibold cursor-default">{tag}</span>
              ))}
            </div>

            <div className="bg-gradient-to-r from-fuchsia-900/20 to-amber-900/20 p-8 rounded-3xl border border-white/10 max-w-3xl mx-auto text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
                🌱 Tecnologia Acessível & Impacto Social
              </span>
              <h3 className="text-2xl font-bold text-white mb-4">Condições Especiais com Propósito</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-2xl mx-auto">
                Projetos de impacto social, educação, economia colaborativa e iniciativas com propósito podem solicitar uma condição especial. Bolsas, descontos sociais ou escopos reduzidos são avaliados diretamente com Lídi Moura, considerando a finalidade do projeto, o escopo necessário e a sustentabilidade da operação.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button onClick={() => window.open('https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20gostaria%20de%20consultar%20sobre%20o%20programa%20Tecnologia%20para%20Todos%20(Impacto%20Social)', '_blank')} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto shadow-lg">
                  <MessageCircle size={18} /> {t('socialConsult')}
                </button>
                <button onClick={openAmazoChat} className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto shadow-lg">
                  <Bot size={18} /> {language === 'en' ? 'Talk to Amazô.guia (G10)' : 'Falar com Amazô.guia (G10)'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. EQUIPE — Layout Inteligente, Fluido e Responsivo (Sem sobreposição ao expandir detalhes) */}
        <section id="time" className="py-20 px-4 sm:px-6 bg-[#02040a] relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('team')}</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Liderança humana especializada em Dados, IA e Automação combinada com esquadrão de agentes inteligentes.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Barra seletora de membros + setas (responsiva para todos os dispositivos) */}
            <div className="flex items-center justify-between gap-2 mb-6 px-2">
              <button
                onClick={() => setActiveTeamIndex((p) => p === 0 ? TEAM_MEMBERS.length - 1 : p - 1)}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-white/10 rounded-full text-white transition-all shadow-lg flex-shrink-0"
                aria-label="Membro anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {TEAM_MEMBERS.map((member, idx) => (
                  <button
                    key={member.id}
                    onClick={() => setActiveTeamIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      activeTeamIndex === idx
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveTeamIndex((p) => p === TEAM_MEMBERS.length - 1 ? 0 : p + 1)}
                className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-white/10 rounded-full text-white transition-all shadow-lg flex-shrink-0"
                aria-label="Próximo membro"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Card Principal Dinâmico (h-auto: expande perfeitamente sem quebrar nem sobrepor seções) */}
            <div className="text-center p-6 sm:p-8 md:p-10 bg-[#0f0518] border border-white/10 rounded-3xl w-full shadow-2xl flex flex-col items-center transition-all duration-300">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl border-2 ${TEAM_MEMBERS[activeTeamIndex].color.split(' ')[0]} bg-slate-800 mb-4 overflow-hidden shadow-xl`}>
                {TEAM_MEMBERS[activeTeamIndex].image
                  ? <img src={TEAM_MEMBERS[activeTeamIndex].image} alt={TEAM_MEMBERS[activeTeamIndex].name} className="w-full h-full object-cover" />
                  : <span>{(TEAM_MEMBERS[activeTeamIndex] as any).emoji || '🤖'}</span>}
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{TEAM_MEMBERS[activeTeamIndex].name}</h3>
              <span className={`text-xs uppercase font-bold tracking-wider mb-4 block max-w-xl leading-relaxed ${TEAM_MEMBERS[activeTeamIndex].color.split(' ')[1]}`}>
                {TEAM_MEMBERS[activeTeamIndex].role}
              </span>

              <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-2xl mb-6">
                "{TEAM_MEMBERS[activeTeamIndex].pitch}"
              </p>

              {/* Badges estratégicas para Leads, Recrutadores, Hunters e Clientes (exibidas na Lídi) */}
              {(TEAM_MEMBERS[activeTeamIndex] as any).badges && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-2xl">
                  {((TEAM_MEMBERS[activeTeamIndex] as any).badges as string[]).map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/25 text-amber-200 text-xs font-semibold"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Links Sociais + Portfólio + Canais Diretos */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                {TEAM_MEMBERS[activeTeamIndex].linkedin && (
                  <a
                    href={TEAM_MEMBERS[activeTeamIndex].linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs font-bold transition-colors"
                  >
                    <Linkedin size={16} /> LinkedIn
                  </a>
                )}
                {(TEAM_MEMBERS[activeTeamIndex] as any).github && (
                  <a
                    href={(TEAM_MEMBERS[activeTeamIndex] as any).github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:bg-white/10 text-xs font-bold transition-colors"
                  >
                    <Github size={16} /> GitHub
                  </a>
                )}
                {(TEAM_MEMBERS[activeTeamIndex] as any).portfolio && (
                  <a
                    href={(TEAM_MEMBERS[activeTeamIndex] as any).portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 text-xs font-bold transition-colors"
                  >
                    <Briefcase size={16} /> Portfólio Link d'Água
                  </a>
                )}
              </div>

              {activeTeamIndex === 0 && (
                <>
                  <IcebergDetails />
                  <div className="mt-6 pt-6 border-t border-white/10 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20vi%20seu%20perfil%20t%C3%A9cnico%20na%20LP%20do%20Hub%20e%20quero%20conversar%20sobre%20Dados%2C%20IA%2C%20Kommo%20ou%20oportunidades."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg"
                    >
                      <MessageCircle size={15} /> Falar no WhatsApp Business
                    </a>
                    <a
                      href={HUB_CALENDAR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
                    >
                      📅 Agendar Consultoria (encontrodaguahub@gmail.com)
                    </a>
                    <a
                      href={AMAZO_G10_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-600/20 hover:bg-fuchsia-600/30 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold transition-all"
                    >
                      <Bot size={15} /> Testar Amazô.guia (G10)
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* KOMMO PARTNER — Hidden by default, expandable */}
        <KommoPartnerSection />

        {/* FOOTER */}
        <footer className="py-12 text-center text-slate-600 text-xs bg-[#02040a] border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-teal-500" />
              <p className="text-white font-bold">Encontro D'água Hub</p>
            </div>
            <p className="text-slate-400 mb-1">
              Lidi Moura — Analista de Dados, IA e Automação · Parceira Certificada Kommo · Certificada OCI, OCI AI Foundations Associate & Power BI (Fundação Bradesco) · Líder Técnica Campeã Hackathon G9 NoCountry · ONE G9, G10 & G11
            </p>
            <p className="text-slate-500 mb-2">
              Contato & Agendamento de Consultoria: <a href={HUB_CALENDAR_URL} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">encontrodaguahub@gmail.com</a> · WhatsApp Business: <a href="https://wa.me/5541992557600" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">+55 (41) 99255-7600</a>
            </p>
            <p className="text-slate-600 mb-2">"Reflorestar o Digital" — Tecnologia acessível com impacto social real.</p>
            <p className="text-slate-700 text-[10px] mb-4">⚠️ Licenças da plataforma Kommo cobradas em dólar (USD) conforme tabela oficial da fornecedora; serviços de organização de dados, implementação e consultoria sob medida.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-700 text-[11px] mb-3">
              <span>Sinal institucional de 30% a 50%</span>
              <span>•</span>
              <span>Condições especiais para Impacto Social sob consulta</span>
              <span>•</span>
              <span>Entrega validada por QA & Follow-up</span>
            </div>
            <p className="text-slate-700">{t('footerRights')}</p>
          </div>
        </footer>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />

      {/* Lead Capture Modal — Oferta de Lançamento Agente IA V4.4 */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => { setIsLeadModalOpen(false); setPrefilledInterest(undefined); }}
        source="hub-lp-launch"
        prefilledData={prefilledInterest ? { interest: prefilledInterest } : undefined}
      />
    </div>
  );
}
