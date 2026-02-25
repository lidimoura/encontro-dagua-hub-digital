
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Inner component to use hooks
const ErrorFallback: React.FC<{ error: Error | null; reset: () => void }> = ({ error, reset }) => {
    const { t, language } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {language === 'pt'
                        ? "Opa, estamos recalibrando este módulo."
                        : "Opss, we are recalibrating this module."}
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {language === 'pt'
                        ? "A equipe técnica foi notificada. Tente recarregar a página."
                        : "The technical team has been notified. Please try reloading the page."}
                </p>

                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                    <RefreshCw size={18} />
                    {language === 'pt' ? "Recarregar Página" : "Reload Page"}
                </button>

                {process.env.NODE_ENV === 'development' && error && (
                    <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-900 rounded text-left overflow-auto max-h-40 text-xs font-mono text-red-600 dark:text-red-400">
                        {error.toString()}
                    </div>
                )}
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
        console.error('Uncaught error:', error, errorInfo);

        // Log to Supabase
        this.logErrorToSupabase(error, errorInfo);
    }

    private async logErrorToSupabase(error: Error, errorInfo: ErrorInfo) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from('system_logs').insert({
                level: 'ERROR',
                message: error.message,
                details: {
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                },
                user_id: user?.id,
                created_at: new Date().toISOString()
            });
        } catch (err) {
            console.error('Failed to log error to Supabase:', err);
        }
    }

    public handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} reset={this.handleReset} />;
        }

        return this.props.children;
    }
}
