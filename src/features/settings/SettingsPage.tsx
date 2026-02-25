import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useSettingsController } from './hooks/useSettingsController';
import { TagsManager } from './components/TagsManager';
import { CustomFieldsManager } from './components/CustomFieldsManager';
import { ApiKeysSection } from './components/ApiKeysSection';
import { WebhooksSection } from './components/WebhooksSection';
import { AIConfigSection } from './components/AIConfigSection';
import { DataStorageSettings } from './components/DataStorageSettings';
import { UsersPage } from './UsersPage';
import { useAuth } from '@/context/AuthContext';
import { Settings as SettingsIcon, Users, Database, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase/client';

const GeneralSettings: React.FC = () => {
  const controller = useSettingsController();
  const { t } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [updatingHome, setUpdatingHome] = useState(false);

  const handleSetHomePage = async (path: string) => {
    try {
      setUpdatingHome(true);
      const { error } = await supabase.auth.updateUser({
        data: { home_page: path }
      });

      if (error) throw error;

      // Refresh profile to update UI
      await refreshProfile();

    } catch (error) {
      console.error('Error updating home page:', error);
      alert('Failed to update home page preference');
    } finally {
      setUpdatingHome(false);
    }
  };

  const resetOnboarding = () => {
    if (confirm(t('confirmResetOnboarding'))) {
      // Legacy keys
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('has_seen_tutorial');
      localStorage.removeItem('first_visit_completed');

      // Active keys
      localStorage.removeItem('crm_onboarding_completed'); // from useFirstVisit.ts
      localStorage.removeItem('hasSeenTour'); // from OnboardingTour.tsx

      window.location.reload();
    }
  };

  return (
    <div className="pb-10 space-y-8">
      {/* HomePage Setting */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-white/10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <LayoutDashboard size={20} className="text-primary-500" />
          {t('homePage')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {t('homePageDesc')}
        </p>
        <div className="flex gap-4">
          <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 transition-all ${user?.user_metadata?.home_page === '/dashboard' || !user?.user_metadata?.home_page ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'} `}>
            <input
              type="radio"
              name="homePage"
              value="/dashboard"
              checked={user?.user_metadata?.home_page === '/dashboard' || !user?.user_metadata?.home_page}
              onChange={() => handleSetHomePage('/dashboard')}
              className="sr-only"
              disabled={updatingHome}
            />
            <div className="font-medium text-slate-900 dark:text-white text-center">{t('dashboardTitle')}</div>
          </label>
          <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 transition-all ${user?.user_metadata?.home_page === '/inbox' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'} `}>
            <input
              type="radio"
              name="homePage"
              value="/inbox"
              checked={user?.user_metadata?.home_page === '/inbox'}
              onChange={() => handleSetHomePage('/inbox')}
              className="sr-only"
              disabled={updatingHome}
            />
            <div className="font-medium text-slate-900 dark:text-white text-center">{t('inboxTitle')}</div>
          </label>
        </div>
      </div>

      <TagsManager
        availableTags={controller.availableTags}
        newTagName={controller.newTagName}
        setNewTagName={controller.setNewTagName}
        onAddTag={controller.handleAddTag}
        onRemoveTag={controller.removeTag}
      />

      <CustomFieldsManager
        customFieldDefinitions={controller.customFieldDefinitions}
        newFieldLabel={controller.newFieldLabel}
        setNewFieldLabel={controller.setNewFieldLabel}
        newFieldType={controller.newFieldType}
        setNewFieldType={controller.setNewFieldType}
        newFieldOptions={controller.newFieldOptions}
        setNewFieldOptions={controller.setNewFieldOptions}
        editingId={controller.editingId}
        onStartEditing={controller.startEditingField}
        onCancelEditing={controller.cancelEditingField}
        onSaveField={controller.handleSaveField}
        onRemoveField={controller.removeCustomField}
      />

      <ApiKeysSection />

      <WebhooksSection />

      <AIConfigSection />

      {/* Danger Zone */}
      <div className="mt-12">
        <div className="bg-red-50 dark:bg-red-500/5 p-6 rounded-xl border border-red-200 dark:border-red-500/20">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('dangerZoneSection')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {t('dangerZoneDesc')}
          </p>
          <button
            onClick={resetOnboarding}
            className="px-4 py-2 bg-white dark:bg-dark-card text-red-600 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            {t('resetOnboarding')}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('general');
  const isAdmin = profile?.role === 'admin';

  // Verify if we are on a specific route to set the tab
  const location = useLocation();

  // Simple tab rendering logic
  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'data': return <DataStorageSettings />;
      case 'team': return isAdmin ? <UsersPage /> : <Navigate to="/settings" />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-white/10 pb-4">
        {t('settings')}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'general'
              ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
          >
            <SettingsIcon size={18} />
            {t('general')}
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'data'
              ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
          >
            <Database size={18} />
            {t('data')}
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'team'
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
            >
              <Users size={18} />
              {t('team')}
            </button>
          )}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
