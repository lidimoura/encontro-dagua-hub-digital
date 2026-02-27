import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DealView, DealStatus, Board, CustomFieldDefinition } from '@/types';
import {
  useBoards,
  useDefaultBoard,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard,
} from '@/lib/query/hooks/useBoardsQuery';
import {
  useDealsByBoard,
  useUpdateDealStatus,
  useUpdateDeal,
} from '@/lib/query/hooks/useDealsQuery';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import { useCreateActivity } from '@/lib/query/hooks/useActivitiesQuery';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useRealtimeSyncKanban } from '@/lib/realtime';

export const isDealRotting = (deal: DealView) => {
  const dateToCheck = deal.lastStageChangeDate || deal.updatedAt;
  const diff = new Date().getTime() - new Date(dateToCheck).getTime();
  const days = diff / (1000 * 3600 * 24);
  return days > 10;
};

export const getActivityStatus = (deal: DealView) => {
  if (!deal.nextActivity) return 'yellow';
  // Parse if it's stored as a JSON string
  const activity = typeof deal.nextActivity === 'string'
    ? (() => { try { return JSON.parse(deal.nextActivity); } catch { return {}; } })()
    : deal.nextActivity;

  if (activity.isOverdue) return 'red';
  if (!activity.date) return 'gray';

  const activityDate = new Date(activity.date);
  const today = new Date();
  if (activityDate.toDateString() === today.toDateString()) return 'green';
  return 'gray';
};

