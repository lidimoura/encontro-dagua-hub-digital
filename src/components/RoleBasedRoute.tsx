import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { PageLoader } from './PageLoader';

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

/**
 * RoleBasedRoute - Route wrapper that requires specific roles
 * 
 * Protects routes from unauthorized access by checking both authentication
 * and user role. Redirects based on user type if access is denied.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The protected content
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @returns {JSX.Element} The protected children, a loader, or a redirect
 */
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
    const { user, profile, loading, isInitialized } = useAuth();
    const { addToast } = useToast();
    const { t } = useTranslation();
    const location = useLocation();
    const [hasShownToast, setHasShownToast] = React.useState(false);

    // NEXUS DEBUG: Log role-based access check
    React.useEffect(() => {
        console.log('🛡️ NEXUS DEBUG: RoleBasedRoute Check', {
            path: location.pathname,
            userRole: profile?.role || 'NO_PROFILE',
            allowedRoles,
            isAllowed: profile ? allowedRoles.includes(profile.role) : false,
            loading,
            hasProfile: !!profile,
            timestamp: new Date().toISOString()
        });
    }, [profile, allowedRoles, loading, location.pathname]);

    // Show loader while checking auth
    if (loading || isInitialized === null) {
        console.log('🛡️ NEXUS DEBUG: RoleBasedRoute showing loader', { loading, isInitialized });
        return <PageLoader />;
    }

    // Redirect to setup if not initialized
    if (!isInitialized) {
        console.log('🛡️ NEXUS DEBUG: RoleBasedRoute redirecting to /setup');
        return <Navigate to="/setup" replace />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        console.log('🛡️ NEXUS DEBUG: RoleBasedRoute redirecting to /login - no user');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Wait for profile to load
    if (!profile) {
        console.log('🛡️ NEXUS DEBUG: RoleBasedRoute waiting for profile');
        return <PageLoader />;
    }

    // Check if user's role is allowed
    const userRole = profile.role || 'unknown';
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
        console.log('❌ NEXUS DEBUG: Access DENIED', {
            userRole,
            allowedRoles,
            path: location.pathname
        });

        // Show toast only once
        if (!hasShownToast) {
            addToast(t('accessDenied'), 'error');
            setHasShownToast(true);
        }

        // Redirect based on role
        if (userRole === 'cliente' || userRole === 'cliente_restrito') {
            console.log('🛡️ NEXUS DEBUG: Redirecting cliente to /portal');
            return <Navigate to="/portal" replace />;
        }

        // Unknown role - redirect to login
        console.log('🛡️ NEXUS DEBUG: Unknown role, redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    console.log('✅ NEXUS DEBUG: Role-based access GRANTED', { userRole, path: location.pathname });
    // User has permission - render children
    return <>{children}</>;
};
