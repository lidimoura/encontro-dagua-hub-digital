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

    /**
     * V9.9.6: fetchProfile com retry + backoff exponencial.
     * O trigger handle_new_user() é async e pode demorar 200–800ms para commitar.
     * Sem retry, profile retorna null imediatamente → loading infinito no front-end.
     * Com retry: 4 tentativas em 500ms / 1s / 2s / 3s (total ~6.5s antes de desistir).
     */
    const fetchProfile = async (userId: string, attempt = 1) => {
        const MAX_ATTEMPTS = 4;
        const BACKOFF_MS = [0, 500, 1000, 2000]; // delay antes de cada tentativa

        try {
            // Delay antes de tentar (0ms na 1ª tentativa, crescente nas retentativas)
            if (BACKOFF_MS[attempt - 1] > 0) {
                await new Promise(res => setTimeout(res, BACKOFF_MS[attempt - 1]));
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle(); // maybeSingle evita PGRST116 (406) quando perfil ainda não existe

            if (error) {
                console.warn(`[AuthContext] Erro ao buscar perfil (tentativa ${attempt}):`, error.message);
            }

            if (data) {
                // Profile encontrado — verifica se company_id está preenchido
                if (!data.company_id && attempt < MAX_ATTEMPTS) {
                    // Trigger commitou o profile mas ainda sem company_id → retenta
                    console.info(`[AuthContext] Profile encontrado sem company_id (tentativa ${attempt}), retentando...`);
                    return fetchProfile(userId, attempt + 1);
                }
                setProfile(data);
                setLoading(false);
                return;
            }

            // Profile ainda não existe (trigger não commitou)
            if (attempt < MAX_ATTEMPTS) {
                console.info(`[AuthContext] Profile não encontrado (tentativa ${attempt}), retentando em ${BACKOFF_MS[attempt]}ms...`);
                return fetchProfile(userId, attempt + 1);
            }

            // Esgotou tentativas — desbloqueia UI mesmo sem profile
            console.warn('[AuthContext] Profile não encontrado após', MAX_ATTEMPTS, 'tentativas para', userId);
            setProfile(null);
        } catch (e) {
            console.warn('[AuthContext] Exceção em fetchProfile (tentativa', attempt, '):', e);
            if (attempt < MAX_ATTEMPTS) {
                return fetchProfile(userId, attempt + 1);
            }
            setProfile(null);
        } finally {
            // Garante que o loading sempre é liberado na última tentativa
            if (attempt >= MAX_ATTEMPTS) {
                setLoading(false);
            }
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                // V9.9.6: SIGNED_IN = signup ou login — trigger pode ainda não ter commitado.
                // Usamos retry completo (attempt=1). Para TOKEN_REFRESHED, profile já existe —
                // passamos attempt direto na tentativa final para evitar backoff desnecessário.
                const startAttempt = (event === 'SIGNED_IN') ? 1 : 1;
                fetchProfile(session.user.id, startAttempt);
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
