import React, { useState } from 'react';
import { HelpCircle, X, Mail, Lock, Navigation, MessageCircle, Bug, Send, ArrowLeft, Search, BookOpen, LayoutDashboard, Users, KanbanSquare, CalendarCheck, Sparkles, QrCode, Wand2, Settings, BarChart3, Crosshair } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

/**
 * AiflowSupport — Help Center + Technical Support (V10.4)
 * Two tabs: Quick Guide (feature reference from USER_GUIDE) + Support (bug reports, help topics)
 * Fully bilingual via t() translation keys
 */

interface GuideItem {
    icon: React.ElementType;
    titleKey: string;
    descKey: string;
    route: string;
}

const GUIDE_ITEMS: GuideItem[] = [
    { icon: LayoutDashboard, titleKey: 'helpCenter.dashboardTitle', descKey: 'helpCenter.dashboardDesc', route: '/dashboard' },
    { icon: Users, titleKey: 'helpCenter.contactsTitle', descKey: 'helpCenter.contactsDesc', route: '/contacts' },
    { icon: KanbanSquare, titleKey: 'helpCenter.boardsTitle', descKey: 'helpCenter.boardsDesc', route: '/boards' },
    { icon: CalendarCheck, titleKey: 'helpCenter.activitiesTitle', descKey: 'helpCenter.activitiesDesc', route: '/activities' },
    { icon: Sparkles, titleKey: 'helpCenter.aiHubTitle', descKey: 'helpCenter.aiHubDesc', route: '/ai' },
    { icon: QrCode, titleKey: 'helpCenter.linkDaguaTitle', descKey: 'helpCenter.linkDaguaDesc', route: '/qrdagua' },
    { icon: Wand2, titleKey: 'helpCenter.promptLabTitle', descKey: 'helpCenter.promptLabDesc', route: '/prompt-lab' },
    { icon: BarChart3, titleKey: 'helpCenter.reportsTitle', descKey: 'helpCenter.reportsDesc', route: '/reports' },
    { icon: Crosshair, titleKey: 'helpCenter.decisionsTitle', descKey: 'helpCenter.decisionsDesc', route: '/decisions' },
    { icon: Settings, titleKey: 'helpCenter.settingsTitle', descKey: 'helpCenter.settingsDesc', route: '/settings' },
];

