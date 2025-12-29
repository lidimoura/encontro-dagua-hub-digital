import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-dark-secondary hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group"
            title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon (Light Mode) */}
                <Sun
                    className={`absolute inset-0 w-5 h-5 text-gold transition-all duration-300 ${darkMode
                            ? 'opacity-0 rotate-90 scale-0'
                            : 'opacity-100 rotate-0 scale-100'
                        }`}
                />
                {/* Moon Icon (Dark Mode) */}
                <Moon
                    className={`absolute inset-0 w-5 h-5 text-wine transition-all duration-300 ${darkMode
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    );
};
