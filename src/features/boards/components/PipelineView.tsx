import React, { useState, useEffect } from 'react';
import { DealDetailModal } from './Modals/DealDetailModal';
import { CreateDealModal } from './Modals/CreateDealModal';
import { CreateBoardModal } from './Modals/CreateBoardModal';
import { BoardCreationWizard } from './BoardCreationWizard';
import { KanbanHeader } from './Kanban/KanbanHeader';
import { BoardTabs } from './BoardTabs';
import { KanbanBoard } from './Kanban/KanbanBoard';
import { KanbanList } from './Kanban/KanbanList';
import { MobileKanbanView } from './Mobile/MobileKanbanView';
import { DealView, CustomFieldDefinition, DealStatus, Board, BoardStage } from '@/types';
import { useCRM } from '@/context/CRMContext';
import { useTranslation } from '@/hooks/useTranslation';

interface PipelineViewProps {
  // Boards
  boards: Board[];
  activeBoard: Board;
  activeBoardId: string;
  handleSelectBoard: (id: string) => void;
  handleCreateBoard: (board: Omit<Board, 'id' | 'createdAt'>) => void;
  handleEditBoard: (board: Board) => void;
  handleUpdateBoard: (board: Omit<Board, 'id' | 'createdAt'>) => void;
  handleDeleteBoard: (id: string) => void;
  isCreateBoardModalOpen: boolean;
  setIsCreateBoardModalOpen: (isOpen: boolean) => void;
  isWizardOpen: boolean;
  setIsWizardOpen: (isOpen: boolean) => void;
  editingBoard: Board | null;
  setEditingBoard: (board: Board | null) => void;
  // View
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  ownerFilter: 'all' | 'mine';
  setOwnerFilter: (filter: 'all' | 'mine') => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  draggingId: string | null;
  selectedDealId: string | null;
  setSelectedDealId: (id: string | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  openActivityMenuId: string | null;
  setOpenActivityMenuId: (id: string | null) => void;
  filteredDeals: DealView[];
  customFieldDefinitions: CustomFieldDefinition[];
  isLoading: boolean;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, stageId: string) => void;
  handleQuickAddActivity: (
    dealId: string,
    type: 'CALL' | 'MEETING' | 'EMAIL',
    dealTitle: string
  ) => void;
  setLastMouseDownDealId: (id: string | null) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  // Boards
  boards,
  activeBoard,
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
  isFilterOpen,
  setIsFilterOpen,
  draggingId,
  selectedDealId,
  setSelectedDealId,
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
}) => {
  const { updateDeal } = useCRM();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [initialStageId, setInitialStageId] = useState<string | undefined>(undefined);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUpdateStage = (updatedStage: BoardStage) => {
    if (!activeBoard) return;
    const newStages = activeBoard.stages.map(s => (s.id === updatedStage.id ? updatedStage : s));
    handleUpdateBoard({ ...activeBoard, stages: newStages });
  };

  // Handle status change from mobile view
  const handleMobileStatusChange = async (dealId: string, newStatus: string) => {
    const deal = filteredDeals.find(d => d.id === dealId);
    if (!deal) return;

    await updateDeal(dealId, { status: newStatus });
  };

  // Listen for quick-add deal event from empty columns
  React.useEffect(() => {
    const handleOpenCreateDeal = (e: any) => {
      if (e.detail?.stageId) {
        setInitialStageId(e.detail.stageId);
      } else {
        setInitialStageId(undefined);
      }
      setIsCreateModalOpen(true);
    };

    window.addEventListener('openCreateDealModal', handleOpenCreateDeal as EventListener);
    return () => window.removeEventListener('openCreateDealModal', handleOpenCreateDeal as EventListener);
  }, [setIsCreateModalOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">{t('loading')}</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {!activeBoard ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t('welcomeCreateBoard')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            {t('boardEmptyDesc')}
          </p>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-primary-600/20"
          >
            ✨ {t('createFirstBoard')}
          </button>
        </div>
      ) : (
        <>
          <KanbanHeader
            boards={boards}
            activeBoard={activeBoard}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={() => setIsWizardOpen(true)}
            onEditBoard={handleEditBoard}
            onDeleteBoard={handleDeleteBoard}
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            ownerFilter={ownerFilter}
            setOwnerFilter={setOwnerFilter}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            onNewDeal={() => setIsCreateModalOpen(true)}
          />

          <BoardTabs board={activeBoard} />

          <div className="flex-1 overflow-hidden">
            {isMobile ? (
              // Mobile View - List with status change buttons
              <MobileKanbanView
                stages={activeBoard.stages}
                filteredDeals={filteredDeals}
                setSelectedDealId={setSelectedDealId}
                onStatusChange={handleMobileStatusChange}
              />
            ) : viewMode === 'kanban' ? (
              // Desktop Kanban View
              <KanbanBoard
                stages={activeBoard.stages}
                filteredDeals={filteredDeals}
                draggingId={draggingId}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                setSelectedDealId={setSelectedDealId}
                openActivityMenuId={openActivityMenuId}
                setOpenActivityMenuId={setOpenActivityMenuId}
                handleQuickAddActivity={handleQuickAddActivity}
                setLastMouseDownDealId={setLastMouseDownDealId}
              />
            ) : (
              // Desktop List View
              <KanbanList
                stages={activeBoard.stages}
                filteredDeals={filteredDeals}
                customFieldDefinitions={customFieldDefinitions}
                setSelectedDealId={setSelectedDealId}
                openActivityMenuId={openActivityMenuId}
                setOpenActivityMenuId={setOpenActivityMenuId}
                handleQuickAddActivity={handleQuickAddActivity}
              />
            )}
          </div>
        </>
      )}

      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setInitialStageId(undefined);
        }}
        initialStageId={initialStageId}
      />

      <DealDetailModal
        dealId={selectedDealId}
        isOpen={!!selectedDealId}
        onClose={() => setSelectedDealId(null)}
      />

      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => {
          setIsCreateBoardModalOpen(false);
          setEditingBoard(null);
        }}
        onSave={editingBoard ? handleUpdateBoard : handleCreateBoard}
        editingBoard={editingBoard || undefined}
        availableBoards={boards}
      />

      <BoardCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreate={handleCreateBoard}
        onOpenCustomModal={() => setIsCreateBoardModalOpen(true)}
      />
    </div>
  );
};
