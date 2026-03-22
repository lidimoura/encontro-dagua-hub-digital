import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/lib/translations';
import { DEFAULT_LANG } from '@/lib/appConfig';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Use DEFAULT_LANG from appConfig (driven by VITE_APP_MODE env var):
    // DEMO → 'en'  |  PRODUCTION → 'pt'
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANG);

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

    useEffect(() => {
        // Update HTML lang attribute
        document.documentElement.lang = language;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
