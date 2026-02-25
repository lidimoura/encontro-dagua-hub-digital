import React, { useState } from 'react';
import { DealView, DealStatus, BoardStage } from '@/types';
import { DealCard } from './DealCard';
import { isDealRotting, getActivityStatus } from '@/features/boards/hooks/useBoardsController';
import { Settings } from 'lucide-react';

import { useCRM } from '@/context/CRMContext';
import { useTranslation } from '@/hooks/useTranslation';

interface KanbanBoardProps {
  stages: BoardStage[];
  filteredDeals: DealView[];
  draggingId: string | null;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, stageId: string) => void;
  setSelectedDealId: (id: string | null) => void;
  openActivityMenuId: string | null;
  setOpenActivityMenuId: (id: string | null) => void;
  handleQuickAddActivity: (
    dealId: string,
    type: 'CALL' | 'MEETING' | 'EMAIL',
    dealTitle: string
  ) => void;
  setLastMouseDownDealId: (id: string | null) => void;
}
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stages,
  filteredDeals,
  draggingId,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setSelectedDealId,
  openActivityMenuId,
  setOpenActivityMenuId,
  handleQuickAddActivity,
  setLastMouseDownDealId,
}) => {
  const { lifecycleStages } = useCRM();
  const { t } = useTranslation();
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-2 w-full">
      {stages.map(stage => {
        const stageDeals = filteredDeals.filter(l => l.status === stage.id);
        const stageValue = stageDeals.reduce((sum, l) => sum + l.value, 0);
        const isOver = dragOverStage === stage.id && draggingId !== null;

        // Resolve linked stage name
        const linkedStageName =
          stage.linkedLifecycleStage && lifecycleStages
            ? lifecycleStages.find(ls => ls.id === stage.linkedLifecycleStage)?.name
            : null;

        return (
          <div
            key={stage.id}
            // ... (keep existing props)
            className={`min-w-[20rem] flex-1 flex flex-col rounded-xl border-2 overflow-visible h-full max-h-full transition-all duration-200
                            ${isOver
                ? 'border-green-500 bg-green-100/20 dark:bg-green-900/30 scale-[1.02] shadow-xl shadow-green-500/30'
                : 'border-slate-200/50 dark:border-white/10 glass'
              }
                        `}
          >
            <div className={`h-1.5 w-full ${stage.color}`}></div>

            <div
              className={`p-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-200 font-display text-sm tracking-wide uppercase">
                  {stage.label}
                </span>
                <span className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                  {stageDeals.length}
                </span>
              </div>

              {/* Automation Indicator - Always rendered for consistent height */}
              <div className="mb-2 flex items-center gap-1.5 min-h-[22px]">
                {linkedStageName ? (
                  <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded border border-primary-100 dark:border-primary-800/50 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-primary-500 animate-pulse"></span>
                    {t('promotesTo')}: {linkedStageName}
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 opacity-0 select-none">
                    -
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-right">
                {t('total')}:{' '}
                <span className="text-slate-900 dark:text-white font-mono">
                  ${stageValue.toLocaleString()}
                </span>
              </div>
            </div>

            <div
              className={`flex-1 p-2 overflow-y-auto space-y-2 bg-slate-100/50 dark:bg-black/20 scrollbar-thin min-h-[100px]`}
            >
              {stageDeals.length === 0 && !draggingId && (
                <button
                  onClick={() => {
                    // Open create deal modal (we'll need to pass this function down)
                    const event = new CustomEvent('openCreateDealModal', {
                      detail: { stageId: stage.id }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group cursor-pointer"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 bg-slate-200 dark:bg-slate-700 group-hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors">
                      <span className="text-2xl text-slate-400 group-hover:text-white transition-colors">+</span>
                    </div>
                    <span className="text-sm text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium transition-colors">
                      {t('addDeal')}
                    </span>
                  </div>
                </button>
              )}
              {isOver && stageDeals.length === 0 && (
                <div className="h-full flex items-center justify-center text-green-500 dark:text-green-400 text-sm py-8 font-bold animate-pulse pointer-events-none">
                  {t('dropHere')}
                </div>
              )}
              {stageDeals.map(deal => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  isRotting={
                    isDealRotting(deal) &&
                    deal.status !== DealStatus.CLOSED_WON &&
                    deal.status !== DealStatus.CLOSED_LOST
                  }
                  activityStatus={getActivityStatus(deal)}
                  isDragging={draggingId === deal.id}
                  onDragStart={handleDragStart}
                  onClick={() => setSelectedDealId(deal.id)}
                  openMenuId={openActivityMenuId}
                  setOpenMenuId={setOpenActivityMenuId}
                  onQuickAddActivity={handleQuickAddActivity}
                  setLastMouseDownDealId={setLastMouseDownDealId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
