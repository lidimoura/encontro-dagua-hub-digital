import React, { useState } from 'react';
import { Board } from '@/types';
import { Brain, Target, MessageSquare } from 'lucide-react';
import { BoardStrategyHeader } from './Kanban/BoardStrategyHeader';
import { InsightsPanel } from './InsightsPanel';

interface BoardTabsProps {
    board: Board;
}

import { useLanguage } from '@/context/LanguageContext';

export const BoardTabs: React.FC<BoardTabsProps> = ({ board }) => {
    const [activeTab, setActiveTab] = useState<'strategy' | 'insights'>('strategy');
    const { t } = useLanguage();

    return (
        <div className="mb-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('strategy')}
                    className={`px-4 py-2 font-semibold text-sm transition-all relative ${activeTab === 'strategy'
                        ? 'text-acai-900 dark:text-acai-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>{t('strategy') || 'Strategy'}</span>
                    </div>
                    {activeTab === 'strategy' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-acai-900 dark:bg-acai-400" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('insights')}
                    className={`px-4 py-2 font-semibold text-sm transition-all relative ${activeTab === 'insights'
                        ? 'text-acai-900 dark:text-acai-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        <span>Insights (AI)</span>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs rounded-full font-bold">
                            {t('new') || 'NEW'}
                        </span>
                    </div>
                    {activeTab === 'insights' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-acai-900 dark:bg-acai-400" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'strategy' ? (
                <BoardStrategyHeader board={board} />
            ) : (
                <InsightsPanel boardId={board.id} />
            )}
        </div>
    );
};
