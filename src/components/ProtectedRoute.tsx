import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from './PageLoader';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile, loading, isInitialized } = useAuth();
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

    // ── V5.3: Verificar expiração do trial Provadágua ─────────────────────────
    // Se o usuário tem tag 'provadagua-trial' E access_expires_at expirou → trial-expired
    // Apenas aplica para usuários com tag trial (não para admins)
    if (profile && !profile.is_super_admin) {
        const isTrialUser = profile.access_level?.includes('provadagua-trial') ||
                            profile.access_level?.includes('trial-7d') ||
                            profile.access_level?.includes('provadagua');

        if (isTrialUser) {
            const expiresAt = (profile as any).access_expires_at as string | null | undefined;

            if (expiresAt) {
                const expiry = new Date(expiresAt);
                const now    = new Date();

                if (expiry < now) {
                    // Trial expirado — redirecionar para upsell (mas não se já estiver lá)
                    if (location.pathname !== '/trial-expired') {
                        return <Navigate to="/trial-expired" replace />;
                    }
                }
            }
        }
    }

    return <>{children}</>;
};
