import React, { useState } from 'react';
import { DealView, BoardStage } from '@/types';
import { useCRM } from '@/context/CRMContext';
import { ChevronDown, ChevronRight, DollarSign, Calendar, User, Tag } from 'lucide-react';
import { isDealRotting, getActivityStatus } from '@/features/boards/hooks/useBoardsController';
import { useTranslation } from '@/hooks/useTranslation';

interface MobileKanbanViewProps {
  stages: BoardStage[];
  filteredDeals: DealView[];
  setSelectedDealId: (id: string | null) => void;
  onStatusChange: (dealId: string, newStatus: string) => void;
}

export const MobileKanbanView: React.FC<MobileKanbanViewProps> = ({
  stages,
  filteredDeals,
  setSelectedDealId,
  onStatusChange,
}) => {
  const { lifecycleStages } = useCRM();
  const { t } = useTranslation();
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);
  const [changingStatusDealId, setChangingStatusDealId] = useState<string | null>(null);

  const handleStatusChange = async (dealId: string, newStatus: string) => {
    setChangingStatusDealId(null);
    onStatusChange(dealId, newStatus);
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || 'bg-slate-500';
  };

  const getStageLabel = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.label || 'Unknown';
  };

  return (
    <div className="flex flex-col gap-3 p-4 pb-20">
      {/* Header Stats */}
      <div className="bg-white dark:bg-rionegro-900 rounded-xl p-4 shadow-lg border border-solimoes-400/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Deals</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredDeals.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pipeline Value</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ${filteredDeals.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-rionegro-900 rounded-xl border border-dashed border-slate-300 dark:border-rionegro-700">
          <p className="text-slate-600 dark:text-slate-400">{t('noDeals')}</p>
        </div>
      ) : (
        filteredDeals.map((deal) => {
          const isExpanded = expandedDealId === deal.id;
          const isChangingStatus = changingStatusDealId === deal.id;
          const isRotting = isDealRotting(deal);
          const activityStatus = getActivityStatus(deal);

          return (
            <div
              key={deal.id}
              className={`bg-white dark:bg-rionegro-900 rounded-xl shadow-lg border transition-all ${isRotting
                ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10'
                : 'border-solimoes-400/20'
                }`}
            >
              {/* Deal Header - Always Visible */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedDealId(isExpanded ? null : deal.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                      {deal.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {deal.companyName}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-rionegro-800 rounded-lg transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStageColor(deal.status)}`}>
                    {getStageLabel(deal.status)}
                  </span>
                  {deal.priority && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${deal.priority === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        : deal.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                    >
                      {deal.priority === 'high' ? '🔥 Alta' : deal.priority === 'medium' ? '⚡ Média' : '📌 Baixa'}
                    </span>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-mono font-semibold">${deal.value.toLocaleString()}</span>
                  </div>
                  {deal.nextActivity && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className={deal.nextActivity.isOverdue ? 'text-red-500 font-semibold' : ''}>
                        {new Date(deal.nextActivity.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-200 dark:border-rionegro-800 pt-4 space-y-4">
                  {/* Contact Info */}
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('contact')}</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900 dark:text-white">{deal.contactName}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">{deal.contactEmail}</p>
                  </div>

                  {/* Tags */}
                  {deal.tags && deal.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('tags')}</p>
                      <div className="flex flex-wrap gap-2">
                        {deal.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 dark:bg-rionegro-800 text-xs rounded-full text-slate-700 dark:text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Summary */}
                  {deal.aiSummary && (
                    <div className="bg-acai-900/10 dark:bg-acai-900/20 border border-acai-900/20 rounded-lg p-3">
                      <p className="text-xs text-acai-900 dark:text-acai-400 font-semibold mb-1">{t('aiInsights')}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{deal.aiSummary}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDealId(deal.id);
                      }}
                      className="flex-1 px-4 py-2 bg-acai-900 text-white rounded-lg font-semibold hover:bg-acai-800 transition-colors"
                    >
                      {t('viewDetails')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChangingStatusDealId(isChangingStatus ? null : deal.id);
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-rionegro-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-rionegro-700 transition-colors"
                    >
                      {t('changeStatus')}
                    </button>
                  </div>

                  {/* Status Change Dropdown */}
                  {isChangingStatus && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-rionegro-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t('selectNewStatus')}</p>
                      {stages.map((stage) => (
                        <button
                          key={stage.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(deal.id, stage.id);
                          }}
                          disabled={stage.id === deal.status}
                          className={`w-full px-4 py-3 rounded-lg font-semibold text-left transition-all ${stage.id === deal.status
                            ? 'bg-slate-100 dark:bg-rionegro-800 text-slate-400 cursor-not-allowed'
                            : 'bg-white dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 hover:border-acai-900 dark:hover:border-acai-700 text-slate-900 dark:text-white'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                            <span>{stage.label}</span>
                            {stage.id === deal.status && (
                              <span className="ml-auto text-xs text-slate-400">({t('currentStatus')})</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
