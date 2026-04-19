import React from 'react';
import { Plus, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ActivitiesHeaderProps {
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
  onNewActivity: () => void;
}

export const ActivitiesHeader: React.FC<ActivitiesHeaderProps> = ({
  viewMode,
  setViewMode,
  onNewActivity,
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          {t('activities')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t('activitiesSubtitle')}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex bg-white dark:bg-dark-card p-1 rounded-lg border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <LayoutList size={20} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'calendar'
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <CalendarIcon size={20} />
          </button>
        </div>
        <button
          onClick={onNewActivity}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary-600/20"
        >
          <Plus size={20} />
          {t('newActivity')}
        </button>
      </div>
    </div>
  );
};
