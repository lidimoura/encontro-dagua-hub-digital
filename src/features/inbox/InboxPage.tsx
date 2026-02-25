import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useInboxController } from './hooks/useInboxController';
import { InboxListView } from './components/InboxListView';
import { InboxFocusView } from './components/InboxFocusView';
import { ViewModeToggle } from './components/ViewModeToggle';

export const InboxPage: React.FC = () => {
  const { t } = useTranslation();
  const controller = useInboxController();

  const {
    viewMode,
    setViewMode,
    overdueActivities,
    todayMeetings,
    todayTasks,
    upcomingActivities,
    aiSuggestions,
    handleCompleteActivity,
    handleSnoozeActivity,
    handleDiscardActivity,
    handleAcceptSuggestion,
    handleDismissSuggestion,
    handleSnoozeSuggestion,
    focusQueue,
    focusIndex,
    currentFocusItem,
    handleFocusDone,
    handleFocusSnooze,
    handleFocusSkip,
    handleFocusPrev,
    handleFocusNext,
  } = controller;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-1">
            {t('inboxTitle')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t('inboxSubtitle')}</p>
        </div>

        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Views */}
      {viewMode === 'list' ? (
        <InboxListView
          overdueActivities={overdueActivities}
          todayMeetings={todayMeetings}
          todayTasks={todayTasks}
          upcomingActivities={upcomingActivities}
          aiSuggestions={aiSuggestions}
          onCompleteActivity={handleCompleteActivity}
          onSnoozeActivity={handleSnoozeActivity}
          onDiscardActivity={handleDiscardActivity}
          onAcceptSuggestion={handleAcceptSuggestion}
          onDismissSuggestion={handleDismissSuggestion}
          onSnoozeSuggestion={handleSnoozeSuggestion}
        />
      ) : (
        <InboxFocusView
          currentItem={currentFocusItem}
          currentIndex={focusIndex}
          totalItems={focusQueue.length}
          onDone={handleFocusDone}
          onSnooze={handleFocusSnooze}
          onSkip={handleFocusSkip}
          onPrev={handleFocusPrev}
          onNext={handleFocusNext}
        />
      )}
    </div>
  );
};
