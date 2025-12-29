import React, { useState } from 'react';
import { HelpCircle, X, Mail, Lock, Navigation, MessageCircle } from 'lucide-react';

/**
 * Aiflow Support Component
 * Technical support agent for Login and Hub routes
 * Provides help with: password reset, access errors, navigation
 * Visual theme: Blue/Tech (distinct from Amazô's fuchsia)
 */
export const AiflowSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const helpTopics = [
        {
            icon: Lock,
            title: 'Esqueci minha senha',
            description: 'Recupere o acesso à sua conta',
            action: () => {
                alert('💡 Dica: Na tela de login, digite seu email e clique em "Esqueci minha senha". Você receberá um link de recuperação por email.');
                setIsOpen(false);
            }
        },
        {
            icon: Mail,
            title: 'Não recebi o email',
            description: 'Problemas com email de confirmação',
            action: () => {
                alert('💡 Dica: Verifique sua caixa de spam. Se não encontrar, aguarde alguns minutos e tente novamente. Emails podem levar até 5 minutos para chegar.');
                setIsOpen(false);
            }
        },
        {
            icon: Navigation,
            title: 'Erro de acesso',
            description: 'Problemas ao fazer login',
            action: () => {
                alert('💡 Dica: Verifique se seu email e senha estão corretos. Se o problema persistir, limpe o cache do navegador (Ctrl+Shift+Del) e tente novamente.');
                setIsOpen(false);
            }
        },
        {
            icon: MessageCircle,
            title: 'Suporte direto',
            description: 'Falar com a equipe',
            action: () => {
                window.open('https://wa.me/5592992943998?text=Olá! Preciso de ajuda técnica com o Hub.', '_blank');
                setIsOpen(false);
            }
        }
    ];

    return (
        <>
            {/* Floating Help Button - Blue Theme */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 z-[9999] w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                aria-label="Aiflow Technical Support"
            >
                {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
            </button>

            {/* Help Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="fixed bottom-24 left-6 z-[9999] w-[320px] bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <HelpCircle size={20} />
                                <h3 className="font-bold text-lg">Aiflow Suporte</h3>
                            </div>
                            <p className="text-xs text-blue-100">Assistência técnica 24/7</p>
                        </div>

                        {/* Help Topics */}
                        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                            {helpTopics.map((topic, index) => {
                                const Icon = topic.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={topic.action}
                                        className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/30 transition-colors">
                                                <Icon size={20} className="text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold text-sm mb-0.5">{topic.title}</h4>
                                                <p className="text-slate-400 text-xs">{topic.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-slate-800/50 border-t border-slate-700 text-center">
                            <p className="text-xs text-slate-400">
                                🤖 Aiflow • Suporte Técnico
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Animation Styles */}
            <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </>
    );
};
