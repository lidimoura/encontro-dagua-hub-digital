import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, CheckCircle, Copy, Play,
  QrCode, Bot, Brain, Menu, X, ArrowRight, ChevronLeft, ChevronRight, Globe, Users, MessageCircle
} from 'lucide-react';

// DADOS DO TIME
const TEAM_MEMBERS = [
  {
    id: 'lidi',
    name: "Lidi",
    role: "Founder & Visão",
    type: "human",
    image: "/profile.png",
    color: "border-amber-500 text-amber-400",
    pitch: "Minha missão é desenhar soluções tecnológicas que devolvam tempo e liberdade para você empreender."
  },
  {
    id: 'amazo',
    name: "Amazo",
    role: "Customer Success",
    type: "ai",
    color: "border-fuchsia-500 text-fuchsia-400",
    pitch: "Atendimento 24h. Garanto que nenhum cliente fique sem resposta, guiando cada passo."
  },
  {
    id: 'precy',
    name: "Precy",
    role: "Tech Lead",
    type: "ai",
    color: "border-blue-500 text-blue-400",
    pitch: "Estabilidade e segurança. Cuido para que seu QR D'água e links funcionem sempre."
  },
  {
    id: 'jury',
    name: "Jury",
    role: "Compliance",
    type: "ai",
    color: "border-red-500 text-red-400",
    pitch: "Ética e responsabilidade. Garanto que a IA respeite a privacidade e valores humanos."
  }
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
    // SIMULAÇÃO DE ALTA QUALIDADE (Sem texto dummy)
    setTimeout(() => {
      setOptimizedResult(`## 🌀 Prompt Estruturado pelo Hub\n\n**CONTEXTO:**\nVocê é um especialista em comunicação digital e copywriter persuasivo.\n\n**TAREFA:**\n${idea}\n\n**REQUISITOS:**\n- Use gatilhos mentais de curiosidade.\n- Mantenha parágrafos curtos para leitura mobile.\n- Finalize com uma chamada para ação (CTA) clara.\n\n**TOM DE VOZ:**\nEmpático, acessível e profissional.`);
      setIsOptimizing(false);
    }, 1000);
  };

  const handleCopy = () => {
    if (optimizedResult) { navigator.clipboard.writeText(optimizedResult); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }
  }

  const handleNextTeam = () => setActiveTeamIndex((prev) => (prev === TEAM_MEMBERS.length - 1 ? 0 : prev + 1));
  const handlePrevTeam = () => setActiveTeamIndex((prev) => (prev === 0 ? TEAM_MEMBERS.length - 1 : prev - 1));

  return (
    <div className="w-full min-h-screen bg-[#02040a] text-white font-sans selection:bg-fuchsia-900/50 overflow-x-hidden">
      <style>{`@keyframes floatRiver { 0% { transform: scale(1.0); } 50% { transform: scale(1.05); } 100% { transform: scale(1.0); } } .river-animation { animation: floatRiver 25s infinite ease-in-out alternate; }`}</style>

      {/* HEADER */}
      <header className="fixed w-full z-[9999] top-0 py-4 px-6 bg-black/60 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-xl font-bold text-white tracking-tight drop-shadow-md">Encontro D'água .hub 🌀</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#manifesto" className="text-slate-200 hover:text-amber-400 text-sm font-medium drop-shadow-sm">Manifesto</a>
            <a href="#solucoes" className="text-slate-200 hover:text-amber-400 text-sm font-medium drop-shadow-sm">Soluções</a>
            <a href="#time" className="text-slate-200 hover:text-amber-400 text-sm font-medium drop-shadow-sm">Sobre Nós</a>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-fuchsia-900 rounded-full text-sm font-bold shadow-lg hover:bg-fuchsia-800 transition">Acessar Painel</button>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="text-white text-sm font-bold hover:text-amber-400 transition">Login</button>
                <button onClick={() => navigate('/register')} className="px-6 py-2 bg-amber-500 text-black rounded-full text-sm font-bold hover:bg-amber-400 transition shadow-lg">Criar Conta</button>
              </div>
            )}
          </div>
          <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[70px] bg-[#02040a] z-[9998] flex flex-col items-center pt-10 space-y-8 h-screen overflow-y-auto">
            <a href="#manifesto" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-300">Manifesto</a>
            <a href="#solucoes" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-300">Soluções</a>
            <a href="#time" onClick={() => setIsMenuOpen(false)} className="text-xl text-slate-300">Sobre Nós</a>
            <button onClick={() => { navigate('/login'); setIsMenuOpen(false) }} className="text-amber-500 font-bold text-lg mt-8">Acessar Hub</button>
          </div>
        )}
      </header>

      {/* HERO SECTION - PARALLAX LIMPO */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center px-6 text-center">
        {/* Fundo Parallax */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          {/* Removido o bg-black pesado, agora é mais transparente para ver o rio */}
          <div className="w-full h-full bg-cover bg-center river-animation" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
          <div className="absolute inset-0 bg-black/40" /> {/* Overlay leve apenas para contraste do texto */}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-fade-in-up flex flex-col items-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-amber-400 shadow-xl">
            🚀 Mobile First • AI First • Impacto Real
          </div>

          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl">
            Tecnologia mais <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-fuchsia-500 filter drop-shadow-lg">acessível.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-3xl mx-auto drop-shadow-xl text-shadow-sm">
            Um ecossistema digital que oferece as melhores soluções tecnológicas para resolver problemas reais e garantir resultados e prosperidade para todos.
          </p>

          <div className="pt-10 w-full flex justify-center">
            <button onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce flex flex-col items-center gap-2 text-white hover:text-amber-400 transition drop-shadow-md">
              <span className="text-xs uppercase tracking-widest font-bold">Conheça o Hub</span>
              <ArrowRight className="w-6 h-6 rotate-90 text-amber-500" />
            </button>
          </div>
        </div>
      </section>

      {/* MANIFESTO / IMPACTO SOCIAL */}
      <section id="manifesto" className="py-24 px-6 bg-[#02040a] relative z-10 text-center border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500"><Globe size={32} /></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Tecnologia para Todos</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-3xl mx-auto">
            Não somos uma agência comum. Nosso compromisso é com o impacto social.
            Garantimos acessibilidade e preços justos para que ninguém fique de fora da economia digital.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              "Pessoas Originárias e em Retomada", // ADICIONADO
              "Mães e Pais Empreendedores",
              "Negócios Locais & Regionais",
              "Ribeirinhos & Quilombolas",
              "PCD & Neurodivergentes",
              "LGBTQIAPN+",
              "Pessoas Pretas e Pardas",
              "ONGs e Projetos Sociais"
            ].map((tag) => (
              <span key={tag} className="px-5 py-2 rounded-full bg-slate-900 border border-white/10 text-slate-300 text-sm font-semibold hover:border-amber-500/50 hover:text-white transition cursor-default shadow-sm">
                {tag}
              </span>
            ))}
          </div>

          {/* CTA CONSULTORIA SOCIAL */}
          <div className="bg-gradient-to-r from-fuchsia-900/20 to-amber-900/20 p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">🤝 Ninguém fica para trás</h3>
            <p className="text-slate-400 text-sm mb-6">Precisa de uma condição especial? Oferecemos descontos justos e sustentáveis para garantir sua prosperidade.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button onClick={() => window.open('https://wa.me/5592992943998?text=Olá! Gostaria da consultoria social gratuita de 10min sobre o Hub.', '_blank')} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg">
                <MessageCircle size={18} /> Consultoria Social Gratuita (10min)
              </button>
              <button onClick={openAmazoChat} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition">
                <Bot size={18} /> Tirar Dúvidas com Amazo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PROMPT LAB (AGORA FUNCIONAL) */}
      <section className="py-20 px-6 bg-[#05020a] border-y border-white/5 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-6"><Brain className="w-3 h-3" /> <span>Teste nossa Engenharia de Ideias</span></div>
          <h3 className="text-3xl font-bold text-white mb-4">Digite uma intenção e veja a mágica.</h3>

          <div className="flex flex-col md:flex-row gap-2 mb-6 bg-slate-900/50 p-2 rounded-2xl border border-white/10 shadow-2xl">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ex: Preciso de copy para vender açaí no instagram..."
              className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder:text-slate-500 focus:ring-0 text-lg"
            />
            <button onClick={handleOptimize} disabled={isOptimizing} className="bg-fuchsia-600 hover:bg-fuchsia-500 px-8 py-3 rounded-xl font-bold text-white transition disabled:opacity-50 min-w-[120px]">
              {isOptimizing ? 'Criando...' : 'Otimizar'}
            </button>
          </div>

          {/* RESULTADO ESTRUTURADO REAL (SIMULADO) */}
          {optimizedResult && (
            <div className="text-left bg-[#0f0518] border border-fuchsia-500/20 p-6 rounded-2xl shadow-xl animate-fade-in relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-500 to-amber-500 rounded-l-2xl"></div>
              <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed mb-6 overflow-x-auto">
                {optimizedResult}
              </pre>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={handleCopy} className="text-slate-300 hover:text-white text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition">
                  {copySuccess ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />} {copySuccess ? 'Copiado!' : 'Copiar'}
                </button>
                <button onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition border border-white/10">
                  <Play size={16} className="text-amber-400" /> Testar no Hub
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-6">*Cadastre-se para acessar templates avançados de Agentes e Vendas.</p>
        </div>
      </section>

      {/* SOLUÇÕES */}
      <section id="solucoes" className="py-20 px-6 bg-[#02040a] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Soluções Reais</h2>
            <p className="text-slate-400">Ferramentas desenhadas para resolver dores reais.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* PROMPT LAB */}
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition duration-300 hover:border-amber-500/30">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 mb-4"><Brain /></div>
              <h3 className="text-lg font-bold text-white mb-2">Prompt Lab</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Engenharia de ideias. Transforme intenções em prompts estratégicos estruturados.</p>
            </div>

            {/* QR D'ÁGUA */}
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition duration-300 hover:border-blue-500/30">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4"><QrCode /></div>
              <h3 className="text-lg font-bold text-white mb-2">QR D'água</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Conexão instantânea. Cartões digitais e links que resolvem problemas reais.</p>
            </div>

            {/* AMAZO IA (CLICK TO CHAT) */}
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition duration-300 cursor-pointer hover:border-fuchsia-500/30 group" onClick={openAmazoChat}>
              <div className="w-12 h-12 bg-fuchsia-500/10 rounded-lg flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-110 transition"><Bot /></div>
              <h3 className="text-lg font-bold text-white mb-2">Amazo IA</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Atendimento 24/7. Clique para falar com nossa IA agora mesmo.</p>
            </div>

            {/* CRM NATIVO */}
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition duration-300 hover:border-green-500/30">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500 mb-4"><Users /></div>
              <h3 className="text-lg font-bold text-white mb-2">CRM Nativo</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Gestão simplificada de leads com IA integrada e recursos estratégicos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE NÓS (TEAM) */}
      <section id="time" className="py-20 px-6 bg-[#02040a] relative z-10 border-t border-white/5">
        <div className="text-center mb-12"><h2 className="text-3xl font-bold text-white">Sobre Nós</h2></div>
        <div className="relative max-w-lg mx-auto h-[350px] flex items-center justify-center">
          <button onClick={handlePrevTeam} className="absolute left-0 z-20 p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition"><ChevronLeft /></button>

          <div className="text-center p-8 bg-[#0f0518] border border-white/10 rounded-3xl w-full mx-8 shadow-2xl flex flex-col items-center">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl border-2 ${TEAM_MEMBERS[activeTeamIndex].color.split(' ')[0]} bg-slate-800 mb-4 overflow-hidden shadow-lg`}>
              {TEAM_MEMBERS[activeTeamIndex].image ? (
                <img src={TEAM_MEMBERS[activeTeamIndex].image} alt={TEAM_MEMBERS[activeTeamIndex].name} className="w-full h-full object-cover" />
              ) : (
                <span>{TEAM_MEMBERS[activeTeamIndex].type === 'human' ? '👩‍💻' : '🤖'}</span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{TEAM_MEMBERS[activeTeamIndex].name}</h3>
            <span className={`text-xs uppercase font-bold tracking-widest mb-4 block ${TEAM_MEMBERS[activeTeamIndex].color.split(' ')[1]}`}>{TEAM_MEMBERS[activeTeamIndex].role}</span>
            <p className="text-slate-300 text-sm italic leading-relaxed">"{TEAM_MEMBERS[activeTeamIndex].pitch}"</p>
          </div>

          <button onClick={handleNextTeam} className="absolute right-0 z-20 p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition"><ChevronRight /></button>
        </div>
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {TEAM_MEMBERS.map((_, idx) => (
            <div key={idx} className={`h-2 rounded-full transition-all ${idx === activeTeamIndex ? 'w-6 bg-fuchsia-500' : 'w-2 bg-slate-700'}`} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-slate-600 text-xs bg-[#02040a] relative z-10 border-t border-white/5">
        <p className="mb-2 text-white font-bold">Encontro D'água .hub 🌀</p>
        <p>Inspirado na natureza, codificado para o mundo.</p>
      </footer>
    </div>
  );
}