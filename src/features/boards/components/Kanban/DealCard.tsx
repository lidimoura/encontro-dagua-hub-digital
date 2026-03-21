import React, { useState } from 'react';
import { DealView, DealStatus } from '@/types';
import { Building2, Hourglass, QrCode, Scan } from 'lucide-react';
import { ActivityStatusIcon } from './ActivityStatusIcon';
import { useTranslation } from '@/hooks/useTranslation';
import { useClientQREngagement } from '@/lib/query/hooks/useContactsQuery';
import { useCRM } from '@/context/CRMContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase/client';

interface DealCardProps {
  deal: DealView;
  isRotting: boolean;
  activityStatus: string;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onQuickAddActivity: (
    dealId: string,
    type: 'CALL' | 'MEETING' | 'EMAIL',
    dealTitle: string
  ) => void;
  setLastMouseDownDealId: (id: string | null) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  isRotting,
  activityStatus,
  isDragging,
  onDragStart,
  onClick,
  openMenuId,
  setOpenMenuId,
  onQuickAddActivity,
  setLastMouseDownDealId,
}) => {
  const [localDragging, setLocalDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { t } = useTranslation();
  const { moveDeal, boards } = useCRM();
  const { addToast } = useToast();

  // Cross-app analytics: fetch QR engagement for this deal's contact email
  const { data: qrEngagement } = useClientQREngagement(deal.contactEmail || undefined);

  const handleQuickConvert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deal.contactId || isConverting) return;
    setIsConverting(true);

    try {
      const { data, error } = await supabase.rpc('convert_lead_to_client', {
        p_deal_id: deal.id,
        p_contact_id: deal.contactId,
      });
      if (error) throw error;
      
      const onboardingBoard = boards.find(b =>
        ['ONBOARDING', 'CUSTOMER', 'CLIENTE'].some(kw =>
          (b.name || '').toUpperCase().includes(kw)
        )
      );
      if (onboardingBoard && onboardingBoard.stages?.length > 0) {
        addToast('✅ Lead convertido e espelhado no Onboarding!', 'success');
      } else {
        moveDeal(deal.id, DealStatus.CLOSED_WON);
        addToast('✅ Lead convertido para cliente (Ganho)!', 'success');
      }
    } catch (err) {
      moveDeal(deal.id, DealStatus.CLOSED_WON);
      addToast('✅ Lead foi marcado como Ganho.', 'success');
    } finally {
      setIsConverting(false);
    }
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Auto-promote ghost cards instead of opening the quick-add menu
    if (deal.id.startsWith('auto-')) {
      onClick();
      return;
    }
    setOpenMenuId(openMenuId === deal.id ? null : deal.id);
  };

  const handleQuickAdd = (type: 'CALL' | 'MEETING' | 'EMAIL') => {
    onQuickAddActivity(deal.id, type, deal.title);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setLocalDragging(true);
    e.dataTransfer.setData('dealId', deal.id);
    e.dataTransfer.effectAllowed = 'move';
    setLastMouseDownDealId(deal.id);
    onDragStart(e, deal.id);
  };

  const handleDragEnd = () => {
    setLocalDragging(false);
    setLastMouseDownDealId(null);
  };

  const hasEngagement = qrEngagement && qrEngagement.totalProjects > 0;

  return (
    <div
      data-deal-id={deal.id}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={e => {
        // Ignore clicks that bubbled from buttons (quick add menu triggers)
        if ((e.target as HTMLElement).closest('button')) return;
        // Do not open modal if we are in the middle of a drag
        if (localDragging) return;
        onClick();
      }}
      className={`
                p-3 rounded-lg border-l-4 border-y border-r border-slate-200 dark:border-slate-700/50
                shadow-sm cursor-grab active:cursor-grabbing group hover:shadow-md transition-all relative select-none
                ${localDragging || isDragging ? 'bg-green-100 dark:bg-green-900 opacity-50 rotate-2 scale-95' : 'bg-white dark:bg-slate-800 opacity-100'}
                ${isRotting ? 'opacity-80 saturate-50 border-dashed' : ''}
            `}
      style={{
        borderLeftColor:
          deal.priority === 'high' ? '#ef4444' : deal.priority === 'medium' ? '#f59e0b' : '#3b82f6',
      }}
    >
      {isRotting && (
        <div
          className="absolute -top-2 -right-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 p-1 rounded-full shadow-sm z-10"
          title={t('dealStale')}
        >
          <Hourglass size={12} />
        </div>
      )}

      <div className="flex gap-1 mb-2 flex-wrap items-center">
        {deal.source && deal.source.trim() !== '' && deal.source !== 'Desconhecido' && (() => {
          const isSdr = deal.source === 'Amazô SDR';
          const isHub = deal.source === 'Hub LP';
          return (
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide border ${isSdr
                ? 'bg-blue-900/80 text-blue-200 border-blue-700/60'
                : isHub
                  ? 'bg-emerald-800/60 text-emerald-200 border-emerald-700/50'
                  : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
              }`}>
              {isSdr ? '🤖 SDR' : isHub ? '🌐 LP' : deal.source}
            </span>
          );
        })()}
        {deal.tags.slice(0, 2).map(tag => (
          <span
            key={tag}
            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5"
          >
            {tag}
          </span>
        ))}
      </div>

      <h4
        className={`text-sm font-bold font-display leading-snug mb-0.5 ${isRotting ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}
      >
        {deal.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
        <Building2 size={10} /> {deal?.companyName || 'Sem empresa'}
      </p>

      {/* Cross-App QR Engagement Badge */}
      {hasEngagement && (
        <div
          className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/40"
          title={`${qrEngagement!.qrCodesCount} projeto(s) CRM + ${qrEngagement!.qrLinksCount} projeto(s) Link D'Água`}
        >
          <QrCode size={10} className="text-purple-500 dark:text-purple-400 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300">
            {qrEngagement!.totalProjects} projeto{qrEngagement!.totalProjects !== 1 ? 's' : ''}
          </span>
          {qrEngagement!.totalScans > 0 && (
            <>
              <span className="text-[10px] text-purple-400 dark:text-purple-500">·</span>
              <Scan size={9} className="text-purple-500 dark:text-purple-400 flex-shrink-0" />
              <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                {qrEngagement!.totalScans} scan{qrEngagement!.totalScans !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          {deal.owner && deal.owner.avatar && (
            <img
              src={deal.owner.avatar}
              alt={deal.owner.name}
              className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-slate-800"
              title={deal.owner.name}
            />
          )}
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
            ${deal.value.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center">
          {deal.status !== 'CUSTOMER' && deal.status !== DealStatus.CLOSED_WON && deal.contactId && (deal.source?.toLowerCase().includes('link d\'água') || deal.source?.toLowerCase().includes('amazo') || deal.source?.toLowerCase().includes('webhook')) && (
            <button
              onClick={handleQuickConvert}
              disabled={isConverting}
              className={`mr-2 flex items-center justify-center w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors ${isConverting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Converter rapidamente este Lead"
            >
              <Building2 size={12} />
            </button>
          )}
          <ActivityStatusIcon
            status={activityStatus}
            type={deal.nextActivity?.type}
            dealId={deal.id}
            dealTitle={deal.title}
            isOpen={openMenuId === deal.id}
            onToggle={handleToggleMenu}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      </div>
    </div>
  );
};
