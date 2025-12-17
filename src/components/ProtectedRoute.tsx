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
    const { user, loading, isInitialized } = useAuth();
    const location = useLocation();

    if (loading || isInitialized === null) {
        return <PageLoader />;
    }

    if (!isInitialized) {
        return <Navigate to="/setup" replace />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
