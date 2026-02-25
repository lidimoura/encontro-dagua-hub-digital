import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CRMProvider } from '@/context/CRMContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { QueryProvider } from '@/lib/query';
import Layout from '@/components/Layout';
import { PageLoader } from '@/components/PageLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleBasedRoute } from '@/components/RoleBasedRoute';
import { TypebotVisibilityController } from '@/components/TypebotVisibilityController';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Login from '@/pages/Login';
import JoinPage from '@/pages/JoinPage';
import SetupWizard from '@/pages/SetupWizard';

// Import UUID polyfill to fix crypto.randomUUID() compatibility issues
import '@/lib/utils/generateId';

// Lazy load all pages for code splitting
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'));
const BoardsPage = lazy(() =>
  import('@/features/boards/BoardsPage').then(m => ({ default: m.BoardsPage }))
);
const ContactsPage = lazy(() =>
  import('@/features/contacts/ContactsPage').then(m => ({ default: m.ContactsPage }))
);
const Settings = lazy(() => import('@/features/settings/SettingsPage'));
const InboxPage = lazy(() =>
  import('@/features/inbox/InboxPage').then(m => ({ default: m.InboxPage }))
);
const ActivitiesPage = lazy(() =>
  import('@/features/activities/ActivitiesPage').then(m => ({ default: m.ActivitiesPage }))
);
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const AIHubPage = lazy(() =>
  import('@/features/ai-hub/AIHubPage').then(m => ({ default: m.AIHubPage }))
);
const DecisionQueuePage = lazy(() =>
  import('@/features/decisions/DecisionQueuePage').then(m => ({ default: m.DecisionQueuePage }))
);
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then(m => ({ default: m.ProfilePage }))
);
const QRdaguaPage = lazy(() =>
  import('@/features/qrdagua/QRdaguaPage').then(m => ({ default: m.QRdaguaPage }))
);
const PromptLabPage = lazy(() =>
  import('@/features/prompt-lab/PromptLabPage').then(m => ({ default: m.default }))
);
const AdminUsersPage = lazy(() =>
  import('@/features/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage }))
);
const AdminPage = lazy(() => import('@/features/admin/AdminPage'));
const TechStackPage = lazy(() =>
  import('@/features/admin/TechStackPage').then(m => ({ default: m.TechStackPage }))
);
const BridgePage = lazy(() =>
  import('@/pages/BridgePage').then(m => ({ default: m.BridgePage }))
);
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then(m => ({ default: m.default }))
);
const ManifestoPage = lazy(() =>
  import('@/pages/ManifestoPage').then(m => ({ default: m.ManifestoPage }))
);
const ClientPortalPage = lazy(() =>
  import('@/pages/ClientPortalPage').then(m => ({ default: m.ClientPortalPage }))
);



// Layout wrapper for protected routes
const ProtectedLayout: React.FC = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

const App: React.FC = () => {
  // STRICT ENFORCEMENT: Force English for International Demo
  React.useEffect(() => {
    const saved = localStorage.getItem('app_language');
    if (saved !== 'en') {
      localStorage.setItem('app_language', 'en');
      // Only reload if we actually changed something to avoid loops
      if (saved === 'pt') {
        window.location.reload();
      }
    }
  }, []);

  return (
    <QueryProvider>
      <ToastProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <CRMProvider>
                <HashRouter>
                  <TypebotVisibilityController />
                  <Suspense fallback={<PageLoader />}>
                    <ErrorBoundary>
                      <Routes>
                        {/* PUBLIC ROUTES - NO AUTH REQUIRED */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        {/* Invite Only - Redirect register to landing page */}
                        <Route path="/register" element={<Navigate to="/?action=apply" replace />} />
                        <Route path="/join" element={<JoinPage />} />
                        <Route path="/setup" element={<SetupWizard />} />
                        <Route path="/v/:slug" element={<BridgePage />} />
                        <Route path="/r/:slug" element={<BridgePage />} /> {/* NEW SHORT LINK ROUTE */}
                        <Route path="/manifesto" element={<ManifestoPage />} />


                        {/* PROTECTED ROUTES - REQUIRE AUTH */}
                        <Route element={<ProtectedLayout />}>
                          {/* Dashboard - All authenticated users */}
                          <Route path="dashboard" element={<Dashboard />} />

                          {/* Admin/Team Routes - Restricted to admin and vendedor */}
                          <Route path="inbox" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <InboxPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="boards" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <BoardsPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="pipeline" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <BoardsPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="contacts" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <ContactsPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="settings/*" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <Settings />
                            </RoleBasedRoute>
                          } />
                          <Route path="activities" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <ActivitiesPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="reports" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <ReportsPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="ai" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <AIHubPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="decisions" element={
                            <RoleBasedRoute allowedRoles={['admin', 'vendedor']}>
                              <DecisionQueuePage />
                            </RoleBasedRoute>
                          } />
                          <Route path="admin" element={
                            <RoleBasedRoute allowedRoles={['admin']}>
                              <AdminPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="admin/users" element={
                            <RoleBasedRoute allowedRoles={['admin']}>
                              <AdminUsersPage />
                            </RoleBasedRoute>
                          } />
                          <Route path="admin/tech-stack" element={
                            <RoleBasedRoute allowedRoles={['admin']}>
                              <TechStackPage />
                            </RoleBasedRoute>
                          } />

                          {/* Client Routes - Accessible to all roles */}
                          <Route path="profile" element={<ProfilePage />} />
                          <Route path="qrdagua" element={<QRdaguaPage />} />
                          <Route path="prompt-lab" element={<PromptLabPage />} />
                          <Route path="portal" element={<ClientPortalPage />} />
                        </Route>

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </ErrorBoundary>
                  </Suspense>
                </HashRouter>
              </CRMProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </ToastProvider>
    </QueryProvider>
  );
};

export default App;
