import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/lib/translations';
import { DEFAULT_LANG, IS_DEMO } from '@/lib/appConfig';

export type CurrencyCode = 'BRL' | 'AUD' | 'USD';

const CURRENCY_STORAGE_KEY = 'crm_preferred_currency';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Use DEFAULT_LANG from appConfig (driven by VITE_APP_MODE env var):
    // DEMO → 'en'  |  PRODUCTION → 'pt'
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANG);

    // Currency: fixed BRL on hub; user-selectable on demo
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        if (!IS_DEMO) return 'BRL';
        const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
        return stored || 'AUD'; // Default to AUD for the demo/provadagua branch
    });

    // Translation function
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        // Fallback to PT-BR if key is missing in selected language
        if (typeof value !== 'string') {
            value = translations['pt'];
            for (const k of keys) {
                value = value?.[k];
            }
        }

        return typeof value === 'string' ? value : key;
    };

    // Update localStorage when language changes
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language_v2', lang);
    };

    const setCurrency = (c: CurrencyCode) => {
        setCurrencyState(c);
        if (IS_DEMO) {
            localStorage.setItem(CURRENCY_STORAGE_KEY, c);
        }
    };

    useEffect(() => {
        // Update HTML lang attribute
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
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

