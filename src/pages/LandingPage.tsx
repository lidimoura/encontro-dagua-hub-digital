import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Sparkles, Zap, Users, TrendingUp, QrCode, Menu, X, ChevronLeft, ChevronRight, ArrowRight,
  Globe, CheckCircle, Copy, Play, Bot, Brain, MessageCircle, Linkedin, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const TEAM_MEMBERS = [
  {
    id: 'lidi',
    name: "Lidi",
    role: "Founder & Visão",
    type: "human",
    image: "/profile.png",
    color: "border-amber-500 text-amber-400",
    linkedin: "https://linkedin.com/in/sua-url", // Coloque seu LinkedIn aqui
    pitch: "Minha missão é desenhar soluções tecnológicas que devolvam tempo e liberdade para você empreender."
  },
  { id: 'amazo', name: "Amazo", role: "CS & Vendas", type: "ai", color: "border-fuchsia-500 text-fuchsia-400", pitch: "Atendimento 24h. Garanto que nenhum cliente fique sem resposta." },
  { id: 'precy', name: "Precy", role: "Tech Lead", type: "ai", color: "border-blue-500 text-blue-400", pitch: "Estabilidade e segurança. Cuido para que seu QR D'água funcione sempre." },
  { id: 'jury', name: "Jury", role: "Compliance", type: "ai", color: "border-red-500 text-red-400", pitch: "Ética e responsabilidade. Garanto privacidade e valores humanos." }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  // Prompt Lab State
  const [idea, setIdea] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null); // Simulação do teste

  // Amazo Init
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js'; Typebot.initBubble({ typebot: "template-chatbot-amazo-4valfnc", apiHost: "https://typebot.io", theme: { button: { backgroundColor: "#4a044e", customIconSrc: "https://s3.typebot.io/public/workspaces/cmcppn5am0002jx04z0h8go9a/typebots/al5llo2evf2ahjg5u4valfnc/bubble-icon?v=1766194905653", }, chatWindow: { backgroundColor: "#F8F8F8" } }, });`;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); document.querySelector('typebot-bubble')?.remove(); };
  }, []);

  // FORCE OPEN CHAT (Tenta várias vezes até conseguir)
  const openAmazoChat = () => {
    let attempts = 0;
    const interval = setInterval(() => {
      const bubble = document.querySelector('typebot-bubble');
      const shadow = bubble?.shadowRoot;
      const button = shadow?.querySelector('.button-container');
      if (button instanceof HTMLElement) {
        button.click();
        clearInterval(interval);
      }
      attempts++;
      if (attempts > 10) clearInterval(interval); // Desiste após 2 segundos
    }, 200);
  };

  const handleOptimize = async () => {
    if (!idea.trim()) return;
    setIsOptimizing(true);
    setTestResponse(null);
    setTimeout(() => {
      const topic = idea.trim().toLowerCase();

      // FINAL OPTIMIZED PROMPT - Single result like Prompt Lab
      let finalPrompt;

      // Detect product/service type and generate ONE perfect prompt
      if (topic.includes('bolo') || topic.includes('doce') || topic.includes('comida')) {
        finalPrompt = `Descubra o sabor que vicia! ${idea} artesanal, feito com amor e ingredientes selecionados. Peça já e sinta a diferença! 🍰`;
      } else if (topic.includes('serviço') || topic.includes('consultoria') || topic.includes('curso')) {
        finalPrompt = `Transforme seu negócio com ${idea} profissional. Resultados comprovados em até 30 dias. Agende sua consulta gratuita!`;
      } else {
        // Generic high-conversion template
        finalPrompt = `${idea}? A solução que você procura está aqui! Qualidade garantida, resultados rápidos. Clique e descubra!`;
      }

      setOptimizedResult(`## ✨ Prompt Otimizado\n\n${finalPrompt}\n\n---\n\n**Pronto para usar!** Copie e cole onde precisar.`);
      setIsOptimizing(false);
    }, 800);
  };

  const handleTestInPlace = () => {
    setTestResponse("🤖 IA Responde: 'Olá! Aqui estão suas 3 opções de copy baseadas no prompt...' No Hub Pro, você conecta seus próprios Agentes e APIs!");
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
            <a href="#lab" className="text-slate-200 hover:text-amber-400 text-sm font-medium">Prompt Lab</a>
            <a href="#solucoes" className="text-slate-200 hover:text-amber-400 text-sm font-medium">Soluções</a>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-fuchsia-900 rounded-full text-sm font-bold">Painel</button>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="text-white text-sm font-bold">Login</button>
                <button onClick={() => navigate('/register')} className="px-6 py-2 bg-amber-500 text-black rounded-full text-sm font-bold hover:bg-amber-400 shadow-lg">Criar Conta Grátis</button>
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

                {/* Menu Items */}
                <nav className="flex flex-col gap-6">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigate('/'); }}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    Início
                  </a>
                  <a
                    href="#lab"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    Prompt Lab
                  </a>
                  <a
                    href="#solucoes"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-amber-400 text-lg font-medium transition-colors"
                  >
                    Soluções
                  </a>

                  <div className="border-t border-white/10 my-4" />

                  {user ? (
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full px-6 py-3 bg-fuchsia-900 hover:bg-fuchsia-800 rounded-full text-sm font-bold transition-colors"
                    >
                      Painel
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                        className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold transition-colors"
                      >
                        Entrar
                      </button>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/register'); }}
                        className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-sm font-bold transition-colors shadow-lg"
                      >
                        Cadastro
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
              🚀 Mobile First • AI First • Impacto Real
            </div>
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl">
              Tecnologia mais <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-fuchsia-500">acessível.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white font-medium max-w-3xl mx-auto drop-shadow-xl">
              Um ecossistema digital que oferece as melhores soluções tecnológicas para resolver problemas reais e garantir resultados e prosperidade para todos.
            </p>
            <div className="pt-10 w-full flex justify-center">
              <button onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce flex flex-col items-center gap-2 text-white hover:text-amber-400">
                <span className="text-xs uppercase tracking-widest font-bold">Conheça o Hub</span>
                <ArrowRight className="w-6 h-6 rotate-90 text-amber-500" />
              </button>
            </div>
          </div>
        </section>

        {/* MANIFESTO SOCIAL */}
        <section id="manifesto" className="py-24 px-6 bg-[#02040a] text-center border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
          <div className="max-w-5xl mx-auto">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500"><Globe size={32} /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Tecnologia para Todos</h2>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {["Mães e Pais Atípicos", "Neurodivergentes", "Pessoas Originárias e em Retomada", "Mães e Pais Empreendedores", "Negócios Locais", "Ribeirinhos", "PCD", "LGBTQIAPN+", "Pretos e Pardos", "Comunidades", "ONGs"].map((tag) => (
                <span key={tag} className="px-5 py-2 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-sm font-semibold cursor-default">{tag}</span>
              ))}
            </div>

            <div className="bg-gradient-to-r from-fuchsia-900/20 to-amber-900/20 p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-2">🤝 Ninguém fica para trás</h3>
              <p className="text-slate-400 text-sm mb-6">Condições especiais para impacto social.</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button onClick={() => window.open('https://wa.me/5592992943998?text=Olá Lidi! Sou do grupo de impacto social e gostaria da consultoria gratuita de 10min.', '_blank')} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto shadow-lg">
                  <MessageCircle size={18} /> Consultoria Social (WhatsApp)
                </button>
                <button onClick={openAmazoChat} className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto shadow-lg">
                  <Bot size={18} /> Falar com Amazo IA
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PROMPT LAB (INTERATIVO) */}
        <section id="lab" className="py-20 px-6 bg-[#05020a] border-y border-white/5 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-6"><Brain className="w-3 h-3" /> <span>Engenharia de Ideias</span></div>
            <h3 className="text-3xl font-bold text-white mb-2">Otimizador de Prompts</h3>
            <p className="text-slate-400 mb-8">Digite sua intenção. A gente estrutura o comando perfeito.</p>

            <div className="flex gap-2 mb-6 bg-slate-900/50 p-2 rounded-2xl border border-white/10">
              <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Ex: Criar legenda para foto de produto..." className="flex-1 bg-transparent border-none px-4 py-3 text-white focus:ring-0 text-lg" />
              <button onClick={handleOptimize} disabled={isOptimizing} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-6 py-3 rounded-xl font-bold text-white disabled:opacity-50">
                {isOptimizing ? '...' : 'Otimizar'}
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
                      {copySuccess ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />} Copiar
                    </button>
                    <button onClick={handleTestInPlace} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      <Play size={16} /> Testar Aqui
                    </button>
                  </div>
                </div>

                {/* RESULTADO DO TESTE SIMULADO */}
                {testResponse && (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-200 text-sm animate-fade-in">
                    {testResponse}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <h4 className="text-amber-400 font-bold text-sm mb-1">🔥 Especialista: Agentes de IA</h4>
                <p className="text-slate-400 text-xs">Cria "cérebros" completos para seus chatbots (Typebot/OpenAI). <span className="text-white underline cursor-pointer" onClick={() => navigate('/login')}>Acessar no Hub Pro</span></p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <h4 className="text-amber-400 font-bold text-sm mb-1">⚙️ Especialista: Personalizar LLMs</h4>
                <p className="text-slate-400 text-xs">Instruções para treinar seu ChatGPT/Gemini com sua voz. <span className="text-white underline cursor-pointer" onClick={() => navigate('/login')}>Acessar no Hub Pro</span></p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-xl inline-block">
              <p className="text-sm font-bold text-fuchsia-300">💡 Quer apenas o Prompt Lab?</p>
              <button onClick={() => window.open('https://wa.me/5592992943998?text=Quero o plano Pro Mensal por R$ 3,00', '_blank')} className="text-white hover:text-white underline mt-1 text-xs">Assinar Pro Mensal (R$ 3,00)</button>
            </div>
          </div>
        </section>

        {/* VITRINE DA COMUNIDADE (SHOWCASE) */}
        <section id="showcase" className="py-20 px-6 bg-[#02040a] text-center border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" /> Vitrine da Comunidade
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Exemplos Reais</h2>
            <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
              Veja como empreendedores estão usando o QR D'água para conectar com seus clientes
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
                        <QRCodeSVG
                          value={`${window.location.origin}/#/v/${project.slug}`}
                          size={112}
                          level="H"
                          fgColor={project.color || '#000000'}
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
                <p className="text-xs text-slate-500">← Deslize para ver mais →</p>
              </div>
            </div>

            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            <div className="mt-8 text-sm text-slate-500">
              💡 Quer aparecer aqui? Marque "Autorizar Galeria" ao criar seu projeto!
            </div>
          </div>
        </section>

        {/* SOLUÇÕES REAIS */}
        <section id="solucoes" className="py-20 px-6 bg-[#02040a] text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Nossas Soluções</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Cards com textos do README */}
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-amber-500/50 transition">
              <Brain className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="font-bold text-white">Prompt Lab</h3>
              <p className="text-xs text-slate-400 mt-2">Engenharia de ideias. Transforme intenções em estratégias estruturadas.</p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-blue-500/50 transition">
              <QrCode className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="font-bold text-white">QR D'água</h3>
              <p className="text-xs text-slate-400 mt-2">Conexão instantânea. Cartões digitais e links que resolvem problemas reais.</p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-fuchsia-500/50 transition cursor-pointer" onClick={openAmazoChat}>
              <Bot className="w-10 h-10 text-fuchsia-400 mx-auto mb-4" />
              <h3 className="font-bold text-white">Amazo IA</h3>
              <p className="text-xs text-slate-400 mt-2">Atendimento 24/7. Agente de IA para CS e Vendas no WhatsApp.</p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-green-500/50 transition">
              <Users className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-white">CRM Nativo</h3>
              <p className="text-xs text-slate-400 mt-2">Gestão simplificada de leads com IA integrada e recursos estratégicos.</p>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section id="time" className="py-20 px-6 bg-[#02040a] relative z-10 border-t border-white/5">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-white">Sobre Nós</h2></div>
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
          <p>Inspirado na natureza, codificado para o mundo.</p>
        </footer>
      </div>
    </div>
  );
}