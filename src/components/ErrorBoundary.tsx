
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase/client';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { sendNexusAlert } from '@/lib/nexusWebhook';

interface Props {
    children: ReactNode;
    /** Label shown in error card (e.g. "AI Hub", "Deal Card") */
    context?: string;
    /** Inline compact fallback for small areas (cards, sidebars) */
    compact?: boolean;
    /** Override entire fallback UI */
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Inner component to use hooks
const ErrorFallback: React.FC<{
    error: Error | null;
    reset: () => void;
    context?: string;
    compact?: boolean;
}> = ({ error, reset, context, compact }) => {
    const { language } = useTranslation();

    // Compact inline fallback (for cards/modals/small areas)
    if (compact) {
        return (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle size={15} className="shrink-0" />
                <span className="flex-1">
                    {context || (language === 'pt' ? 'Componente' : 'Component')} —{' '}
                    {language === 'pt' ? 'erro ao carregar' : 'failed to load'}
                </span>
                <button
                    onClick={reset}
                    className="shrink-0 font-medium underline hover:no-underline"
                >
                    {language === 'pt' ? 'Tentar novamente' : 'Retry'}
                </button>
            </div>
        );
    }

    // Full-page fallback
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-700/40 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {language === 'pt'
                        ? `${context ? `${context} — ` : ''}Ops, encontramos um problema.`
                        : `${context ? `${context} — ` : ''}Something went wrong.`}
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                    {language === 'pt'
                        ? 'A equipe foi notificada. Tente recarregar esta seção ou volte ao Dashboard.'
                        : 'The team has been notified. Try reloading this section or return to the Dashboard.'}
                </p>

                {/* Dev: show error detail */}
                {import.meta.env.DEV && error && (
                    <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-900 rounded text-left overflow-auto max-h-40 text-xs font-mono text-red-600 dark:text-red-400 border border-slate-200 dark:border-white/10">
                        {error.message}
                        {error.stack && (
                            <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap">
                                {error.stack.split('\n').slice(0, 6).join('\n')}
                            </pre>
                        )}
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary-600/20"
                    >
                        <RefreshCw size={16} />
                        {language === 'pt' ? 'Recarregar seção' : 'Reload section'}
                    </button>
                    <button
                        onClick={() => { window.location.href = '/dashboard'; }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                    >
                        <Home size={16} />
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary:${this.props.context || 'unknown'}]`, error.message);

        // Log to Supabase
        this.logErrorToSupabase(error, errorInfo);

        // Fire to Agility OS Nexus Bridge
        sendNexusAlert({
            error_message: error.message,
            stack_trace: error.stack,
            component_context: `ErrorBoundary[${this.props.context ?? 'unknown'}] → ${errorInfo.componentStack?.slice(0, 300) ?? ''}`,
            app_state: {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
            },
        });
    }

    private async logErrorToSupabase(error: Error, errorInfo: ErrorInfo) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('system_logs').insert({
                level: 'ERROR',
                message: `[${this.props.context ?? 'ErrorBoundary'}] ${error.message}`,
                details: {
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                },
                user_id: user?.id,
                created_at: new Date().toISOString()
            });
        } catch {
            // Silently fail — don't cascade
        }
    }

    public handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        const { hasError, error } = this.state;
        const { children, fallback, context, compact } = this.props;

        if (!hasError) return children;
        if (fallback) return <>{fallback}</>;

        return (
            <ErrorFallback
                error={error}
                reset={this.handleReset}
                context={context}
                compact={compact}
            />
        );
    }
}

/** HOC: wraps any component with ErrorBoundary */
export function withErrorBoundary<P extends object>(
    Comp: React.ComponentType<P>,
    context?: string,
    compact?: boolean
) {
    return function Wrapped(props: P) {
        return (
            <ErrorBoundary context={context} compact={compact}>
                <Comp {...props} />
            </ErrorBoundary>
        );
    };
}
