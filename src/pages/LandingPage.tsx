import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, CheckCircle, Copy, Save, ThumbsUp, ThumbsDown, 
  QrCode, Bot, Brain, Menu, X, Heart, ArrowRight, XCircle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- DADOS DO TIME (Pitch Individual) ---
const TEAM_MEMBERS = [
  {
    id: 'lidi',
    name: "Lidi",
    role: "Founder & Criadora",
    type: "human",
    color: "border-amber-500",
    pitch: "A mente humana que orquestra a tecnologia. Minha missão não é apenas criar códigos, mas desenhar soluções que devolvam tempo e liberdade para você empreender na Amazônia."
  },
  {
    id: 'amazo',
    name: "Amazo",
    role: "CS & Vendas",
    type: "ai",
    color: "border-fuchsia-600",
    pitch: "Sua representante digital incansável. Eu atendo, tiro dúvidas e agendo serviços no WhatsApp 24h por dia, garantindo que nenhum cliente fique no vácuo."
  },
  {
    id: 'precy',
    name: "Precy",
    role: "Tech Lead",
    type: "ai",
    color: "border-blue-500",
    pitch: "A precisão em forma de código. Eu garanto que o QR D'água, o CRM e as integrações funcionem sem falhas, cuidando da segurança e da estabilidade do Hub."
  },
  {
    id: 'jury',
    name: "Jury",
    role: "Compliance",
    type: "ai",
    color: "border-red-500",
    pitch: "O guardião da ética. Minha função é garantir que todas as automações respeitem as regras, a privacidade dos dados e os valores humanos do Encontro D'água."
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null); // Para o Modal do Time
  
  // --- LÓGICA MAGIC LINK (REFERRAL) ---
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referral_source', refCode);
    }
  }, [searchParams]);

  // --- INTEGRAÇÃO AMAZO (TYPEBOT - SCRIPT NATIVO) ---
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js'
      
      Typebot.initBubble({
        typebot: "template-chatbot-amazo-4valfnc",
        apiHost: "https://typebot.io",
        previewMessage: {
          message: "Oi! Posso ajudar?",
          autoShowDelay: 3000,
          avatarUrl: "https://s3.typebot.io/public/workspaces/cmcppn5am0002jx04z0h8go9a/typebots/al5llo2evf2ahjg5u4valfnc/bubble-icon?v=1766194905653",
        },
        theme: {
          button: {
            backgroundColor: "#4a044e", // Cor Açaí (Vinho Profundo)
            customIconSrc: "https://s3.typebot.io/public/workspaces/cmcppn5am0002jx04z0h8go9a/typebots/al5llo2evf2ahjg5u4valfnc/bubble-icon?v=1766194905653",
          },
          chatWindow: { backgroundColor: "#F8F8F8" }
        },
      });
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      const bubbleContainer = document.querySelector('typebot-bubble');
      if (bubbleContainer) bubbleContainer.remove();
    };
  }, []);

  // --- LÓGICA PROMPT LAB ---
  const [idea, setIdea] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!idea.trim()) return;
    setIsOptimizing(true);
    setTimeout(() => {
      const mockResult = `## 🤖 Prompt Otimizado para: "${idea}"\n\n**Persona:** Especialista em Estratégia Digital.\n**Objetivo:** Criar conteúdo viral sobre ${idea}.\n**Formato:** Roteiro para Reels/TikTok com ganchos visuais.\n\n(Gerado pela IA do Hub)`;
      setOptimizedResult(mockResult);
      setIsOptimizing(false);
    }, 1500);
  };

  const handleSaveFeedback = async (isUseful: boolean) => {
    if (user) {
      await supabase.from('prompt_feedback').insert({
        user_id: user.id, raw_idea: idea, optimized_prompt: optimizedResult, is_useful: isUseful, ai_response: "Simulated Response"
      });
    }
  };

  // Função auxiliar para abrir o chat da Amazo ao clicar no card
  const openAmazoChat = () => {
    const bubbleButton = document.querySelector('typebot-bubble')?.shadowRoot?.querySelector('.button-container') as HTMLElement;
    if (bubbleButton) bubbleButton.click();
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans selection:bg-fuchsia-900/50">
      
      {/* EFEITO CSS: ANIMAÇÃO SUAVE DO RIO */}
      <style>{`
        @keyframes floatRiver {
          0% { transform: scale(1.0) translate(0, 0); }
          50% { transform: scale(1.05) translate(0, -2%); }
          100% { transform: scale(1.0) translate(0, 0); }
        }
        .river-animation {
          animation: floatRiver 25s infinite ease-in-out alternate;
        }
      `}</style>

      {/* --- HEADER --- */}
      <header className="fixed w-full z-50 top-0 py-4 px-6 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm border-b border-white/5 transition-all duration-300">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
               <span className="text-xl font-bold text-white tracking-tight drop-shadow-md hover:text-amber-400 transition">
                 Encontro D'água
               </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#lab" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Prompt Lab</a>
              <a href="#solucoes" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Soluções</a>
              <a href="#time" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Time</a>
              
              {user ? (
                <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-fuchsia-900/90 hover:bg-fuchsia-800 text-white rounded-full transition font-medium text-sm shadow-lg border border-fuchsia-800 backdrop-blur-md">
                  Meu Painel
                </button>
              ) : (
                <div className="flex gap-4">
                  <button onClick={() => navigate('/login')} className="text-slate-200 hover:text-white transition text-sm font-medium">Login</button>
                  <button onClick={() => window.open('https://wa.me/5592999999999', '_blank')} className="px-6 py-2.5 bg-amber-500/90 hover:bg-amber-400 text-slate-900 rounded-full transition font-bold text-sm shadow-lg backdrop-blur-md">
                    Solicitar Convite
                  </button>
                </div>
              )}
            </div>
            
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
         </div>
      </header>

      {/* --- HERO SECTION (CINEMATOGRÁFICA) --- */}
      {/* Texto alinhado embaixo (justify-end) para destacar a imagem */}
      <section className="relative h-screen flex flex-col justify-end items-center overflow-hidden pb-32 px-6">
        
        {/* PARALLAX + ANIMAÇÃO RIO */}
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none overflow-hidden">
           <div 
             className="w-full h-full bg-cover bg-center river-animation"
             style={{ backgroundImage: "url('/hero-bg.jpg')" }} 
           />
        </div>
        
        {/* OVERLAY SUTIL (Fade para o preto apenas no rodapé) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/50 via-20% to-transparent pointer-events-none" />

        {/* CONTEÚDO HERO */}
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6 animate-fade-in-up">
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight leading-tight text-white drop-shadow-2xl">
            Sua ideia flui como <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-fuchsia-400 drop-shadow-sm">
              nossas águas.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-100 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg text-shadow-sm">
            Não vendemos apenas automação. Entregamos <span className="font-semibold text-amber-400">liberdade</span> para você empreender com a força da tecnologia e o calor humano.
          </p>

          <div className="pt-8">
            <button onClick={() => document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce text-slate-300 hover:text-white transition group flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 font-bold">Explore o Hub</span>
              <ArrowRight className="w-6 h-6 rotate-90 text-amber-400" />
            </button>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO PROMPT LAB (ONBOARDING) --- */}
      <section id="lab" className="py-24 px-6 bg-[#02040a] relative z-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-900/20 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Experimente Agora • Grátis</span>
           </div>
           
           <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Laboratório de Ideias</h2>
           <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
             Não sabe por onde começar? O Hub traduz sua intenção em comandos perfeitos. 
             Digite uma ideia simples abaixo e veja a mágica acontecer.
           </p>

           {/* WIDGET */}
           <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row gap-3 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-fuchsia-600 opacity-50 group-hover:opacity-100 transition"></div>
              <input 
                type="text" 
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ex: Crie uma legenda para vender artesanato no Instagram..."
                className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder:text-slate-600 focus:ring-0 text-lg"
              />
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="bg-fuchsia-900 hover:bg-fuchsia-800 text-white px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isOptimizing ? '...' : <Sparkles className="w-5 h-5" />}
                <span className="">{isOptimizing ? 'Criando...' : 'Otimizar Ideia'}</span>
              </button>
           </div>

           {/* RESULTADO */}
           {optimizedResult && (
            <div className="mt-8 bg-[#0f0518] border border-fuchsia-900/30 rounded-xl p-8 text-left animate-fade-in shadow-2xl relative">
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-amber-400 font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Resultado Profissional</h3>
                <div className="flex gap-2">
                   <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="Copiar"><Copy className="w-4 h-4" /></button>
                   <button onClick={() => handleSaveFeedback(true)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-green-400"><ThumbsUp className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{optimizedResult}</div>
              
              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                 <p className="text-slate-500 text-sm mb-3">Gostou? Crie sua conta para salvar seus prompts.</p>
                 <button onClick={() => navigate('/login')} className="text-amber-500 font-bold hover:underline">Criar conta gratuita →</button>
              </div>
            </div>
           )}
        </div>
      </section>

      {/* --- SEÇÃO SOLUÇÕES --- */}
      <section id="solucoes" className="py-24 px-6 bg-gradient-to-b from-[#02040a] to-[#0a020f] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Soluções Reais</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Não vendemos ferramentas. Resolvemos problemas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* CARD 1 */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl hover:border-amber-500/30 transition duration-300 flex flex-col h-full hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-amber-500">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Engenharia de Ideias</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                Você tem a ideia, nós damos a forma. Use nossa IA para criar roteiros, legendas e estratégias de venda em segundos.
              </p>
              <button onClick={() => document.getElementById('lab')?.scrollIntoView({behavior: 'smooth'})} className="text-amber-500 text-sm font-semibold flex items-center gap-2 mt-auto hover:gap-3 transition-all">
                Usar Prompt Lab <ArrowRight size={16} />
              </button>
            </div>

            {/* CARD 2 */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl hover:border-blue-500/30 transition duration-300 flex flex-col h-full hover:-translate-y-1">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-blue-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Conexão Digital</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                Seu cartão de visita virou um portal. Crie menus, links de bio e páginas de venda que carregam instantaneamente no celular.
              </p>
              <button onClick={() => navigate('/login')} className="text-blue-400 text-sm font-semibold flex items-center gap-2 mt-auto hover:gap-3 transition-all">
                Criar meu QR <ArrowRight size={16} />
              </button>
            </div>

            {/* CARD 3 - CLICK TO CHAT */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl hover:border-fuchsia-500/30 transition duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer" onClick={openAmazoChat}>
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 text-fuchsia-500">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Atendimento Infinito</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                Sua empresa aberta 24h. A Amazo atende, tira dúvidas e encaminha clientes no WhatsApp enquanto você dorme.
              </p>
              <button className="text-fuchsia-500 text-sm font-semibold flex items-center gap-2 mt-auto hover:gap-3 transition-all">
                Falar com Amazo <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO TIME (COM MODAL DE ONBOARDING) --- */}
      <section id="time" className="py-24 px-6 bg-[#02040a] relative z-20 border-t border-fuchsia-900/10">
        <div className="max-w-6xl mx-auto text-center">
           <span className="text-fuchsia-500 font-bold tracking-widest text-sm uppercase">Quem Somos</span>
           <h2 className="text-3xl md:text-4xl font-bold mt-2 text-white mb-12">Inteligência Híbrida</h2>

           <div className="flex flex-wrap gap-12 justify-center">
              {TEAM_MEMBERS.map((member) => (
                <div 
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex flex-col items-center text-center space-y-3 group cursor-pointer"
                >
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-2 ${member.color} bg-slate-800/80 shadow-xl group-hover:scale-110 group-hover:shadow-amber-500/20 transition duration-300`}>
                    {member.type === 'human' ? '👩‍💻' : '🤖'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-amber-400 transition text-lg">{member.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{member.role}</p>
                    <span className="text-[10px] text-fuchsia-500 opacity-0 group-hover:opacity-100 transition">Ver perfil</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- MODAL DO TIME --- */}
      {selectedMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedMember(null)}>
           <div className="bg-[#0f0518] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><XCircle /></button>
              
              <div className="flex flex-col items-center text-center mb-6">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2 ${selectedMember.color} bg-slate-800 mb-4`}>
                    {selectedMember.type === 'human' ? '👩‍💻' : '🤖'}
                 </div>
                 <h3 className="text-2xl font-bold text-white">{selectedMember.name}</h3>
                 <span className="text-amber-500 text-sm uppercase font-bold tracking-wider">{selectedMember.role}</span>
              </div>
              
              <p className="text-slate-300 text-center leading-relaxed mb-8 italic">
                "{selectedMember.pitch}"
              </p>

              <button onClick={() => setSelectedMember(null)} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition">
                Fechar
              </button>
           </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="py-12 text-center text-slate-500 text-sm bg-[#02040a] relative z-20 border-t border-white/5">
        <p className="mb-4">
          <span className="text-amber-500 font-bold">Encontro D'água</span> • Manaus, AM 🇧🇷
        </p>
        <p>© 2025 Tecnologia com Alma. Feito com <Heart className="w-3 h-3 inline text-red-500 mx-1" /> na Amazônia.</p>
      </footer>
    </div>
  );
}