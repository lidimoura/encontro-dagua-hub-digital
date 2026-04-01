import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
    variant?: 'default' | 'compact';
    className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    variant = 'default',
    className = ''
}) => {
    const { language, setLanguage } = useLanguage();

    const btnClass = (lang: Language) =>
        `px-2 py-1 text-xs font-medium rounded transition-all ${
            language === lang
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`;

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                <button onClick={() => setLanguage('pt')} className={btnClass('pt')}>PT</button>
                <button onClick={() => setLanguage('en')} className={btnClass('en')}>EN</button>
                <button onClick={() => setLanguage('es')} className={btnClass('es')}>ES</button>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Globe size={16} className="text-slate-500 dark:text-slate-400" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
            >
                <option value="pt">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
            </select>
        </div>
    );
};
