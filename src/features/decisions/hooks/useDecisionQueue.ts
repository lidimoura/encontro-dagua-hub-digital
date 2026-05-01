/**
 * useDecisionQueue Hook
 * Hook principal para gerenciar a fila de decisões
 */

import { useState, useCallback, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { useToast } from '@/context/ToastContext';
import { Decision, DecisionStats, SuggestedAction, ActionPayload } from '../types';
import decisionQueueService from '../services/decisionQueueService';
import { runAllAnalyzers } from '../analyzers';

export function useDecisionQueue() {
  const { deals, activities, addActivity, updateActivity, updateDeal } = useCRM();
  const { addToast } = useToast();
  
  const [decisions, setDecisions] = useState<Decision[]>(() => 
    decisionQueueService.getPendingDecisions()
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set());
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | undefined>(
    decisionQueueService.getLastAnalyzedAt()
  );

  // Refresh decisions from storage
  const refreshDecisions = useCallback(() => {
    setDecisions(decisionQueueService.getPendingDecisions());
    setLastAnalyzedAt(decisionQueueService.getLastAnalyzedAt());
  }, []);

  // Calculate stats
  const stats: DecisionStats = useMemo(() => {
    return decisionQueueService.getStats();
  }, [decisions]);

  // Run all analyzers
  const runAnalyzers = useCallback(async () => {
    if (deals.length === 0 && activities.length === 0) {
      addToast('Sem dados no CRM para analisar. Adicione deals ou atividades primeiro.', 'info' as any);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await runAllAnalyzers(deals, activities);
      refreshDecisions();

      // Feedback ao usuário (resolve o "botão não faz nada")
      if (result.addedDecisions === 0) {
        addToast(
          `✅ Análise concluída. Nenhum item urgente encontrado em ${deals.length} deals e ${activities.length} atividades.`,
          'success'
        );
      } else {
        addToast(
          `⚡ ${result.addedDecisions} nova(s) decisão(es) encontrada(s)! Revise abaixo.`,
          'success'
        );
      }

      return result;
    } catch (err: any) {
      addToast(`Erro na análise: ${err?.message || 'Tente novamente.'}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [deals, activities, refreshDecisions, addToast]);

  // Execute action based on type
  const executeAction = useCallback(async (
    action: SuggestedAction,
    decision: Decision
  ): Promise<boolean> => {
    const { type, payload } = action;
    console.log('[executeAction] Starting:', { type, payload, decision });

    try {
      switch (type) {
        case 'create_activity':
        case 'schedule_call':
        case 'schedule_meeting': {
          console.log('[executeAction] Creating activity...', payload);
          if (payload.activityTitle && payload.activityDate) {
            const newActivity = {
              id: crypto.randomUUID(),
              dealId: payload.dealId || decision.dealId || '',
              dealTitle: '',  // Will be filled by context
              type: payload.activityType || 'TASK',
              title: payload.activityTitle,
              description: payload.activityDescription,
              date: payload.activityDate,
              user: { name: 'Você', avatar: '' },
              completed: false,
            };
            console.log('[executeAction] New activity object:', newActivity);
            addActivity(newActivity);
            console.log('[executeAction] Activity added successfully');
            return true;
          }
          console.log('[executeAction] Missing activityTitle or activityDate');
          break;
        }

        case 'move_deal': {
          console.log('[executeAction] Moving deal...', decision.dealId, payload.newStage);
          if (decision.dealId && payload.newStage) {
            updateDeal(decision.dealId, { status: payload.newStage as any });
            console.log('[executeAction] Deal moved successfully');
            return true;
          }
          console.log('[executeAction] Missing dealId or newStage');
          break;
        }

        case 'dismiss': {
          // "Marcar como Feita" - marca a atividade original como concluída
          console.log('[executeAction] Dismissing/completing activity:', decision.activityId);
          if (decision.activityId) {
            updateActivity(decision.activityId, { completed: true });
            console.log('[executeAction] Activity marked as completed');
          }
          return true;
        }

        case 'send_message': {
          console.log('[executeAction] Sending message:', payload.channel, payload.recipient);
          // Abre WhatsApp Web com a mensagem pré-preenchida
          if (payload.channel === 'whatsapp' && payload.messageTemplate) {
            const message = encodeURIComponent(payload.messageTemplate);
            // Se tiver número de telefone, usa; senão abre só com a mensagem
            const phone = payload.recipient?.replace(/\D/g, '') || '';
            const url = phone 
              ? `https://wa.me/${phone}?text=${message}`
              : `https://wa.me/?text=${message}`;
            console.log('[executeAction] Opening WhatsApp:', url);
            window.open(url, '_blank');
            return true;
          }
          
          // Para email, abre o cliente de email
          if (payload.channel === 'email' && payload.recipient) {
            const subject = encodeURIComponent(`Follow-up`);
            const body = encodeURIComponent(payload.messageTemplate || '');
            const url = `mailto:${payload.recipient}?subject=${subject}&body=${body}`;
            console.log('[executeAction] Opening email:', url);
            window.open(url, '_blank');
            return true;
          }
          
          return true;
        }

        default:
          console.warn(`Unknown action type: ${type}`);
          return false;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return false;
    }

    return false;
  }, [addActivity, updateDeal, updateActivity]);

  // Approve a decision
  const approveDecision = useCallback(async (
    id: string,
    action?: SuggestedAction
  ) => {
    const decision = decisions.find(d => d.id === id);
    if (!decision) {
      console.error('[DecisionQueue] Decision not found:', id);
      return;
    }

    setExecutingIds(prev => new Set(prev).add(id));

    try {
      const actionToExecute = action || decision.suggestedAction;
      console.log('[DecisionQueue] Executing action:', actionToExecute.type, actionToExecute.payload);
      
      const success = await executeAction(actionToExecute, decision);
      console.log('[DecisionQueue] Action result:', success);

      if (success) {
        decisionQueueService.updateDecisionStatus(id, 'approved');
        refreshDecisions();
      }
    } catch (error) {
      console.error('[DecisionQueue] Error approving decision:', error);
    } finally {
      setExecutingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [decisions, executeAction, refreshDecisions]);

  // Reject a decision
  const rejectDecision = useCallback((id: string) => {
    decisionQueueService.rejectDecision(id);
    refreshDecisions();
  }, [refreshDecisions]);

  // Snooze a decision (default: 1 day)
  const snoozeDecision = useCallback((id: string, hours: number = 24) => {
    const until = new Date();
    until.setHours(until.getHours() + hours);
    decisionQueueService.snoozeDecision(id, until);
    refreshDecisions();
  }, [refreshDecisions]);

  // Approve all pending decisions
  const approveAll = useCallback(async () => {
    const pendingIds = decisions.map(d => d.id);
    
    for (const id of pendingIds) {
      await approveDecision(id);
    }
  }, [decisions, approveDecision]);

  // Clear all decisions
  const clearAll = useCallback(() => {
    decisionQueueService.clearAll();
    refreshDecisions();
  }, [refreshDecisions]);

  return {
    // Data
    decisions,
    stats,
    lastAnalyzedAt,
    
    // State
    isAnalyzing,
    executingIds,
    
    // Actions
    runAnalyzers,
    approveDecision,
    rejectDecision,
    snoozeDecision,
    approveAll,
    clearAll,
    refreshDecisions,
  };
}

export default useDecisionQueue;
