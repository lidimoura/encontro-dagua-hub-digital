import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { DealView, DealStatus, DEFAULT_BOARD_STAGES } from '@/types';
import { Plus, MoreHorizontal, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
    deals: DealView[];
    onDealMove: (dealId: string, newStatus: string) => void;
    onDealClick: (deal: DealView) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    deals,
    onDealMove,
    onDealClick,
}) => {
    const { t } = useTranslation();
    const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

    // Group deals by status
    const columns = DEFAULT_BOARD_STAGES.map(stage => ({
        ...stage,
        deals: deals.filter(d => d.status === stage.id),
        totalValue: deals
            .filter(d => d.status === stage.id)
            .reduce((sum, d) => sum + d.value, 0),
    }));

    const handleDragStart = (e: React.DragEvent, dealId: string) => {
        setDraggedDealId(dealId);
        e.dataTransfer.effectAllowed = 'move';
        // Transparent ghost image could be set here
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        if (draggedDealId) {
            onDealMove(draggedDealId, targetStatus);
            setDraggedDealId(null);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="flex h-full overflow-x-auto gap-4 pb-4 select-none">
            {columns.map(column => (
                <div
                    key={column.id}
                    className="flex-shrink-0 w-80 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex flex-col max-h-full border border-slate-200 dark:border-slate-800"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column Header */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900 rounded-t-xl sticky top-0 z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: column.color }}
                                />
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
                                    {t(column.id.toLowerCase()) || column.label}
                                </h3>
                                <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    {column.deals.length}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-5">
                                {formatCurrency(column.totalValue)}
                            </p>
                        </div>
                        {/* Optional: Add Column Action Menu */}
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    {/* Deals List */}
                    <div className="p-2 flex-1 overflow-y-auto space-y-2 min-h-[150px]">
                        {column.deals.map(deal => (
                            <div
                                key={deal.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, deal.id)}
                                onClick={() => onDealClick(deal)}
                                className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${draggedDealId === deal.id ? 'opacity-50' : ''
                                    }`}
                            >
                                {/* Priority Tag */}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${deal.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' :
                                            deal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10' :
                                                'bg-blue-100 text-blue-600 dark:bg-blue-500/10'
                                        }`}>
                                        {t(deal.priority)}
                                    </span>
                                    {/* Stalled Warning */}
                                    {deal.lastStageChangeDate && new Date(deal.lastStageChangeDate) < new Date(Date.now() - 10 * 86400000) && (
                                        <div className="text-amber-500" title={t('dealStale')}>
                                            <AlertCircle size={14} />
                                        </div>
                                    )}
                                </div>

                                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {deal.title}
                                </h4>

                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
                                    {deal.companyName}
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2">
                                    <div className="flex items-center gap-1">
                                        <DollarSign size={12} />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(deal.value)}
                                        </span>
                                    </div>

                                    {deal.owner?.avatar && (
                                        <img
                                            src={deal.owner.avatar}
                                            alt={deal.owner.name}
                                            className="w-5 h-5 rounded-full border border-white dark:border-slate-700"
                                            title={deal.owner.name}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Drop Zone Placeholder (visual cue) */}
                        {column.deals.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-8 opacity-50">
                                <span className="mb-1">{t('dropHere')}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
