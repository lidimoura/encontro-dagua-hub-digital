import React from 'react';
import { useInboxController } from './hooks/useInboxController';
import { ViewModeToggle } from './components/ViewModeToggle';
import { InboxListView } from './components/InboxListView';
import { InboxFocusView } from './components/InboxFocusView';
import { useDeepLink } from '@/hooks/useDeepLink';
import { useNavigate } from 'react-router-dom';

export const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    // View Mode
    viewMode,
    setViewMode,

    // Atividades
    overdueActivities,
    todayMeetings,
    todayTasks,
    upcomingActivities,

    // Sugestões IA
    aiSuggestions,

    // Focus Mode
    focusQueue,
    focusIndex,
    currentFocusItem,
    handleFocusNext,
    handleFocusPrev,
    handleFocusSkip,
    handleFocusDone,
    handleFocusSnooze,

    // Stats
    stats,

    // Handlers Atividades
    handleCompleteActivity,
    handleSnoozeActivity,
    handleDiscardActivity,

    // Handlers Sugestões
    handleAcceptSuggestion,
    handleDismissSuggestion,
    handleSnoozeSuggestion,
  } = useInboxController();

  // Deep linking support - navigate to boards when dealId is detected
  useDeepLink((dealId) => {
    navigate(`/boards?dealId=${dealId}`);
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-1">
            Inbox
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Sua mesa de trabalho.</p>
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
