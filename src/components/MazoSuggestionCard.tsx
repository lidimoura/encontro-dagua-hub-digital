import React from 'react';
import { Sparkles } from 'lucide-react';

interface MazoSuggestionCardProps {
    contactName: string;
    onAccept: () => void;
    onDismiss: () => void;
}

export const MazoSuggestionCard: React.FC<MazoSuggestionCardProps> = ({
    contactName,
    onAccept,
    onDismiss,
}) => {
    return (
        <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 dark:from-fuchsia-900/20 dark:to-purple-900/20 border border-fuchsia-200 dark:border-fuchsia-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
                {/* Mazô Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-bold text-fuchsia-900 dark:text-fuchsia-300">
                            Mazô sugere:
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 rounded-full font-medium">
                            CS Copilot
                        </span>
                    </div>

                    {/* Suggestion Text */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        Lidi, precisamos fazer o onboarding de <strong>{contactName}</strong>. Vamos enviar o convite?
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={onAccept}
                            className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all shadow-md"
                        >
                            ✨ Aceitar Sugestão
                        </button>
                        <button
                            onClick={onDismiss}
                            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                        >
                            Depois
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
