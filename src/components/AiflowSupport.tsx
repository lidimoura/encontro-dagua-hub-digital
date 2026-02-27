import React, { useState } from 'react';
import { HelpCircle, X, Mail, Lock, Navigation, MessageCircle, Bug, Send, ArrowLeft } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

/**
 * Aiflow Support Component
 * Technical support agent for Login and Hub routes
 * Provides help with: password reset, access errors, navigation, bug reporting
 * Visual theme: Blue/Tech (distinct from Amazô's fuchsia)
 */
export const AiflowSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'menu' | 'bugForm'>('menu');
    const [bugDesc, setBugDesc] = useState('');
    const { addActivity } = useCRM();
    const { addToast } = useToast();
    const { profile } = useAuth();

    const { user: activityUser } = useAuth(); // Rename to avoid conflict if needed, or just useAuth

    const handleSubmitBug = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bugDesc.trim()) return;

        // 1. Create Task in CRM
        addActivity({
            title: `Feedback/Bug: ${bugDesc.slice(0, 30)}...`,
            type: 'TASK',
            description: bugDesc,
            date: new Date().toISOString(),
            completed: false,
            dealId: 'system',
            dealTitle: 'Sistema',
            user: { name: 'User', avatar: '' }
        });

        // Insert visual notification for Admin
        try {
            await supabase.from('notifications').insert({
                company_id: profile?.company_id,
                title: 'Novo Bug/Report',
                message: bugDesc.slice(0, 60),
                read: false,
                created_at: new Date().toISOString()
            });
        } catch (err) {
            console.error('Failed to create notification', err);
        }

        // 2. Create Notification for Admin (using supabase directly)
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Get company_id from profile or metadata. 
                // Assuming current user's company is the target.
                // Or if this is a global support request, maybe we notify a specific admin?
                // For now, let's notify the current company's admins.

                // Get user profile to get company_id
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.company_id) {
                    await supabase.from('notifications').insert({
                        company_id: profile.company_id,
                        title: '🐛 Novo Report de Bug',
                        message: `Um usuário reportou: "${bugDesc.slice(0, 50)}..."`,
                        read: false,
                        link: '/activities', // Or wherever bugs are tracked
                        created_at: new Date().toISOString()
                    });
                }
            }
        } catch (err) {
            console.error('Failed to create notification', err);
        }

        addToast('Feedback enviado com sucesso! Nosso time vai analisar.', 'success');
        setBugDesc('');
        setView('menu');
        setIsOpen(false);
    };

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
            icon: Bug,
            title: 'Reportar Bug / Feedback',
            description: 'Encontrou um erro? Avise-nos!',
            action: () => setView('bugForm')
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

    const resetState = () => {
        setIsOpen(false);
        setView('menu');
        setBugDesc('');
    };

    return (
        <>
            {/* Floating Help Button - Blue Theme */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isOpen) resetState();
                    else setIsOpen(true);
                }}
                type="button"
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
                        onClick={resetState}
                    />

                    {/* Panel */}
                    <div className="fixed bottom-24 left-6 z-[9999] w-[320px] bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {view === 'bugForm' && (
                                    <button
                                        onClick={() => setView('menu')}
                                        className="mr-1 hover:bg-white/20 p-1 rounded-full transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                )}
                                <HelpCircle size={20} />
                                <h3 className="font-bold text-lg">
                                    {view === 'menu' ? 'Aiflow Suporte' : 'Reportar Bug'}
                                </h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {view === 'menu' ? (
                                <div className="space-y-2">
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
                            ) : (
                                <form onSubmit={handleSubmitBug} className="space-y-4">
                                    <p className="text-xs text-slate-400">
                                        Descreva o erro ou sugestão. Isso criará uma tarefa automática para nossa equipe.
                                    </p>
                                    <textarea
                                        value={bugDesc}
                                        onChange={(e) => setBugDesc(e.target.value)}
                                        placeholder="Ex: O botão de salvar não está funcionando na página de contatos..."
                                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-slate-500"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={!bugDesc.trim()}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} />
                                        Enviar Report
                                    </button>
                                </form>
                            )}
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
            <style>{`
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
