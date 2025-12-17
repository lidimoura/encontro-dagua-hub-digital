import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePersistedState } from '@/hooks/usePersistedState';

/**
 * DefaultRoute - Handles the default route navigation for the application
 * 
 * This component redirects users to their preferred default route (stored in localStorage).
 * If no default route is set, it defaults to '/dashboard'.
 * Also handles special cases for Inbox view modes (list/focus).
 * 
 * @returns {JSX.Element} A Navigate component that redirects to the appropriate route
 * 
 * @example
 * // In router configuration:
 * <Route path="/" element={<DefaultRoute />} />
 */
export const DefaultRoute: React.FC = () => {
    // Default to /dashboard if not set
    const [defaultRoute] = usePersistedState<string>('crm_default_route', '/dashboard');

    let target = defaultRoute === '/' ? '/dashboard' : defaultRoute;

    // Handle specific Inbox modes
    if (target === '/inbox-list') {
        localStorage.setItem('inbox_view_mode', JSON.stringify('list'));
        target = '/inbox';
    } else if (target === '/inbox-focus') {
        localStorage.setItem('inbox_view_mode', JSON.stringify('focus'));
        target = '/inbox';
    }

    return <Navigate to={target} replace />;
};
