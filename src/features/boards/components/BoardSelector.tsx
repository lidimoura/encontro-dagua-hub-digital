import React, { useState } from 'react';
import { ChevronDown, Plus, Settings, Trash2 } from 'lucide-react';
import { Board } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface BoardSelectorProps {
  boards: Board[];
  activeBoard: Board;
  onSelectBoard: (id: string) => void;
  onCreateBoard: () => void;
  onEditBoard?: (board: Board) => void;
  onDeleteBoard?: (id: string) => void;
}

export const BoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  activeBoard,
  onSelectBoard,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-500" />
          <span className="font-medium text-slate-900 dark:text-white">
            {activeBoard.name}
          </span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
            {/* Board List */}
            <div className="max-h-64 overflow-y-auto">
              {boards.map(board => (
                <div
                  key={board.id}
                  className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${board.id === activeBoard.id
                    ? 'bg-primary-50 dark:bg-primary-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                >
                  <button
                    onClick={() => { onSelectBoard(board.id); setIsOpen(false); }}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className={`w-2 h-2 rounded-full ${board.id === activeBoard.id ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                    <div>
                      <p className={`text-sm font-medium ${board.id === activeBoard.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-700 dark:text-slate-200'
                        }`}>
                        {board.name}
                      </p>
                      {board.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {board.description}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  {!board.isDefault && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEditBoard && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditBoard(board); }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        >
                          <Settings size={14} />
                        </button>
                      )}
                      {onDeleteBoard && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteBoard(board.id); }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Create New Board */}
            <div className="border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => { onCreateBoard(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
              >
                <Plus size={16} />
                {t('createNewBoard')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
