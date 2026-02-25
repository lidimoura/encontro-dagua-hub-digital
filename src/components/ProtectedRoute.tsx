import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from './PageLoader';

/**
 * ProtectedRoute - Route wrapper that requires authentication
 * 
 * Protects routes from unauthorized access by checking authentication status.
 * Redirects to login if user is not authenticated, or to setup if app is not initialized.
 * Shows a loading spinner while authentication state is being determined.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The protected content to render if authenticated
 * @returns {JSX.Element} The protected children, a loader, or a redirect
 * 
 * @example
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, isInitialized, session } = useAuth();
    const location = useLocation();

    // NEXUS DEBUG: Log auth state on every render
    console.log("🔒 NEXUS DEBUG: ProtectedRoute Auth State", {
        path: location.pathname,
        hasUser: !!user,
        hasSession: !!session,
        loading,
        isInitialized,
        timestamp: new Date().toISOString()
    });

    // Wait for auth to fully load before making decisions
    if (loading || isInitialized === null) {
        console.log("⏳ NEXUS DEBUG: ProtectedRoute - Waiting for auth to load");
        return <PageLoader />;
    }

    // Check if app needs setup
    if (!isInitialized) {
        console.log('🔒 NEXUS DEBUG: Redirecting to /setup - not initialized');
        return <Navigate to="/setup" replace />;
    }

    if (!user) {
        console.log('🔒 NEXUS DEBUG: Redirecting to /login - no user', { from: location.pathname });
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('✅ NEXUS DEBUG: Access granted', { user: user.email, path: location.pathname });
    return <>{children}</>;
};
