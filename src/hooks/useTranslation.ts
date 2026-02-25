import { useLanguage } from '@/context/LanguageContext';

export const useTranslation = () => {
    const { t, language } = useLanguage();
    return { t, language };
};
