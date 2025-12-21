import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, CheckCircle, Copy, ThumbsUp, 
  QrCode, Bot, Brain, Menu, X, Heart, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- DADOS DO TIME ---
const TEAM_MEMBERS = [
  {
    id: 'precy',
    name: "Precy",
    role: "Tech Lead & Estabilidade",
    type: "ai",
    color: "border-blue-500 text-blue-400",
    pitch: "Eu garanto que o QR D'água e suas integrações funcionem sem falhas, cuidando da segurança da sua conexão digital."
  },
  {
    id: 'lidi',
    name: "Lidi",
    role: "Founder & Estratégia Humana",
    type: "human",
    color: "border-amber-500 text-amber-400",
    pitch: "Minha missão é desenhar soluções tecnológicas que devolvam tempo e liberdade para você empreender na Amazônia."
  },
  {
    id: 'amazo',
    name: "Amazo",
    role: "CS & Vendas 24h",
    type: "ai",
    color: "border-fuchsia-500 text-fuchsia-400",
    pitch: "Atendo seus clientes no WhatsApp a qualquer hora do dia ou da noite, garantindo que você nunca perca uma oportunidade."
  },
  {
    id: 'jury',
    name: "Jury",
    role: "Compliance & Ética",
    type: "ai",
    color: "border-red-500 text-red-400",
    pitch: "O guardião dos valores. Garanto que todas as automações do Hub respeitem a privacidade e as regras do jogo."
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State do Carrossel da Equipe
  const [activeTeamIndex, setActiveTeamIndex] = useState(1); // Começa com a Lidi (índice 1) no meio
  const teamCarouselRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA MAGIC LINK ---
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) localStorage.setItem('referral_source', refCode);
  }, [searchParams]);

  // --- INTEGRAÇÃO AMAZO (TYPEBOT) ---
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js'; Typebot.initBubble({ typebot: "template-chatbot-amazo-4valfnc", apiHost: "https://typebot.io", previewMessage: { message: "Oi! Posso ajudar?", autoShowDelay: 3000, avatarUrl: "https://s3.typebot.io/public/workspaces/cmcppn5am0002jx04z0h8go9a/typebots/al5llo2evf2ahjg5u4valfnc/bubble-icon?v=1766194905653", }, theme: { button: { backgroundColor: "#4a044e", customIconSrc: "https://s3.typebot.io/public/workspaces/cmcppn5am0002jx04z0h8go9a/typebots/al5llo2evf2ahjg5u4valfnc/bubble-icon?v=1766194905653", }, chatWindow: { backgroundColor: "#F8F8F8" } }, });`;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); document.querySelector('typebot-bubble')?.remove(); };
  }, []);

  // --- LÓGICA PROMPT LAB ---
  const [idea, setIdea] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleOptimize = async () => {
    if (!idea.trim()) return;
    setIsOptimizing(true);
    setTimeout(() => {
      setOptimizedResult(`## 🤖 Prompt Otimizado para: "${idea}"\n\n**Objetivo:** Criar conteúdo viral e engajador.\n**Formato:** Roteiro para Reels/TikTok com ganchos visuais fortes.\n\n**Estrutura Sugerida:**\n1. **Gancho (0-3s):** [Visual impactante relacionado a ${idea}] + "Você não vai acreditar no que descobri sobre..."\n2. **Corpo (3-15s):** Entregar o valor principal da ideia de forma rápida.\n3. **CTA (15s+):** "Comente 'EU QUERO' para saber mais."\n\n(Gerado pela IA do Hub)`);
      setIsOptimizing(false);
    }, 1500);
  };

  const handleCopyPrompt = () => {
    if (optimizedResult) {
      navigator.clipboard.writeText(optimizedResult);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSaveFeedback = async () => {
    if (user && optimizedResult) {
      await supabase.from('prompt_feedback').insert({
        user_id: user.id, raw_idea: idea, optimized_prompt: optimizedResult, is_useful: true, ai_response: "Simulated Response"
      });
      alert("Prompt salvo no seu histórico! (Simulação)");
    } else if (!user) {
      navigate('/login');
    }
  };

  const openAmazoChat = () => document.querySelector('typebot-bubble')?.shadowRoot?.querySelector('.button-container')?.click();

  // --- LÓGICA CARROSSEL ---
  const handlePrevTeam = () => {
    setActiveTeamIndex((prev) => (prev === 0 ? TEAM_MEMBERS.length - 1 : prev - 1));
  };
  const handleNextTeam = () => {
    setActiveTeamIndex((prev) => (prev === TEAM_MEMBERS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-fuchsia-900/50 overflow-x-hidden">
      <style>{`@keyframes floatRiver { 0% { transform: scale(1.0) translate(0, 0); } 50% { transform: scale(1.05) translate(0, -2%); } 100% { transform: scale(1.0) translate(0, 0); } } .river-animation { animation: floatRiver 25s infinite ease-in-out alternate; }`}</style>

      {/* --- HEADER (MOBILE FIX: Z-INDEX ALTO) --- */}
      <header className="fixed w-full z-[100] top-0 py-4 px-6 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-md border-b border-white/5 transition-all duration-300">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
               <span className="text-xl font-bold text-white tracking-tight drop-shadow-md hover:text-amber-400 transition">Encontro D'água .hub</span>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#lab" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Prompt Lab</a>
              <a href="#solucoes" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Soluções</a>
              <a href="#time" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Time</a>
              {user ? (
                <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-fuchsia-900/90 hover:bg-fuchsia-800 text-white rounded-full transition font-medium text-sm shadow-lg border border-fuchsia-800 backdrop-blur-md">Meu Painel</button>
              ) : (
                <div className="flex gap-4">
                  <button onClick={() => navigate('/login')} className="text-slate-200 hover:text-white transition text-sm font-medium">Login</button>
                  <button onClick={() => window.open('https://wa.me/5592999999999', '_blank')} className="px-6 py-2.5 bg-amber-500/90 hover:bg-amber-900 text-slate-900 rounded-full transition font-bold text-sm shadow-lg backdrop-blur-md">Solicitar Convite</button>
                </div>
              )}
            </div>
            
            {/* Botão Menu Mobile */}
            <button className="md:hidden text-white z-[101]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
         </div>

         {/* Menu Mobile Overlay */}
         {isMenuOpen && (
           <div className="md:hidden fixed inset-0 top-[70px] bg-[#02040a]/95 backdrop-blur-xl z-[90] flex flex-col items-center pt-12 space-y-8 animate-fade-in">
              <a href="#lab" onClick={() => setIsMenuOpen(false)} className="text-2xl text-slate-300 hover:text-amber-400">Prompt Lab</a>
              <a href="#solucoes" onClick={() => setIsMenuOpen(false)} className="text-2xl text-slate-300 hover:text-amber-400">Soluções</a>
              <a href="#time" onClick={() => setIsMenuOpen(false)} className="text-2xl text-slate-300 hover:text-amber-400">Time</a>
              <div className="pt-8 flex flex-col gap-4 w-3/4">
                <button onClick={() => {navigate('/login'); setIsMenuOpen(false)}} className="py-3 border border-white/20 rounded-full text-lg">Login</button>
                <button className="py-3 bg-amber-500 text-slate-900 font-bold rounded-full text-lg">Solicitar Convite</button>
              </div>
           </div>
         )}
      </header>

      {/* --- HERO SECTION (MOBILE FIX: MIN-H-SCREEN, NÃO H-SCREEN FIXO) --- */}
      <section className="relative min-h-[90vh] md:h-screen flex flex-col justify-end items-center overflow-hidden pb-32 px-6 pt-32 md:pt-0">
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none overflow-hidden"><div className="w-full h-full bg-cover bg-center river-animation" style={{ backgroundImage: "url('/hero-bg.jpg')" }} /></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/60 via-30% to-black/40 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-8xl font-extrabold tracking-tight leading-tight text-white drop-shadow-2xl">
            Sua ideia flui como <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-fuchsia-400 drop-shadow-sm">nossas águas.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg text-shadow-sm">
            Mais que automação. Um <span className="font-semibold text-amber-400">ecossistema digital</span> que une IA e estratégia humana para resolver problemas reais e libertar seu tempo.
          </p>
          <div className="pt-8 hidden md:block">
            <button onClick={() => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce text-slate-300 hover:text-white transition group flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 font-bold">Explore as Soluções</span>
              <ArrowRight className="w-6 h-6 rotate-90 text-amber-400" />
            </button>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO PROMPT LAB --- */}
      <section id="lab" className="py-20 px-6 bg-[#02040a] relative z-20 border-t border-white/5 scroll-mt-20">
        <div className="max-w-4xl mx-auto text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-900/20 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-6"><Sparkles className="w-3 h-3" /><span>Prove a Inteligência do Hub</span></div>
           <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Laboratório de Ideias</h2>
           <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">Digite um problema ou ideia vaga. Nossa engenharia de prompt devolve uma solução estruturada em segundos.</p>

           <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row gap-3 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-fuchsia-600 opacity-50 group-hover:opacity-100 transition"></div>
              <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Ex: Como divulgar minha loja de açaí no TikTok?" className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder:text-slate-600 focus:ring-0 text-lg"/>
              <button onClick={handleOptimize} disabled={isOptimizing} className="bg-fuchsia-900 hover:bg-fuchsia-800 text-white px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50">{isOptimizing ? '...' : <Sparkles className="w-5 h-5" />}<span>{isOptimizing ? 'Gerando...' : 'Otimizar'}</span></button>
           </div>

           {optimizedResult && (
            <div className="mt-8 bg-[#0f0518] border border-fuchsia-900/30 rounded-xl p-6 md:p-8 text-left animate-fade-in shadow-2xl relative">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-amber-400 font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Resultado Gerado</h3>
                <div className="flex gap-2 self-end md:self-auto">
                   <button onClick={handleCopyPrompt} className={`p-2 rounded-lg transition flex items-center gap-2 text-sm ${copySuccess ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}>
                     <Copy className="w-4 h-4" /> {copySuccess ? 'Copiado!' : 'Copiar'}
                   </button>
                   <button onClick={handleSaveFeedback} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-green-400 flex items-center gap-2 text-sm" title="Salvar no Painel">
                     <ThumbsUp className="w-4 h-4" /> Salvar
                   </button>
                </div>
              </div>
              <div className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/30 p-4 rounded-lg overflow-x-auto">{optimizedResult}</div>
            </div>
           )}
        </div>
      </section>

      {/* --- SEÇÃO SOLUÇÕES (TEXTOS CONTEXTUALIZADOS) --- */}
      <section id="solucoes" className="py-24 px-6 bg-gradient-to-b from-[#02040a] to-[#0a020f] relative z-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Soluções para Problemas Reais</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Nosso ecossistema oferece as ferramentas certas para cada desafio do seu negócio.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* CARD QR */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl hover:border-blue-500/30 transition duration-300 flex flex-col h-full hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-blue-400"><QrCode className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-white mb-3">QR D'água: Conexão Instantânea</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">Um único código, múltiplas funções. Crie cartões digitais, cardápios ou links de pagamento que seu cliente acessa num clique, sem apps extras.</p>
              <button onClick={() => navigate('/login')} className="text-blue-400 text-sm font-semibold flex items-center gap-2 mt-auto hover:gap-3 transition-all">Criar meu QR D'água <ArrowRight size={16} /></button>
            </div>

            {/* CARD AMAZO */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl hover:border-fuchsia-500/30 transition duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer" onClick={openAmazoChat}>
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-fuchsia-500"><Bot className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Amazo IA: Atendimento 24h</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">Nunca mais deixe um cliente no vácuo. Nossa agente de IA atende, qualifica e agenda no WhatsApp enquanto você foca no estratégico.</p>
              <button className="text-fuchsia-500 text-sm font-semibold flex items-center gap-2 mt-auto hover:gap-3 transition-all">Falar com a Amazo <ArrowRight size={16} /></button>
            </div>

            {/* CARD PROMPT LAB */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl hover:border-amber-500/30 transition duration-300 flex flex-col h-full hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-amber-500"><Brain className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Engenharia de Ideias</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">Travou na criação de conteúdo ou estratégia? Use nossa IA especializada para transformar intenções vagas em planos de ação estruturados.</p>
              <button onClick={() => document.getElementById('lab')?.scrollIntoView({behavior: 'smooth'})} className="text-amber-500 text-sm font-semibold flex items-center gap-2 mt-auto hover:gap-3 transition-all">Testar o Lab <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO TIME (CARROSSEL DESTAQUE) --- */}
      <section id="time" className="py-24 px-6 bg-[#02040a] relative z-20 border-t border-fuchsia-900/10 scroll-mt-20 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-12">
           <span className="text-fuchsia-500 font-bold tracking-widest text-sm uppercase">Quem Somos</span>
           <h2 className="text-3xl md:text-4xl font-bold mt-2 text-white">Inteligência Híbrida em Ação</h2>
        </div>

        {/* CARROSSEL */}
        <div className="relative max-w-4xl mx-auto flex items-center justify-center h-[400px]" ref={teamCarouselRef}>
           {/* Botão Anterior */}
           <button onClick={handlePrevTeam} className="absolute left-0 md:-left-12 z-30 p-2 bg-slate-800/50 hover:bg-fuchsia-900/50 rounded-full text-white transition"><ChevronLeft size={32}/></button>
           
           {/* Cards */}
           <div className="flex items-center justify-center relative w-full h-full perspective-1000">
            {TEAM_MEMBERS.map((member, index) => {
              // Lógica para determinar a posição relativa ao card ativo
              let position = index - activeTeamIndex;
              if (position < -1) position += TEAM_MEMBERS.length;
              if (position > 1) position -= TEAM_MEMBERS.length;
              
              const isActive = position === 0;
              const isSide = Math.abs(position) === 1;
              
              // Estilos dinâmicos baseados na posição
              let transform = '';
              let opacity = '';
              let zIndex = '';

              if (isActive) {
                transform = 'scale(1) translateX(0)';
                opacity = 'opacity-100';
                zIndex = 'z-20';
              } else if (isSide) {
                transform = `scale(0.8) translateX(${position * 120}%)`;
                opacity = 'opacity-40 blur-[1px]';
                zIndex = 'z-10';
              } else {
                 // Esconde os outros cards
                 transform = 'scale(0) translateX(0)';
                 opacity = 'opacity-0';
                 zIndex = 'z-0';
              }

              return (
                <div 
                  key={member.id}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[350px] bg-[#0f0518] border border-white/10 p-8 rounded-3xl shadow-2xl transition-all duration-500 ease-out flex flex-col items-center text-center ${transform} ${opacity} ${zIndex}`}
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-2 ${member.color.split(' ')[0]} bg-slate-800 mb-4 shadow-lg`}>
                    {member.type === 'human' ? '👩‍💻' : '🤖'}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                  <span className={`text-sm uppercase font-bold tracking-wider mb-4 ${member.color.split(' ')[1]}`}>{member.role}</span>
                  <p className="text-slate-300 leading-relaxed italic text-sm">"{member.pitch}"</p>
                </div>
              );
            })}
           </div>

           {/* Botão Próximo */}
           <button onClick={handleNextTeam} className="absolute right-0 md:-right-12 z-30 p-2 bg-slate-800/50 hover:bg-fuchsia-900/50 rounded-full text-white transition"><ChevronRight size={32}/></button>
        </div>
        
        {/* Indicadores (Bolinhas) */}
        <div className="flex justify-center gap-2 mt-8">
          {TEAM_MEMBERS.map((_, index) => (
            <button key={index} onClick={() => setActiveTeamIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === activeTeamIndex ? 'bg-fuchsia-500 w-6' : 'bg-slate-600 hover:bg-slate-400'}`} />
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 text-center text-slate-500 text-sm bg-[#02040a] relative z-20 border-t border-white/5">
        <p className="mb-4"><span className="text-amber-500 font-bold">Encontro D'água .hub</span> • Manaus, AM 🇧🇷</p>
        <p>© 2025 Tecnologia com Alma. Feito com <Heart className="w-3 h-3 inline text-red-500 mx-1" /> na Amazônia.</p>
      </footer>
    </div>
  );
}