export const useBoardsController = () => {
  // TanStack Query hooks - REAL DATABASE CONNECTION ONLY
  const { data: boards = [], isLoading: boardsLoading } = useBoards();
  const { data: defaultBoard } = useDefaultBoard();
  const createBoardMutation = useCreateBoard();
  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();
  const queryClient = useQueryClient();

  // Active board state (persisted)
  const [activeBoardId, setActiveBoardId] = usePersistedState<string | null>(
    'crm_active_board_id',
    null
  );

  // Set default board when boards load
  useEffect(() => {
    if (!activeBoardId && defaultBoard) {
      setActiveBoardId(defaultBoard.id);
    } else if (!activeBoardId && !boardsLoading && boards.length > 0) {
      // If no active board and loading done, set first board
      setActiveBoardId(boards[0].id);
    }
  }, [activeBoardId, defaultBoard, setActiveBoardId, boardsLoading, boards]);

  // Get active board from real database
  const activeBoard = useMemo(() => {
    return boards.find(b => b.id === activeBoardId) || defaultBoard || boards[0] || null;
  }, [boards, activeBoardId, defaultBoard]);

  // Deals for active board - REAL DATABASE ONLY
  const { data: deals = [], isLoading: dealsLoading } = useDealsByBoard(activeBoardId || '');

  const updateDealStatusMutation = useUpdateDealStatus();
  const updateDealMutation = useUpdateDeal();
  const createActivityMutation = useCreateActivity();

  // Enable realtime sync for Kanban
  useRealtimeSyncKanban();

  // Custom field definitions (TODO: migrate to query)
  const customFieldDefinitions: CustomFieldDefinition[] = [];

  //View State
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Interaction State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openActivityMenuId, setOpenActivityMenuId] = useState<string | null>(null);

  // Fallback for drag issues
  const lastMouseDownDealId = React.useRef<string | null>(null);
  const setLastMouseDownDealId = (id: string | null) => {
    lastMouseDownDealId.current = id;
  };

  // Combined loading state
  const isLoading = boardsLoading || dealsLoading;

  useEffect(() => {
    const handleClickOutside = () => setOpenActivityMenuId(null);
    if (openActivityMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openActivityMenuId]);

  // Filtering Logic
  const filteredDeals = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    return deals.filter(l => {
      const matchesSearch =
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOwner =
        ownerFilter === 'all' || (l.owner?.name || '').includes('Thales') || l.owner?.name === 'Eu';

      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && new Date(l.createdAt) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(l.createdAt) <= endDate;
      }

      // RECENT WINS LOGIC:
      // Se estiver Ganho ou Perdido, só mostra se foi atualizado nos últimos 30 dias
      let matchesRecent = true;
      if (l.status === DealStatus.CLOSED_WON || l.status === DealStatus.CLOSED_LOST) {
        const lastUpdate = new Date(l.updatedAt);
        if (lastUpdate < cutoffDate) {
          matchesRecent = false;
        }
      }

      return matchesSearch && matchesOwner && matchesDate && matchesRecent;
    });
  }, [deals, searchTerm, ownerFilter, dateRange]);

  // Helper to synchronously promote a ghost deal to a real deal
  const promoteGhostDeal = async (ghostId: string): Promise<string> => {
    if (!ghostId.startsWith('auto-')) return ghostId;
    const contactId = ghostId.replace('auto-', '');
    const autoDeal = deals.find(d => d.id === ghostId);

    // Create real deal in Supabase
    const { data, error } = await supabase.from('deals')
      .insert({
        title: autoDeal?.title || 'Novo Deal',
        value: autoDeal?.value || 0,
        contact_id: contactId,
        board_id: activeBoardId,
        stage_id: autoDeal?.status || activeBoard?.stages[0]?.id,
        status: autoDeal?.status || activeBoard?.stages[0]?.id,
        priority: 'medium',
        probability: 10,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Error promoting auto-deal:', error);
      return ghostId;
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts.lists() });
    return data.id;
  };

  // Safe Deal Selection (Handles clicks on ghost cards)
  const handleSelectDeal = async (dealId: string | null) => {
    if (!dealId) {
      setSelectedDealId(null);
      return;
    }
    if (dealId.startsWith('auto-')) {
      const realId = await promoteGhostDeal(dealId);
      setSelectedDealId(realId);
    } else {
      setSelectedDealId(dealId);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    console.log('[DnD] Drag started:', id);
    setDraggingId(id);
    e.dataTransfer.setData('dealId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    let dealId = e.dataTransfer.getData('dealId') || lastMouseDownDealId.current;

    if (dealId) {
      // Auto-promote before moving
      if (dealId.startsWith('auto-')) {
        dealId = await promoteGhostDeal(dealId);
      }

      console.log('[DnD] Drop:', { dealId, stageId });
      let lossReason = undefined;
      if (stageId === DealStatus.CLOSED_LOST) {
        const reason = window.prompt(
          'Qual o motivo da perda? (Ex: Preço, Concorrência, Desistência)'
        );
        if (reason) lossReason = reason;
      }

      // Auto-transition logic check
      let finalStatus = stageId;
      let finalBoardId: string | undefined = undefined;

      if (activeBoard && activeBoard.stages && activeBoard.stages.length > 0) {
        const sortedStages = [...activeBoard.stages].sort((a, b) => a.order - b.order);
        const lastStage = sortedStages[sortedStages.length - 1];

        if (stageId === lastStage.id && activeBoard.nextBoardId) {
          const nextBoard = boards.find(b => b.id === activeBoard.nextBoardId);
          if (nextBoard && nextBoard.stages && nextBoard.stages.length > 0) {
            const nextBoardSortedStages = [...nextBoard.stages].sort((a, b) => a.order - b.order);
            const firstStageOfNextBoard = nextBoardSortedStages[0];

            finalStatus = firstStageOfNextBoard.id;
            finalBoardId = nextBoard.id;
          }
        }
      }

      if (finalBoardId) {
        // Deal is moving to a new board! Using updateDeal to change boardId mapping
        updateDealMutation.mutate({ id: dealId, updates: { boardId: finalBoardId, status: finalStatus, lossReason } });
      } else {
        // Regular status update within the same board
        updateDealStatusMutation.mutate({ id: dealId, status: stageId, lossReason });
      }

      // Restore Stage Mapping (Contact status -> Board column)
      const droppedDeal = deals.find(d => d.id === dealId);
      const targetStage = activeBoard?.stages.find(s => s.id === stageId);

      if (droppedDeal && droppedDeal.contactId && targetStage && targetStage.linkedLifecycleStage) {
        const actualContactId = droppedDeal.contactId;
        // Silent background update to sync contact stage
        supabase.from('contacts')
          .update({ stage: targetStage.linkedLifecycleStage })
          .eq('id', actualContactId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating contact stage:', error);
            } else {
              // Invalidate contacts query to refresh UI immediately
              queryClient.invalidateQueries({ queryKey: queryKeys.contacts.lists() });
            }
          });
      }
    }
    setDraggingId(null);
  };

  const handleQuickAddActivity = (
    dealId: string,
    type: 'CALL' | 'MEETING' | 'EMAIL',
    dealTitle: string
  ) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const titles = {
      CALL: 'Ligar para Cliente',
      MEETING: 'Reunião de Acompanhamento',
      EMAIL: 'Enviar Email de Follow-up',
    };

    createActivityMutation.mutate({
      dealId,
      dealTitle,
      type,
      title: titles[type],
      description: 'Agendado via Acesso Rápido',
      date: tomorrow.toISOString(),
      completed: false,
      user: { name: 'Eu', avatar: '' },
    });
    setOpenActivityMenuId(null);
  };

  // Board Management Handlers
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
  };

  const handleCreateBoard = async (boardData: Omit<Board, 'id' | 'createdAt'>) => {
    createBoardMutation.mutate(boardData, {
      onSuccess: newBoard => {
        if (newBoard) {
          setActiveBoardId(newBoard.id);
        }
        setIsCreateBoardModalOpen(false);
        setIsWizardOpen(false);
      },
    });
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setIsCreateBoardModalOpen(true);
  };

  const handleUpdateBoard = (boardData: Omit<Board, 'id' | 'createdAt'>) => {
    if (editingBoard) {
      updateBoardMutation.mutate(
        {
          id: editingBoard.id,
          updates: {
            name: boardData.name,
            description: boardData.description,
            stages: boardData.stages,
            linkedLifecycleStage: boardData.linkedLifecycleStage,
            nextBoardId: boardData.nextBoardId,
            template: boardData.template,
            isDefault: boardData.isDefault,
          },
        },
        {
          onSuccess: () => {
            setEditingBoard(null);
            setIsCreateBoardModalOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    if (
      window.confirm('Tem certeza que deseja excluir este board? Esta ação não pode ser desfeita.')
    ) {
      deleteBoardMutation.mutate(boardId, {
        onSuccess: () => {
          // Se deletou o board ativo, volta pro default
          if (boardId === activeBoardId && defaultBoard) {
            setActiveBoardId(defaultBoard.id);
          }
        },
      });
    }
  };

  return {
    // Boards (real database only)
    boards,
    activeBoard,
    activeBoardId,
    handleSelectBoard,
    handleCreateBoard,
    handleEditBoard,
    handleUpdateBoard,
    handleDeleteBoard,
    isCreateBoardModalOpen,
    setIsCreateBoardModalOpen,
    isWizardOpen,
    setIsWizardOpen,
    editingBoard,
    setEditingBoard,
    // View
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    ownerFilter,
    setOwnerFilter,
    dateRange,
    setDateRange,
    isFilterOpen,
    setIsFilterOpen,
    draggingId,
    selectedDealId,
    setSelectedDealId: handleSelectDeal,
    isCreateModalOpen,
    setIsCreateModalOpen,
    openActivityMenuId,
    setOpenActivityMenuId,
    filteredDeals,
    customFieldDefinitions,
    isLoading,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleQuickAddActivity,
    setLastMouseDownDealId,
  };
};

// @deprecated - Use useBoardsController
export const usePipelineController = useBoardsController;
