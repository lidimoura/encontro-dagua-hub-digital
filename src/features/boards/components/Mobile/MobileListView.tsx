import React from 'react';
import { Phone, Mail, DollarSign, Calendar, Edit2, Trash2, ArrowRight, ChevronRight } from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    value: number;
    contact_id?: string;
    stage_id: string;
    priority?: string;
    created_at: string;
}

interface Stage {
    id: string;
    name: string;
    color: string;
}

interface MobileListViewProps {
    deals: Deal[];
    stages: Stage[];
    onEdit: (dealId: string) => void;
    onDelete: (dealId: string) => void;
    onMove: (dealId: string, newStageId: string) => void;
}

export const MobileListView: React.FC<MobileListViewProps> = ({
    deals,
    stages,
    onEdit,
    onDelete,
    onMove,
}) => {
    const getStageById = (stageId: string) => {
        return stages.find(s => s.id === stageId);
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="w-full space-y-4 pb-20">
            {/* Mobile Header */}
            <div className="sticky top-0 bg-white dark:bg-rionegro-950 z-10 pb-4 border-b border-slate-200 dark:border-rionegro-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Negócios ({deals.length})
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Toque para editar ou arraste para mover
                </p>
            </div>

            {/* Deals List */}
            {deals.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">
                        Nenhum negócio encontrado
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {deals.map(deal => {
                        const stage = getStageById(deal.stage_id);
                        return (
                            <div
                                key={deal.id}
                                className="bg-white dark:bg-rionegro-900 rounded-lg shadow-md border border-slate-200 dark:border-rionegro-800 overflow-hidden"
                            >
                                {/* Deal Header */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                                {deal.title}
                                            </h3>
                                            {stage && (
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${stage.color}`}
                                                >
                                                    {stage.name}
                                                </span>
                                            )}
                                        </div>
                                        {deal.priority && (
                                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(deal.priority)}`} />
                                        )}
                                    </div>

                                    {/* Deal Value */}
                                    <div className="flex items-center gap-2 text-lg font-bold text-acai-900 dark:text-acai-400 mb-3">
                                        <DollarSign className="w-5 h-5" />
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(deal.value || 0)}
                                    </div>

                                    {/* Deal Date */}
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(deal.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex border-t border-slate-200 dark:border-rionegro-800">
                                    <button
                                        onClick={() => onEdit(deal.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Editar</span>
                                    </button>

                                    <div className="w-px bg-slate-200 dark:bg-rionegro-800" />

                                    <button
                                        onClick={() => {
                                            const nextStageIndex = stages.findIndex(s => s.id === deal.stage_id) + 1;
                                            if (nextStageIndex < stages.length) {
                                                onMove(deal.id, stages[nextStageIndex].id);
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        <span className="text-sm font-medium">Avançar</span>
                                    </button>

                                    <div className="w-px bg-slate-200 dark:bg-rionegro-800" />

                                    <button
                                        onClick={() => onDelete(deal.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Excluir</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
