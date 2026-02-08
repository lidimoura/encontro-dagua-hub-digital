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
import { Settings as SettingsIcon, Users, Database } from 'lucide-react';

const GeneralSettings: React.FC = () => {
  const controller = useSettingsController();


  return (
    <div className="pb-10">
      {/* General Settings */}
      <div className="mb-12">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Página Inicial</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Escolha qual tela deve abrir quando você iniciar o CRM.
          </p>
          <select
            value={controller.defaultRoute}
            onChange={(e) => controller.setDefaultRoute(e.target.value)}
            className="w-full max-w-xs px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all"
          >
            <option value="/dashboard">Dashboard</option>
            <option value="/inbox-list">Inbox (Lista)</option>
            <option value="/inbox-focus">Inbox (Foco)</option>
            <option value="/boards">Boards (Kanban)</option>
            <option value="/contacts">Contatos</option>
            <option value="/activities">Atividades</option>
            <option value="/reports">Relatórios</option>
          </select>
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
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-1">⚠️ Zona de Perigo</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Ações irreversíveis ou de debug. Use com cuidado.
          </p>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja reiniciar o tutorial de onboarding? A página será recarregada.')) {
                localStorage.removeItem('onboarding_completed');
                localStorage.removeItem('has_seen_tutorial');
                localStorage.removeItem('first_visit_completed');
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Reiniciar Tutorial de Onboarding
          </button>
        </div>
      </div>

    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const tabs = [
    { name: 'Geral', path: '/settings', icon: SettingsIcon },
    { name: 'Dados', path: '/settings/data', icon: Database },
    ...(profile?.role === 'admin' ? [{ name: 'Equipe', path: '/settings/users', icon: Users }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tabs minimalistas */}
      <div className="flex items-center gap-1 mb-8 border-b border-slate-200 dark:border-white/10">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <Routes>
        <Route path="/" element={<GeneralSettings />} />
        <Route path="/data" element={<DataStorageSettings />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/settings" replace />} />
      </Routes>
    </div>
  );
};

export default SettingsPage;
