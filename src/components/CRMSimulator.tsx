import React, { useState } from 'react';
import { Users, MessageCircle, CheckCircle, Sparkles, TrendingUp, CalendarCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CRMSimulatorProps {
    onCTAClick?: () => void;
}

export const CRMSimulator: React.FC<CRMSimulatorProps> = () => {
    const { t, language } = useTranslation();
    const [showAIInsight, setShowAIInsight] = useState(true);
    const [cardMoved, setCardMoved] = useState(false);

    const handleExecuteAI = () => {
        setShowAIInsight(false);
        setTimeout(() => setCardMoved(true), 300);
    };

    const WA_KOMMO_TRIAL = "https://wa.me/5541992557600?text=Ol%C3%A1%20Lidi%2C%20vi%20o%20simulador%20na%20LP%20do%20Hub%20e%20quero%20solicitar%20o%20Teste%20Gr%C3%A1tis%20do%20Kommo%20CRM%20%28Prova%20d%27%C3%81gua%29.";
    const WA_AGENDA_DIAGNOSTICO = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultoria%20%26%20Diagn%C3%B3stico%20%E2%80%94%20Encontro%20d%27%C3%81gua%20Hub&add=encontrodaguahub%40gmail.com&details=Ol%C3%A1%20L%C3%ADdi%20Moura%20%28encontrodaguahub%40gmail.com%29%2C%20gostaria%20de%20agendar%20um%20diagn%C3%B3stico%20de%20Dados%2C%20IA%20e%20Kommo%20CRM.";

    return (
        <section className="py-20 px-6 bg-[#05020a]">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <TrendingUp className="w-3 h-3" /> {language === 'en' ? 'Kommo CRM + GPTMaker AI in Action' : 'Kommo CRM + Agente IA na Prática'}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {language === 'en'
                            ? 'See how your sales funnel works with organized data & AI'
                            : 'Veja como seu funil funciona com Dados Organizados + Kommo & IA'}
                    </h2>
                    <p className="text-slate-400 mb-2 max-w-2xl mx-auto">
                        {language === 'en'
                            ? 'We organize your business rules, catalog, and documents so your AI Agent (GPTMaker) qualifies leads and moves opportunities automatically inside Kommo CRM.'
                            : 'Estruturamos suas regras de negócio, catálogo e documentos para que o seu Agente de IA (GPTMaker) qualifique leads no WhatsApp e movimente oportunidades automaticamente dentro do Kommo CRM.'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-2xl mx-auto italic">
                        {t('crmSimTip')}
                    </p>
                </div>

                {/* Interactive Kanban Simulator */}
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                        {/* Column 1: LEAD */}
                        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 relative">
                            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                                <Users size={16} /> {t('leadColumn')}
                            </h3>
                            <div className="space-y-2">
                                {/* Maria Silva - Interactive Card */}
                                {!cardMoved && (
                                    <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs relative transition-all duration-500">
                                        <p className="text-white font-semibold">Maria Silva</p>
                                        <p className="text-slate-400">{t('interestQr')}</p>
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs">
                                    <p className="text-white font-semibold">João Santos</p>
                                    <p className="text-slate-400">{t('consultingCrm')}</p>
                                </div>
                            </div>

                            {/* AI Insight Popup */}
                            {showAIInsight && !cardMoved && (
                                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] max-w-xs bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl z-10 animate-fade-in">
                                    <div className="flex items-start gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold mb-1">{t('aiInsightTitle')}</p>
                                            <p className="text-xs">{t('aiInsightText')}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleExecuteAI}
                                        className="w-full bg-white text-fuchsia-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-fuchsia-50 transition-all shadow-lg"
                                    >
                                        {t('executeBtn')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Column 2: EM NEGOCIAÇÃO */}
                        <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-4">
                            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                                <MessageCircle size={16} /> {t('negotiationColumn')}
                            </h3>
                            <div className="space-y-2">
                                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs">
                                    <p className="text-white font-semibold">Ana Costa</p>
                                    <p className="text-slate-400">{t('proposalSent')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: CLIENTE */}
                        <div className="bg-slate-900/80 border border-green-500/30 rounded-xl p-4">
                            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                                <CheckCircle size={16} /> {t('clientColumn')}
                            </h3>
                            <div className="space-y-2">
                                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs">
                                    <p className="text-white font-semibold">Pedro Alves</p>
                                    <p className="text-slate-400">{t('activeSince')}</p>
                                </div>

                                {/* Maria Silva - Moved Card with Animation */}
                                {cardMoved && (
                                    <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-xs animate-slide-in">
                                        <p className="text-white font-semibold">✨ Maria Silva</p>
                                        <p className="text-green-300">{t('convertedSuccess')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Footer */}
                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                        <p className="text-xs text-slate-400 leading-relaxed">
                             Demonstração interativa de pipeline comercial estruturado pela <strong className="text-white">Lídi Moura (Parceira Certificada Kommo & Analista de Dados)</strong> integrando atendimento inteligente via <strong className="text-white">GPTMaker</strong>.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={WA_KOMMO_TRIAL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                        >
                            <MessageCircle size={18} /> Solicitar Teste Grátis Kommo (Prova d'Água)
                        </a>
                        <a
                            href={WA_AGENDA_DIAGNOSTICO}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-7 py-3.5 bg-white/5 border border-purple-500/40 text-purple-300 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <CalendarCheck size={18} /> Agendar Consultoria (encontrodaguahub@gmail.com)
                        </a>
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
