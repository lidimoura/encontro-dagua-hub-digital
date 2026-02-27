import React, { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
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
  BookOpen,
  Package,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { prefetchRoute, RouteName } from '@/lib/prefetch';
import { FloatingAIWidget } from './FloatingAIWidget';
import { AiflowSupport } from './AiflowSupport';
import { supabase } from '@/lib/supabase/client';

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
  const { language, setLanguage, t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // NEXUS DEBUG: Monitor navigation state
  useEffect(() => {
    console.log("🧭 NEXUS DEBUG: Navigation Update", {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      timestamp: new Date().toISOString()
    });
  }, [location]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

  // Fetch notifications
  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `company_id=eq.${profile.company_id}`
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.company_id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Navigation items - MOVED INSIDE COMPONENT to access t() function
  // This fixes "ReferenceError: t is not defined" error
  const navItems = React.useMemo(() => {
    const items = [
      // Core CRM - Admin & Vendedor
      { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard'), prefetch: 'dashboard' as RouteName },
      { to: '/boards', icon: KanbanSquare, label: t('boards'), prefetch: 'board' as RouteName },
      { to: '/contacts', icon: Users, label: t('contacts'), prefetch: 'contacts' as RouteName },
      { to: '/inbox', icon: Inbox, label: t('inbox'), prefetch: 'inbox' as RouteName },
      { to: '/activities', icon: CalendarCheck, label: t('activities'), prefetch: 'activities' as RouteName },

      // Analytics & AI - Admin & Vendedor
      { to: '/reports', icon: BarChart3, label: t('reports'), prefetch: 'reports' as RouteName },
      { to: '/ai', icon: Sparkles, label: t('aiHub'), prefetch: 'ai' as RouteName },
      { to: '/decisions', icon: Crosshair, label: t('decisions'), prefetch: 'decisions' as RouteName },

      // Tools - All Users
      { to: '/qrdagua', icon: QrCode, label: t('qrWater'), prefetch: 'qrdagua' as RouteName },
      { to: '/prompt-lab', icon: Wand2, label: t('promptLab'), prefetch: 'prompt-lab' as RouteName },

      // Settings - Admin & Vendedor
      { to: '/settings', icon: Settings, label: t('settings'), prefetch: 'settings' as RouteName },
    ];

    // Admin-only items
    if (profile?.role === 'admin') {
      items.push(
        { to: '/admin', icon: Shield, label: t('admin'), prefetch: 'admin' as RouteName },
        { to: '/admin/tech-stack', icon: Package, label: t('techStack'), prefetch: 'admin' as RouteName }
      );
    }

    return items;
  }, [t, profile?.role]);

  // Loading state
  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to}
                  prefetch={item.prefetch}
                />
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Logo - Clickable */}
        <Link to="/" className="h-16 px-6 flex items-center border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <h1 className="text-xl font-bold bg-gradient-to-r from-acai-900 to-solimoes-600 bg-clip-text text-transparent">
            Hub d'água
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
              prefetch={item.prefetch}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-acai-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-solimoes-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header - Fixed on mobile */}
        <header className="fixed md:relative top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-[50] md:z-auto">
          {/* Mobile Menu Button - Always accessible */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors z-[60]"
            aria-label={t('openMenu')}
          >
            <Menu size={24} />
          </button>

          {/* Page Title - Hidden on mobile when menu button is shown */}
          <div className="hidden md:block">
            {/* Page title can be added here if needed */}
          </div>

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
              title={t('refreshPermissions')}
            >
              <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            {/* Language Toggle Button - FORCED VISIBILITY */}
            <button
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-95 z-[70] relative ring-2 ring-slate-200 dark:ring-slate-700"
              title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
              style={{ display: 'block', visibility: 'visible' }}
            >
              <span className="text-lg leading-none block">{language === 'pt' ? '🇧🇷' : '🇺🇸'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full relative transition-colors"
                title={t('notifications')}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-card">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
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
                      <h3 className="font-semibold text-slate-900 dark:text-white">{t('notifications')}</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-4 text-center text-slate-500">
                          <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            {t('notificationsEmpty')}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('notificationsEmptyDesc')}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => {
                                markAsRead(notification.id);
                                if (notification.link) {
                                  window.location.href = notification.link;
                                }
                                setIsNotificationOpen(false);
                              }}
                              className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                }`}
                            >
                              <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'
                                    }`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                    {new Date(notification.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-95"
              title={darkMode ? t('lightMode') : t('darkMode')}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Help Button - Opens AiFlow */}
            <button
              onClick={() => {
                const aiflowButton = document.querySelector('[aria-label="Aiflow Technical Support"]') as HTMLButtonElement;
                if (aiflowButton) {
                  aiflowButton.click();
                }
              }}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all"
              title={t('help')}
            >
              <HelpCircle size={20} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-acai-900 to-acai-700 flex items-center justify-center text-white text-sm font-bold ring-2 ring-solimoes-400/20">
                  {userInitials}
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {profile?.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {profile?.role === 'admin' ? t('admin') : t('user')}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        {t('editProfile')}
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area - Route-aware overflow handling */}
        {/* Boards & AI Hub use overflow-hidden + h-full for Kanban/chat layouts */}
        {/* All other pages use overflow-y-auto for normal scrolling */}
        <main
          className={`flex-1 w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-dark-bg pt-16 md:pt-0 pb-safe
            ${['/boards', '/ai'].some(p => location.pathname.startsWith(p))
              ? 'overflow-hidden flex flex-col'
              : 'overflow-y-auto'
            }`}
        >
          <div className={['/boards', '/ai'].some(p => location.pathname.startsWith(p)) ? 'flex-1 overflow-hidden flex flex-col h-full' : 'h-full'}>
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Widget - Omnipresent */}
      <FloatingAIWidget isAuthenticated={!!profile} />

      {/* Aiflow Technical Support - Hub Routes Only */}
      <AiflowSupport />
    </div>
  );
};

export default Layout;
