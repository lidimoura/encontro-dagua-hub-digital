import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCRM } from '@/context/CRMContext';
import AIAssistant from './AIAssistant';

/**
 * Props for the FloatingAIWidget component
 * @property {boolean} isAuthenticated - Whether the user is currently authenticated
 */
interface FloatingAIWidgetProps {
    isAuthenticated: boolean;
}

/**
 * FloatingAIWidget - Omnipresent AI assistant floating action button (FAB)
 * 
 * Provides a floating AI assistant button that appears in the bottom-right corner of the screen.
 * Features auto-hide on scroll down and reappear on scroll up for better UX.
 * When clicked, opens an overlay chat panel with the AI assistant.
 * Automatically provides page context to the AI based on the current route.
 * 
 * @param {FloatingAIWidgetProps} props - Component props
 * @returns {JSX.Element} The floating AI widget with FAB and overlay chat
 * 
 * @example
 * <FloatingAIWidget isAuthenticated={!!user} />
 */
export const FloatingAIWidget: React.FC<FloatingAIWidgetProps> = ({ isAuthenticated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();
    const { activeBoard } = useCRM();

    // Auto-hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Hide when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Get page context for AI
    const getPageContext = () => {
        const path = location.pathname;

        if (path.includes('/boards')) return { page: 'Boards', context: 'Gestão de Kanban e Pipelines' };
        if (path.includes('/contacts')) return { page: 'Contatos', context: 'Gestão de Contatos e Empresas' };
        if (path.includes('/qrdagua')) return { page: 'QR d\'água', context: 'Criação de QR Codes e Microsites' };
        if (path.includes('/prompt-lab')) return { page: 'Prompt Lab', context: 'Otimização de Prompts com IA' };
        if (path.includes('/dashboard')) return { page: 'Dashboard', context: 'Visão Geral do CRM' };
        if (path.includes('/inbox')) return { page: 'Inbox', context: 'Caixa de Entrada' };
        if (path.includes('/reports')) return { page: 'Relatórios', context: 'Análises e Métricas' };
        if (path.includes('/settings')) return { page: 'Configurações', context: 'Configurações do Sistema' };

        return { page: 'Hub', context: 'Navegação Geral' };
    };

    const pageContext = getPageContext();

    // Listen for custom event to open widget programmatically
    useEffect(() => {
        const handleOpenWidget = (e: Event) => {
            setIsOpen(true);
        };

        window.addEventListener('openAIWidget', handleOpenWidget);
        return () => window.removeEventListener('openAIWidget', handleOpenWidget);
    }, []);

    return (
        <>
            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed z-40 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
                    } ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                    }`}
                style={{
                    bottom: '24px',
                    right: '24px',
                }}
                aria-label="Abrir AI Flow"
            >
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary-900 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>

                    {/* Button - Glass/Transparent */}
                    <div className="relative w-14 h-14 md:w-16 md:h-16 bg-acai-900/80 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 ring-4 ring-primary-900/20 border border-white/10">
                        <Sparkles className="w-7 h-7 md:w-8 md:h-8" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        AI Flow
                        <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 dark:bg-white transform rotate-45 -mt-1"></div>
                    </div>
                </div>
            </button>

            {/* Overlay Chat */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Chat Container - Fixed positioning */}
                    <div
                        className="fixed z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
                        style={{
                            bottom: '24px',
                            right: '24px',
                            width: window.innerWidth < 768 ? '100vw' : '400px',
                            height: window.innerWidth < 768 ? '100vh' : '600px',
                            maxHeight: window.innerWidth < 768 ? '100vh' : 'calc(100vh - 48px)',
                        }}
                    >
                        <div className="h-full bg-neutral-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-900 to-acai-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">AI Flow</h3>
                                        <p className="text-xs text-white/80">{pageContext.page}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    aria-label="Fechar"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* AI Assistant Content */}
                            <div className="flex-1 overflow-hidden">
                                <AIAssistant
                                    isOpen={true}
                                    onClose={() => setIsOpen(false)}
                                    variant="floating"
                                    activeBoard={activeBoard}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
