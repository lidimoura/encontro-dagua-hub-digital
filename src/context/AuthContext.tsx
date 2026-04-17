import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
    id: string;
    email: string;
    company_id: string;
    role: 'admin' | 'equipe' | 'cliente' | 'cliente_restrito' | 'user' | 'super_admin';
    user_type?: 'team_member' | 'client';
    first_name?: string | null;
    last_name?: string | null;
    nickname?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    referred_by?: string | null; // UUID of user who referred this user
    discount_credits: number; // Number of 20% discount coupons accumulated
    is_super_admin?: boolean; // Super admin flag for global access
    status?: string; // God Mode: User status (active, inactive, etc)
    access_level?: string[]; // God Mode: Access permissions array
    access_expires_at?: string | null; // Trial expiry timestamp (ISO)
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isInitialized: boolean | null;
    checkInitialization: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState<boolean | null>(null);

    const checkInitialization = async () => {
        try {
            const { data, error } = await supabase.rpc('is_instance_initialized');
            if (error) throw error;
            setIsInitialized(data);
        } catch (error) {
            console.error('Error checking initialization:', error);
            setIsInitialized(true);
        }
    };

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle(); // V6.3: maybeSingle evita PGRST116 (406) quando perfil ainda não existe

            if (error) {
                // Erro real de rede/RLS — log mas não bloqueia
                console.warn('[AuthContext] Erro ao buscar perfil (não bloqueante):', error);
            }

            if (data) {
                setProfile(data);
            } else {
                // Perfil ainda não criado (delay pós-signup) ou not found
                // Fica null — ProtectedRoute lida com isso roteando para dashboard mesmo assim
                console.info('[AuthContext] Perfil não encontrado para', userId, '— usando perfil temporário');
                setProfile(null);
            }
        } catch (e) {
            // Captura qualquer excessão inesperada — nunca trava o loading
            console.warn('[AuthContext] Excessão em fetchProfile:', e);
        } finally {
            // SEMPRE libera o loading — usuário nunca fica preso
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user?.id) {
            await fetchProfile(user.id);
        }
    };

    useEffect(() => {
        checkInitialization();

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
    };

    const value = {
        session,
        user,
        profile,
        loading,
        isInitialized,
        checkInitialization,
        signOut,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
