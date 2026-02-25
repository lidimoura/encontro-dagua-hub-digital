import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDealsView, useCreateDeal, useUpdateDealStatus } from '@/lib/query/hooks/useDealsQuery';
import { KanbanBoard } from './components/KanbanBoard';
import { DealForm } from './components/DealForm';
import { DealView, DealStatus } from '@/types';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const DealsPage: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    // Data Fetching
    const { data: deals = [], isLoading } = useDealsView();
    const createDealMutation = useCreateDeal();
    const updateStatusMutation = useUpdateDealStatus();

    // Local State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingDeal, setEditingDeal] = useState<DealView | null>(null);

    // Handlers
    const handleCreateDeal = (data: any) => {
        createDealMutation.mutate(
            { ...data, boardId: 'default-sales' }, // Default board
            {
                onSuccess: () => {
                    showToast(t('savedSuccess') || 'Negócio criado!', 'success');
                    setIsFormOpen(false);
                    setEditingDeal(null);
                },
            }
        );
    };

    const handleMoveDeal = (dealId: string, newStatus: string) => {
        updateStatusMutation.mutate(
            { id: dealId, status: newStatus },
            {
                onSuccess: () => {
                    showToast('Status atualizado', 'info');
                },
            }
        );
    };

    const handleDealClick = (deal: DealView) => {
        // For now, simpler implementation: just edit (Restoration Phase)
        // In future: Open detailed drawer
        setEditingDeal(deal);
        setIsFormOpen(true);
    };

    // Filter Logic
    const filteredDeals = deals.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                        {t('salesPipeline')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {deals.length} {t('totalDeals')} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deals.reduce((acc, d) => acc + d.value, 0))} {t('pipelineValue')}
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 text-sm"
                        />
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={() => {
                            setEditingDeal(null);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                    >
                        <Plus size={18} />
                        {t('newDeal')}
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    deals={filteredDeals}
                    onDealMove={handleMoveDeal}
                    onDealClick={handleDealClick}
                />
            </div>

            {/* Deal Form Modal */}
            {isFormOpen && (
                <DealForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleCreateDeal}
                    initialData={editingDeal}
                />
            )}
        </div>
    );
};
