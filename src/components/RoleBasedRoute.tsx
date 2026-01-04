import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
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
    const location = useLocation();
    const [hasShownToast, setHasShownToast] = React.useState(false);

    // Show loader while checking auth
    if (loading || isInitialized === null) {
        return <PageLoader />;
    }

    // Redirect to setup if not initialized
    if (!isInitialized) {
        return <Navigate to="/setup" replace />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Wait for profile to load
    if (!profile) {
        return <PageLoader />;
    }

    // Check if user's role is allowed
    const userRole = profile.role || 'unknown';
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
        // Show toast only once
        if (!hasShownToast) {
            addToast('Acesso não autorizado para seu perfil.', 'error');
            setHasShownToast(true);
        }

        // Redirect based on role
        if (userRole === 'cliente' || userRole === 'cliente_restrito') {
            return <Navigate to="/portal" replace />;
        }

        // Unknown role - redirect to login
        return <Navigate to="/login" replace />;
    }

    // User has permission - render children
    return <>{children}</>;
};