export const AiflowSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'guide' | 'support' | 'bugForm'>('guide');
    const [bugDesc, setBugDesc] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { addActivity } = useCRM();
    const { addToast } = useToast();
    const { profile } = useAuth();
    const { t, language } = useLanguage();

    const handleSubmitBug = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bugDesc.trim()) return;

        // Create Task in CRM
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

        // Insert notification for Admin
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

        // Create Notification for Admin
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('company_id')
                    .eq('id', user.id)
                    .single();

                if (userProfile?.company_id) {
                    await supabase.from('notifications').insert({
                        company_id: userProfile.company_id,
                        title: '🐛 Novo Report de Bug',
                        message: `Um usuário reportou: "${bugDesc.slice(0, 50)}..."`,
                        read: false,
                        link: '/activities',
                        created_at: new Date().toISOString()
                    });
                }
            }
        } catch (err) {
            console.error('Failed to create notification', err);
        }

        addToast(
            language === 'en'
                ? 'Feedback sent! Our team will review it.'
                : language === 'es'
                    ? '¡Feedback enviado! Nuestro equipo lo revisará.'
                    : 'Feedback enviado com sucesso! Nosso time vai analisar.',
            'success'
        );
        setBugDesc('');
        setView('guide');
        setIsOpen(false);
    };

    const helpTopics = [
        {
            icon: Lock,
            title: t('forgotPassword'),
            description: language === 'en' ? 'Recover access to your account' : language === 'es' ? 'Recupera el acceso a tu cuenta' : 'Recupere o acesso à sua conta',
            action: () => {
                alert(language === 'en'
                    ? '💡 Tip: On the login screen, enter your email and click "Forgot password". You will receive a recovery link by email.'
                    : language === 'es'
                        ? '💡 Consejo: En la pantalla de inicio de sesión, ingresa tu correo y haz clic en "Olvidé mi contraseña".'
                        : '💡 Dica: Na tela de login, digite seu email e clique em "Esqueci minha senha". Você receberá um link de recuperação por email.');
                setIsOpen(false);
            }
        },
        {
            icon: Mail,
            title: language === 'en' ? "Didn't receive the email" : language === 'es' ? 'No recibí el correo' : 'Não recebi o email',
            description: language === 'en' ? 'Issues with confirmation email' : language === 'es' ? 'Problemas con el correo de confirmación' : 'Problemas com email de confirmação',
            action: () => {
                alert(language === 'en'
                    ? '💡 Tip: Check your spam folder. If not found, wait a few minutes and try again.'
                    : language === 'es'
                        ? '💡 Consejo: Revisa tu carpeta de spam. Si no lo encuentras, espera unos minutos e intenta de nuevo.'
                        : '💡 Dica: Verifique sua caixa de spam. Se não encontrar, aguarde alguns minutos e tente novamente.');
                setIsOpen(false);
            }
        },
        {
            icon: Navigation,
            title: language === 'en' ? 'Access error' : language === 'es' ? 'Error de acceso' : 'Erro de acesso',
            description: language === 'en' ? 'Issues logging in' : language === 'es' ? 'Problemas al iniciar sesión' : 'Problemas ao fazer login',
            action: () => {
                alert(language === 'en'
                    ? '💡 Tip: Check your email and password. If the issue persists, clear your browser cache (Ctrl+Shift+Del) and try again.'
                    : language === 'es'
                        ? '💡 Consejo: Verifica tu correo y contraseña. Si el problema persiste, limpia la caché del navegador.'
                        : '💡 Dica: Verifique se seu email e senha estão corretos. Se o problema persistir, limpe o cache do navegador (Ctrl+Shift+Del) e tente novamente.');
                setIsOpen(false);
            }
        },
        {
            icon: Bug,
            title: language === 'en' ? 'Report Bug / Feedback' : language === 'es' ? 'Reportar Bug / Feedback' : 'Reportar Bug / Feedback',
            description: language === 'en' ? 'Found an error? Let us know!' : language === 'es' ? '¿Encontraste un error? ¡Avísanos!' : 'Encontrou um erro? Avise-nos!',
            action: () => setView('bugForm')
        },
        {
            icon: MessageCircle,
            title: language === 'en' ? 'Direct support' : language === 'es' ? 'Soporte directo' : 'Suporte direto',
            description: language === 'en' ? 'Talk to the team' : language === 'es' ? 'Habla con el equipo' : 'Falar com a equipe',
            action: () => {
                window.open('https://m.me/encontrodagua', '_blank');
                setIsOpen(false);
            }
        }
    ];

    // Filter guide items by search query
    const filteredGuide = searchQuery.trim()
        ? GUIDE_ITEMS.filter(item =>
            t(item.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
            t(item.descKey).toLowerCase().includes(searchQuery.toLowerCase())
        )
        : GUIDE_ITEMS;

    const resetState = () => {
        setIsOpen(false);
        setView('guide');
        setBugDesc('');
        setSearchQuery('');
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
                    <div className="fixed bottom-24 left-6 z-[9999] w-[360px] max-w-[calc(100vw-3rem)] bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        {/* Header with Tabs */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {view === 'bugForm' && (
                                        <button
                                            onClick={() => setView('support')}
                                            className="mr-1 hover:bg-white/20 p-1 rounded-full transition-colors"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                    )}
                                    <HelpCircle size={20} />
                                    <h3 className="font-bold text-lg">
                                        {view === 'bugForm'
                                            ? (language === 'en' ? 'Report Bug' : language === 'es' ? 'Reportar Bug' : 'Reportar Bug')
                                            : t('helpCenter.title')}
                                    </h3>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            {view !== 'bugForm' && (
                                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                                    <button
                                        onClick={() => setView('guide')}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                            view === 'guide' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:text-white'
                                        }`}
                                    >
                                        <BookOpen size={13} />
                                        {t('helpCenter.quickGuide')}
                                    </button>
                                    <button
                                        onClick={() => setView('support')}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                            view === 'support' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:text-white'
                                        }`}
                                    >
                                        <MessageCircle size={13} />
                                        {t('helpCenter.support')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {view === 'guide' ? (
                                <div className="space-y-2">
                                    {/* Search */}
                                    <div className="relative mb-3">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={t('helpCenter.searchPlaceholder')}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Guide Cards */}
                                    {filteredGuide.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    window.location.hash = `#${item.route}`;
                                                    resetState();
                                                }}
                                                className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/30 transition-colors">
                                                        <Icon size={18} className="text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-semibold text-sm mb-0.5">{t(item.titleKey)}</h4>
                                                        <p className="text-slate-400 text-xs leading-relaxed">{t(item.descKey)}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {filteredGuide.length === 0 && (
                                        <p className="text-center text-slate-500 text-sm py-4">
                                            {language === 'en' ? 'No results found' : language === 'es' ? 'Sin resultados' : 'Nenhum resultado encontrado'}
                                        </p>
                                    )}
                                </div>
                            ) : view === 'support' ? (
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
                                        {language === 'en'
                                            ? 'Describe the error or suggestion. This will create an automatic task for our team.'
                                            : language === 'es'
                                                ? 'Describe el error o sugerencia. Esto creará una tarea automática para nuestro equipo.'
                                                : 'Descreva o erro ou sugestão. Isso criará uma tarefa automática para nossa equipe.'}
                                    </p>
                                    <textarea
                                        value={bugDesc}
                                        onChange={(e) => setBugDesc(e.target.value)}
                                        placeholder={language === 'en'
                                            ? 'E.g.: The save button is not working on the contacts page...'
                                            : language === 'es'
                                                ? 'Ej: El botón de guardar no funciona en la página de contactos...'
                                                : 'Ex: O botão de salvar não está funcionando na página de contatos...'}
                                        className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-slate-500"
                                        required
                                    />
                                    <button type="submit" disabled={!bugDesc.trim()}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Send size={16} />
                                        {language === 'en' ? 'Send Report' : language === 'es' ? 'Enviar Reporte' : 'Enviar Report'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-slate-800/50 border-t border-slate-700 text-center">
                            <p className="text-xs text-slate-400">
                                {language === 'en' ? '🤖 Aiflow • Help Center' : language === 'es' ? '🤖 Aiflow • Centro de Ayuda' : '🤖 Aiflow • Central de Ajuda'}
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
