import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
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

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                <button
                    onClick={() => setLanguage('pt')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-all ${language === 'pt'
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    PT
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-all ${language === 'en'
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    EN
                </button>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Globe size={16} className="text-slate-500 dark:text-slate-400" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'pt' | 'en')}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
            >
                <option value="pt">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
            </select>
        </div>
    );
};
