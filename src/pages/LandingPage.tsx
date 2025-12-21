import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, CheckCircle, Copy, ThumbsUp,
  QrCode, Bot, Brain, Menu, X, Heart, ArrowRight, ChevronLeft, ChevronRight, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// DADOS DO TIME
const TEAM_MEMBERS = [
  { id: 'precy', name: "Precy", role: "Tech Lead", type: "ai", color: "border-blue-500 text-blue-400", pitch: "Garanto estabilidade e segurança nas suas conexões digitais." },
  { id: 'lidi', name: "Lidi", role: "Founder", type: "human", color: "border-amber-500 text-amber-400", pitch: "Estratégia e visão para unir o melhor do humano e da IA." },
  { id: 'amazo', name: "Amazo", role: "CS & Vendas", type: "ai", color: "border-fuchsia-500 text-fuchsia-400", pitch: "Atendimento 24h para garantir que você não perca oportunidades." },
  { id: 'jury', name: "Jury", role: "Compliance", type: "ai", color: "border-red-500 text-red-400", pitch: "Ética e proteção de dados em todas as interações." }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTeamIndex, setActiveTeamIndex] = useState(1);
  const teamCarouselRef = useRef<HTMLDivElement>(null);

  // Prompt Lab State
  const [promptCategory, setPromptCategory] = useState<'viral' | 'agent' | 'media'>('viral');
  const [idea, setIdea] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);

  // Amazo Init
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js'; Typebot.initBubble({ typebot: "template-chatbot-amazo-4valfnc", apiHost: "https://typebot.io", theme: { button: { backgroundColor: "#4a044e", customIconSrc: "https://s3.typebot.io/public/workspaces/cmcppn5am0002jx04z0h8go9a/typebots/al5llo2evf2ahjg5u4valfnc/bubble-icon?v=1766194905653", }, chatWindow: { backgroundColor: "#F8F8F8" } }, });`;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); document.querySelector('typebot-bubble')?.remove(); };
  }, []);

  const openAmazoChat = () => document.querySelector('typebot-bubble')?.shadowRoot?.querySelector('.button-container')?.click();

  const handleOptimize = async () => {
    if (!idea.trim()) return;
    setIsOptimizing(true);
    setTimeout(() => {
      setOptimizedResult(`## 🌀 Prompt Otimizado\n\n**Intenção:** "${idea}"\n\n**Estrutura Sugerida:**\n1. **Contexto:** Defina quem é a IA.\n2. **Tarefa:** O que ela deve fazer.\n3. **Formato:** Como você quer a resposta.\n\n*Cadastre-se no Hub para usar templates avançados.*`);
      setIsOptimizing(false);
    }, 1500);
  };

  const handleNextTeam = () => setActiveTeamIndex((prev) => (prev === TEAM_MEMBERS.length - 1 ? 0 : prev + 1));
  const handlePrevTeam = () => setActiveTeamIndex((prev) => (prev === 0 ? TEAM_MEMBERS.length - 1 : prev - 1));

  return (
    // IMPORTANTE: w-full e overflow-x-hidden para evitar scroll lateral, mas permitir vertical
    <div className="w-full min-h-screen bg-[#02040a] text-white font-sans selection:bg-fuchsia-900/50 overflow-x-hidden">
      <style>{`@keyframes floatRiver { 0% { transform: scale(1.0); } 50% { transform: scale(1.05); } 100% { transform: scale(1.0); } } .river-animation { animation: floatRiver 25s infinite ease-in-out alternate; }`}</style>

      {/* HEADER FIXO COM Z-INDEX MÁXIMO */}
      <header className="fixed w-full z-[9999] top-0 py-4 px-6 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-xl font-bold text-white tracking-tight">Encontro D'água .hub 🌀</span>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#lab" className="text-slate-300 hover:text-amber-400 text-sm font-medium">Prompt Lab</a>
            <a href="#solucoes" className="text-slate-300 hover:text-amber-400 text-sm font-medium">Soluções</a>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-fuchsia-900 rounded-full text-sm font-bold">Painel</button>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="text-slate-200 text-sm">Login</button>
                <button onClick={() => navigate('/register')} className="px-6 py-2 bg-amber-500 text-black rounded-full text-sm font-bold">Criar Conta</button>
              </div>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[70px] bg-[#02040a] z-[9998] flex flex-col items-center pt-10 space-y-8 h-screen overflow-y-auto">
            <a href="#lab" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-300">Prompt Lab</a>
            <a href="#solucoes" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-300">Soluções</a>
            <a href="#time" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-300">Equipe</a>
            <button onClick={() => { navigate('/login'); setIsMenuOpen(false) }} className="text-amber-500 font-bold text-lg mt-8">Acessar Hub</button>
          </div>
        )}
      </header>

      {/* HERO SECTION - SEM h-screen FIXO */}
      <section className="relative min-h-[90vh] flex flex-col justify-end items-center pb-24 px-6 pt-32">
        <div className="absolute inset-0 z-0 w-full h-full"><div className="w-full h-full bg-cover bg-center river-animation opacity-60" style={{ backgroundImage: "url('/hero-bg.jpg')" }} /></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/80 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Tecnologia fluida, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-fuchsia-500">resultados reais.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            O <strong>Encontro D'água</strong> integra estratégias humanas com a eficiência da IA.
          </p>
          <div className="pt-8">
            <button onClick={() => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce flex flex-col items-center gap-2 text-slate-400 hover:text-white">
              <span className="text-xs uppercase tracking-widest font-bold">Conheça o Hub</span>
              <ArrowRight className="w-6 h-6 rotate-90 text-amber-500" />
            </button>
          </div>
        </div>
      </section>

      {/* PROMPT LAB SIMPLES */}
      <section id="lab" className="py-20 px-6 bg-[#02040a] border-t border-white/5 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider mb-6"><Brain className="w-3 h-3" /> <span>Engenharia de Ideias</span></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Domine a linguagem das IAs</h2>
          <p className="text-slate-400 text-lg mb-8">Digite sua intenção. A gente estrutura o comando.</p>

          {/* CATEGORIAS */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button onClick={() => setPromptCategory('viral')} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${promptCategory === 'viral' ? 'bg-fuchsia-600' : 'bg-slate-800 text-slate-400'}`}><MessageSquare size={16} /> Viral / Copy</button>
            <button onClick={() => setPromptCategory('agent')} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${promptCategory === 'agent' ? 'bg-fuchsia-600' : 'bg-slate-800 text-slate-400'}`}><Bot size={16} /> Agente IA</button>
            <button onClick={() => setPromptCategory('media')} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${promptCategory === 'media' ? 'bg-fuchsia-600' : 'bg-slate-800 text-slate-400'}`}><ImageIcon size={16} /> Mídias</button>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl mb-4">
            <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Ex: Quero vender mais no Instagram..." className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder:text-slate-500 focus:ring-0 text-lg" />
            <button onClick={handleOptimize} disabled={isOptimizing} className="bg-fuchsia-900 hover:bg-fuchsia-800 text-white px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">{isOptimizing ? '...' : <Sparkles className="w-5 h-5" />} Otimizar</button>
          </div>

          {optimizedResult && (
            <div className="mt-6 bg-[#0f0518] border border-fuchsia-900/30 rounded-xl p-6 text-left animate-fade-in shadow-xl">
              <div className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{optimizedResult}</div>
              <div className="mt-4 pt-4 border-t border-white/10 text-center"><button onClick={() => navigate('/login')} className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-bold hover:underline">Desbloquear Lab Completo no Hub →</button></div>
            </div>
          )}
        </div>
      </section>

      {/* SOLUÇÕES */}
      <section id="solucoes" className="py-20 px-6 bg-gradient-to-b from-[#02040a] to-[#0a020f] border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:border-blue-500/50 transition cursor-pointer" onClick={() => navigate('/login')}>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4"><QrCode /></div>
            <h3 className="text-xl font-bold text-white mb-2">QR D'água</h3>
            <p className="text-slate-400 text-sm">Conexão instantânea. Seus links em um lugar.</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:border-fuchsia-500/50 transition cursor-pointer" onClick={openAmazoChat}>
            <div className="w-12 h-12 bg-fuchsia-500/10 rounded-lg flex items-center justify-center text-fuchsia-400 mb-4"><Bot /></div>
            <h3 className="text-xl font-bold text-white mb-2">Amazo IA</h3>
            <p className="text-slate-400 text-sm">Atendimento 24h. Tire dúvidas agora.</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:border-amber-500/50 transition cursor-pointer" onClick={() => navigate('/login')}>
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 mb-4"><Brain /></div>
            <h3 className="text-xl font-bold text-white mb-2">CRM Nativo</h3>
            <p className="text-slate-400 text-sm">Gestão de leads simplificada.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-slate-600 text-xs bg-[#02040a] relative z-10 border-t border-white/5">
        <p>Encontro D'água .hub 🌀 • Inspirado na natureza.</p>
      </footer>
    </div>
  );
}