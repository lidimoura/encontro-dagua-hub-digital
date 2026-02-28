import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from './PageLoader';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, isInitialized } = useAuth();
    const location = useLocation();

    // Wait for auth to fully load before making decisions
    if (loading || isInitialized === null) {
        return <PageLoader />;
    }

    // Check if app needs setup
    if (!isInitialized) {
        return <Navigate to="/setup" replace />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
