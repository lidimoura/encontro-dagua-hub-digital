import React, { useState } from 'react';
import { Users, MessageCircle, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface CRMSimulatorProps {
    onCTAClick: () => void;
}

export const CRMSimulator: React.FC<CRMSimulatorProps> = ({ onCTAClick }) => {
    const [showAIInsight, setShowAIInsight] = useState(true);
    const [cardMoved, setCardMoved] = useState(false);

    const handleExecuteAI = () => {
        setShowAIInsight(false);
        setTimeout(() => setCardMoved(true), 300);
    };

    return (
        <section className="py-20 px-6 bg-[#05020a]">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <TrendingUp className="w-3 h-3" /> CRM Nativo
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Gestão Inteligente</h2>
                    <p className="text-slate-400 mb-2 max-w-2xl mx-auto">
                        Veja como a IA assiste você na gestão de leads e clientes
                    </p>
                    <p className="text-xs text-slate-500 max-w-2xl mx-auto italic">
                        💡 Clique em "Executar" no popup roxo para ver a mágica acontecer
                    </p>
                </div>

                {/* Interactive Kanban Simulator */}
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                        {/* Column 1: LEAD */}
                        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 relative">
                            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                                <Users size={16} /> LEAD
                            </h3>
                            <div className="space-y-2">
                                {/* Maria Silva - Interactive Card */}
                                {!cardMoved && (
                                    <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs relative transition-all duration-500">
                                        <p className="text-white font-semibold">Maria Silva</p>
                                        <p className="text-slate-400">Interesse em QR D'água</p>
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs">
                                    <p className="text-white font-semibold">João Santos</p>
                                    <p className="text-slate-400">Consultoria CRM</p>
                                </div>
                            </div>

                            {/* AI Insight Popup */}
                            {showAIInsight && !cardMoved && (
                                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] max-w-xs bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl z-10 animate-fade-in">
                                    <div className="flex items-start gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold mb-1">💡 Insight da IA</p>
                                            <p className="text-xs">Maria demonstrou interesse no Serviço X. Enviar Proposta?</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleExecuteAI}
                                        className="w-full bg-white text-fuchsia-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-fuchsia-50 transition-all shadow-lg"
                                    >
                                        ✨ Executar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Column 2: EM NEGOCIAÇÃO */}
                        <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-4">
                            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                <MessageCircle size={16} /> EM NEGOCIAÇÃO
                            </h3>
                            <div className="space-y-2">
                                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs">
                                    <p className="text-white font-semibold">Ana Costa</p>
                                    <p className="text-slate-400">Proposta enviada</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: CLIENTE */}
                        <div className="bg-slate-900/80 border border-green-500/30 rounded-xl p-4">
                            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                                <CheckCircle size={16} /> CLIENTE
                            </h3>
                            <div className="space-y-2">
                                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs">
                                    <p className="text-white font-semibold">Pedro Alves</p>
                                    <p className="text-slate-400">Ativo desde Jan/2025</p>
                                </div>

                                {/* Maria Silva - Moved Card with Animation */}
                                {cardMoved && (
                                    <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-xs animate-slide-in">
                                        <p className="text-white font-semibold">✨ Maria Silva</p>
                                        <p className="text-green-300">Convertida com sucesso!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Credits Footer */}
                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Base do CRM desenvolvida exclusivamente para alunos vitalícios da{' '}
                            <span className="text-slate-400 font-semibold">Escola de Automação de Thales Laray</span>.{' '}
                            Adaptado e potencializado pelo Hub Encontro D'água.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={onCTAClick}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
                        >
                            Tenho interesse no CRM
                        </button>
                    </div>
                </div>

                {/* Animation Styles */}
                <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateX(-20px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          .animate-slide-in {
            animation: slide-in 0.5s ease-out;
          }
        `}</style>
            </div>
        </section>
    );
};
