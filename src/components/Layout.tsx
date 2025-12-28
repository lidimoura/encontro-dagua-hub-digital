import React, { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Settings,
  Sun,
  Moon,
  Bell,
  CalendarCheck,
  Crosshair,
  BarChart3,
  Inbox,
  Sparkles,
  BotMessageSquare,
  Zap,
  LogOut,
  User,
  Menu,
  X,
  QrCode,
  Wand2,
  RefreshCcw,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { prefetchRoute, RouteName } from '@/lib/prefetch';
import { FloatingAIWidget } from './FloatingAIWidget';

// Lazy load AI Assistant (heavy component with Gemini SDK)
const AIAssistant = lazy(() => import('./AIAssistant'));

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem = ({
  to,
  icon: Icon,
  label,
  active,
  prefetch,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  prefetch?: RouteName;
}) => (
  <Link
    to={to}
    onMouseEnter={prefetch ? () => prefetchRoute(prefetch) : undefined}
    onFocus={prefetch ? () => prefetchRoute(prefetch) : undefined}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
    ${active
        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-900/50'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
      }`}
  >
    <Icon size={20} className={active ? 'text-primary-500' : ''} />
    <span className="font-display tracking-wide">{label}</span>
  </Link>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { profile, signOut, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true); // Notification badge state
  const [isHelpOpen, setIsHelpOpen] = useState(false); // Help modal state

  // Gera iniciais do email
  const userInitials = profile?.email?.substring(0, 2).toUpperCase() || 'U';

  // Fecha menu mobile ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Previne scroll do body quando menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg bg-dots">
      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[90] md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-[100] md:hidden shadow-2xl animate-in slide-in-from-left duration-300 ease-out flex flex-col">
            {/* Header do Drawer */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-solimoes-400/20 dark:border-solimoes-400/10">
              <a href="/#/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center text-solimoes-400 font-bold text-lg shadow-lg shadow-acai-900/30">
                  A
                </div>
                <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-solimoes-400 to-solimoes-500 bg-clip-text text-transparent">
                  Encontro D'água - Hub Digital
                </span>
              </a>
              <button

                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navegação Mobile */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <NavItem
                to="/inbox"
                icon={Inbox}
                label="Inbox"
                active={location.pathname === '/inbox'}
                prefetch="inbox"
              />
              <NavItem
                to="/dashboard"
                icon={LayoutDashboard}
                label="Visão Geral"
                active={location.pathname === '/dashboard'}
                prefetch="dashboard"
              />
              <NavItem
                to="/boards"
                icon={KanbanSquare}
                label="Boards"
                active={location.pathname === '/boards' || location.pathname === '/pipeline'}
                prefetch="boards"
              />
              <NavItem
                to="/contacts"
                icon={Users}
                label="Contatos"
                active={location.pathname === '/contacts'}
                prefetch="contacts"
              />
              <NavItem
                to="/qrdagua"
                icon={QrCode}
                label="QR d'água"
                active={location.pathname === '/qrdagua'}
              />
              <NavItem
                to="/prompt-lab"
                icon={Wand2}
                label="Prompt Lab"
                active={location.pathname === '/prompt-lab'}
              />
              <NavItem
                to="/reports"
                icon={BarChart3}
                label="Relatórios"
                active={location.pathname === '/reports'}
                prefetch="reports"
              />
              {profile?.role === 'admin' && (
                <NavItem
                  to="/settings"
                  icon={Settings}
                  label="Configurações"
                  active={location.pathname === '/settings'}
                  prefetch="settings"
                />
              )}
              {profile?.email === 'lidimfc@gmail.com' && (
                <NavItem
                  to="/admin"
                  icon={Shield}
                  label="Admin"
                  active={location.pathname === '/admin'}
                />
              )}
            </nav>

            {/* User Card no rodapé do drawer */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800 shadow-lg">
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
                        : profile?.nickname?.substring(0, 2).toUpperCase() || userInitials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {profile?.nickname || profile?.first_name || profile?.email?.split('@')[0] || 'Usuário'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {profile?.email || ''}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-150">
                      <div className="p-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Editar Perfil
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair da conta
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      <div className="flex flex-1 h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg bg-dots">
        {/* Sidebar - Visible on desktop (md+), hidden on mobile */}
        <aside className="hidden md:flex w-64 flex-col z-20 glass border-r border-slate-200 dark:border-white/5">
          <div className="h-16 px-5 flex items-center border-b border-solimoes-400/20 dark:border-solimoes-400/10">
            <a href="/#/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center text-solimoes-400 font-bold text-lg shadow-lg shadow-acai-900/30">
                E
              </div>
              <span className="text-lg font-bold font-display tracking-tight bg-gradient-to-r from-solimoes-400 to-solimoes-500 bg-clip-text text-transparent">
                Encontro D'água - Hub Digital
              </span>
            </a>
          </div>


          <nav className="flex-1 p-4 space-y-2">
            <NavItem
              to="/inbox"
              icon={Inbox}
              label="Inbox"
              active={location.pathname === '/inbox'}
              prefetch="inbox"
            />
            <NavItem
              to="/dashboard"
              icon={LayoutDashboard}
              label="Visão Geral"
              active={location.pathname === '/dashboard'}
              prefetch="dashboard"
            />
            <NavItem
              to="/boards"
              icon={KanbanSquare}
              label="Boards"
              active={location.pathname === '/boards' || location.pathname === '/pipeline'}
              prefetch="boards"
            />
            <NavItem
              to="/contacts"
              icon={Users}
              label="Contatos"
              active={location.pathname === '/contacts'}
              prefetch="contacts"
            />
            <NavItem
              to="/qrdagua"
              icon={QrCode}
              label="QR d'água"
              active={location.pathname === '/qrdagua'}
            />
            <NavItem
              to="/prompt-lab"
              icon={Wand2}
              label="Prompt Lab"
              active={location.pathname === '/prompt-lab'}
            />
            <NavItem
              to="/reports"
              icon={BarChart3}
              label="Relatórios"
              active={location.pathname === '/reports'}
              prefetch="reports"
            />
            {profile?.role === 'admin' && (
              <NavItem
                to="/settings"
                icon={Settings}
                label="Configurações"
                active={location.pathname === '/settings'}
                prefetch="settings"
              />
            )}
            {profile?.email === 'lidimfc@gmail.com' && (
              <NavItem
                to="/admin"
                icon={Shield}
                label="Admin"
                active={location.pathname === '/admin'}
              />
            )}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-white/5">
            <div className="relative">
              {/* User Card - Clickable */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800 shadow-lg">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
                      : profile?.nickname?.substring(0, 2).toUpperCase() || userInitials}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {profile?.nickname || profile?.first_name || profile?.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {profile?.email || ''}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />

                  {/* Menu */}
                  <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-150">
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Editar Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex min-w-0 overflow-hidden relative">
          {/* Middle Content (Header + Page) */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ease-in-out">
            {/* Ambient background glow */}
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-acai-900/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-solimoes-400/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-solimoes-400/20 dark:border-solimoes-400/10 glass relative z-20">
              {/* Mobile Menu Button - Only visible on mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-solimoes-400 hover:text-solimoes-500 hover:bg-rionegro-900/50 rounded-lg transition-colors"
                aria-label="Abrir menu"
              >
                <Menu size={24} />
              </button>

              <div className="flex-1" />

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Refresh Profile Button */}
                <button
                  onClick={async () => {
                    setIsRefreshing(true);
                    try {
                      await refreshProfile();
                    } finally {
                      setIsRefreshing(false);
                    }
                  }}
                  disabled={isRefreshing}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
                  title="Atualizar permissões"
                >
                  <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(!isNotificationOpen);
                      setHasUnreadNotification(false); // Clear badge on click
                    }}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full relative transition-colors"
                  >
                    <Bell size={20} />
                    {hasUnreadNotification && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-card animate-pulse"></span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {isNotificationOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsNotificationOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-900 dark:text-white">Notificações</h3>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/qrdagua"
                            onClick={() => setIsNotificationOpen(false)}
                            className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-acai-900 to-acai-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <QrCode className="w-5 h-5 text-solimoes-400" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                Sistema atualizado
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Módulo QR d'água ativo
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                Agora você pode criar e gerenciar QR Codes personalizados!
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-95"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {/* Help Button */}
                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all"
                  title="Ajuda"
                >
                  <HelpCircle size={20} />
                </button>
              </div>
            </header>

            {/* Help Modal */}
            {isHelpOpen && (
              <>
                <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={() => setIsHelpOpen(false)} />
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Como usar o Hub 🚀</h3>
                    <button
                      onClick={() => setIsHelpOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-6">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-acai-900 text-white rounded-full font-bold text-xs">1</span>
                      <span><strong>Gere QR D'água</strong> personalizados para seus links e compartilhe facilmente</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-acai-900 text-white rounded-full font-bold text-xs">2</span>
                      <span><strong>Use o Prompt Lab</strong> para criar conteúdos com IA de forma profissional</span>
                    </li>
                    {/* DYNAMIC HELP: Only show Hub Digital if user has access */}
                    {profile?.access_level?.includes('hub_digital') && (
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-acai-900 text-white rounded-full font-bold text-xs">3</span>
                        <span><strong>Gerencie seus contatos</strong> e clientes de forma simples no Hub Digital</span>
                      </li>
                    )}
                  </ol>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-purple-900 dark:text-purple-300">
                      <strong>💎 Planos FREE vs PRO:</strong> Admins têm recursos PRO como redirecionamento direto de QR Codes. Vendedores usam o plano FREE com "Powered by" nas páginas.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    className="w-full py-2 bg-acai-900 text-white rounded-lg font-semibold hover:bg-acai-800 transition-colors"
                  >
                    Entendi!
                  </button>
                </div>
              </>
            )}

            {/* Page Content */}
            <div className="flex-1 overflow-auto p-6 relative z-10 scroll-smooth">{children}</div>
          </main>
        </div>
      </div>

      {/* Floating AI Widget - Omnipresent */}
      <FloatingAIWidget isAuthenticated={!!profile} />
    </div>
  );
};


export default Layout;
