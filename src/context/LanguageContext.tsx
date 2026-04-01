import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language } from '@/lib/translations';
import { DEFAULT_LANG, IS_DEMO } from '@/lib/appConfig';
import { supabase } from '@/lib/supabase';

export type CurrencyCode = 'BRL' | 'AUD' | 'USD';

const CURRENCY_STORAGE_KEY = 'crm_preferred_currency';
const LANG_STORAGE_KEY     = 'app_language_v3';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
        if (stored && ['pt', 'en', 'es'].includes(stored)) return stored;
        return DEFAULT_LANG;
    });

    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        if (!IS_DEMO) return 'BRL';
        const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
        return stored || 'AUD';
    });

    // Track authenticated user ID for DB writes
    const [userId, setUserId] = useState<string | null>(null);

    /**
     * On auth state change: load profile preferences from DB.
     * Priority: DB > localStorage > DEFAULT_LANG
     * This runs independently of AuthContext to avoid circular deps.
     */
    useEffect(() => {
        // Helper to fetch and apply preferences from DB
        const applyProfilePreferences = async (uid: string) => {
            const { data, error } = await supabase
                .from('profiles')
                .select('preferred_language, preferred_currency')
                .eq('id', uid)
                .maybeSingle();

            if (error || !data) return;

            if (data.preferred_language && ['pt', 'en', 'es'].includes(data.preferred_language)) {
                const lang = data.preferred_language as Language;
                setLanguageState(lang);
                localStorage.setItem(LANG_STORAGE_KEY, lang);
            }

            if (IS_DEMO && data.preferred_currency && ['BRL', 'AUD', 'USD'].includes(data.preferred_currency)) {
                const curr = data.preferred_currency as CurrencyCode;
                setCurrencyState(curr);
                localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
            }
        };

        // Get current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id);
                applyProfilePreferences(session.user.id);
            }
        });

        // Subscribe to auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                applyProfilePreferences(session.user.id);
            } else {
                setUserId(null);
                // On logout: reset to defaults
                setLanguageState(DEFAULT_LANG);
                if (IS_DEMO) setCurrencyState('AUD');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Translation — trilingual fallback chain: ES → EN → PT
     * Guarantees zero empty strings while ES translations fill in.
     */
    const t = useCallback((key: string): string => {
        const keys = key.split('.');

        const resolve = (lang: Language): string | undefined => {
            let value: any = translations[lang];
            for (const k of keys) value = value?.[k];
            return typeof value === 'string' ? value : undefined;
        };

        const primary = resolve(language);
        if (primary !== undefined) return primary;

        if (language === 'es') {
            const enFallback = resolve('en');
            if (enFallback !== undefined) return enFallback;
        }

        return resolve('pt') ?? key;
    }, [language]);

    /**
     * setLanguage: instant UI + localStorage + fire-and-forget DB write.
     * Never blocks the user.
     */
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LANG_STORAGE_KEY, lang);

        if (userId) {
            supabase
                .from('profiles')
                .update({ preferred_language: lang })
                .eq('id', userId)
                .then(({ error }) => {
                    if (error) console.warn('[LanguageCtx] DB language persist failed:', error.message);
                    else console.log(`[LanguageCtx] ✅ Language saved to DB: ${lang}`);
                });
        }
    }, [userId]);

    /**
     * setCurrency: instant UI + localStorage + fire-and-forget DB write.
     */
    const setCurrency = useCallback((c: CurrencyCode) => {
        setCurrencyState(c);
        if (IS_DEMO) {
            localStorage.setItem(CURRENCY_STORAGE_KEY, c);

            if (userId) {
                supabase
                    .from('profiles')
                    .update({ preferred_currency: c })
                    .eq('id', userId)
                    .then(({ error }) => {
                        if (error) console.warn('[LanguageCtx] DB currency persist failed:', error.message);
                        else console.log(`[LanguageCtx] ✅ Currency saved to DB: ${c}`);
                    });
            }
        }
    }, [userId, IS_DEMO]);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, currency, setCurrency }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
