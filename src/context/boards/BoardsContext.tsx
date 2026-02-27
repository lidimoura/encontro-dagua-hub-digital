import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Board, BoardStage } from '@/types';
import { boardsService } from '@/lib/supabase';
import { useAuth } from '../AuthContext';

interface BoardsContextType {
  boards: Board[];
  loading: boolean;
  error: string | null;
  addBoard: (board: Omit<Board, 'id' | 'createdAt'>) => Promise<Board | null>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;

  // Active board state
  activeBoardId: string;
  setActiveBoardId: (id: string) => void;
  activeBoard: Board | null;

  // Helpers
  getDefaultBoard: () => Board | null;
  getBoardById: (id: string) => Board | undefined;

  // Stages
  addStage: (boardId: string, stage: Omit<BoardStage, 'id'>) => Promise<BoardStage | null>;
  updateStage: (stageId: string, updates: Partial<BoardStage>) => Promise<void>;
  deleteStage: (stageId: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

const BoardsContext = createContext<BoardsContextType | undefined>(undefined);

export const BoardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string>('');

  // Fetch boards on mount / user change
  const fetchBoards = useCallback(async () => {
    if (!profile?.company_id) {
      setBoards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await boardsService.getAll(profile.company_id);

    if (fetchError) {
      setError(fetchError.message);
      setBoards([]);
    } else {
      setBoards(data || []);
      // Set active board to first if not set
      if (data && data.length > 0 && !activeBoardId) {
        setActiveBoardId(data[0].id);
      }
    }

    setLoading(false);
  }, [profile, activeBoardId]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // CRUD Operations
  const addBoard = useCallback(
    async (board: Omit<Board, 'id' | 'createdAt'>): Promise<Board | null> => {
      if (!profile?.company_id) {
        setError('Usuário não tem empresa associada');
        return null;
      }

      const { data, error: addError } = await boardsService.create(board, profile.company_id);

      if (addError) {
        setError(addError.message);
        return null;
      }

      if (data) {
        setBoards(prev => [...prev, data]);
      }

      return data;
    },
    [profile?.company_id]
  );

  const updateBoard = useCallback(async (id: string, updates: Partial<Board>) => {
    const { error: updateError } = await boardsService.update(id, updates, profile?.company_id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setBoards(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  }, [profile?.company_id]);

  const deleteBoard = useCallback(async (id: string) => {
    const { error: deleteError } = await boardsService.delete(id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setBoards(prev => prev.filter(b => b.id !== id));
  }, []);

  // Stage Operations
  const addStage = useCallback(
    async (boardId: string, stage: Omit<BoardStage, 'id'>): Promise<BoardStage | null> => {
      const { data, error: addError } = await boardsService.addStage(boardId, stage);

      if (addError) {
        setError(addError.message);
        return null;
      }

      if (data) {
        setBoards(prev =>
          prev.map(b => (b.id === boardId ? { ...b, stages: [...b.stages, data] } : b))
        );
      }

      return data;
    },
    []
  );

  const updateStage = useCallback(async (stageId: string, updates: Partial<BoardStage>) => {
    const { error: updateError } = await boardsService.updateStage(stageId, updates);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setBoards(prev =>
      prev.map(b => ({
        ...b,
        stages: b.stages.map(s => (s.id === stageId ? { ...s, ...updates } : s)),
      }))
    );
  }, []);

  const deleteStage = useCallback(async (stageId: string) => {
    const { error: deleteError } = await boardsService.deleteStage(stageId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setBoards(prev =>
      prev.map(b => ({
        ...b,
        stages: b.stages.filter(s => s.id !== stageId),
      }))
    );
  }, []);

  // Helpers
  const getBoardById = useCallback(
    (id: string) => boards.find(b => b.id === id),
    [boards]
  );

  const getDefaultBoard = useCallback(() => {
    return boards.find(b => b.isDefault) || boards[0] || null;
  }, [boards]);

  const activeBoard = useMemo(() => {
    return getBoardById(activeBoardId) || getDefaultBoard();
  }, [activeBoardId, getBoardById, getDefaultBoard]);

  const value = useMemo(
    () => ({
      boards,
      loading,
      error,
      addBoard,
      updateBoard,
      deleteBoard,
      activeBoardId,
      setActiveBoardId,
      activeBoard,
      getDefaultBoard,
      getBoardById,
      addStage,
      updateStage,
      deleteStage,
      refresh: fetchBoards,
    }),
    [
      boards,
      loading,
      error,
      addBoard,
      updateBoard,
      deleteBoard,
      activeBoardId,
      activeBoard,
      getDefaultBoard,
      getBoardById,
      addStage,
      updateStage,
      deleteStage,
      fetchBoards,
    ]
  );

  return <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>;
};

export const useBoards = () => {
  const context = useContext(BoardsContext);
  if (context === undefined) {
    throw new Error('useBoards must be used within a BoardsProvider');
  }
  return context;
};
