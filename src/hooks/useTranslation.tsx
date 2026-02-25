import { useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';

export const useTranslation = () => {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        // Check URL query parameter ?lang=en or ?lang=pt
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');

        if (urlLang === 'en' || urlLang === 'pt') {
            setLanguage(urlLang);
            localStorage.setItem('language', urlLang);
        } else {
            // Check localStorage
            const savedLang = localStorage.getItem('language') as Language;
            if (savedLang === 'en' || savedLang === 'pt') {
                setLanguage(savedLang);
            }
        }
    }, []);

    const t = (key: keyof typeof translations.pt): string => {
        return translations[language][key] || key;
    };

    const switchLanguage = (newLang: Language) => {
        setLanguage(newLang);
        localStorage.setItem('language', newLang);

        // Update URL without reload
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLang);
        window.history.pushState({}, '', url.toString());
    };

    return { t, language, switchLanguage };
};
