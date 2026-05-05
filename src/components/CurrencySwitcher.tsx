import React from 'react';
import { useLanguage, CurrencyCode } from '@/context/LanguageContext';

interface CurrencySwitcherProps {
  variant?: 'header' | 'full';
  className?: string;
}

const CURRENCIES: { code: CurrencyCode; flag: string; label: string }[] = [
  { code: 'BRL', flag: '🇧🇷', label: 'R$' },
  { code: 'USD', flag: '🇺🇸', label: '$' },
  { code: 'AUD', flag: '🇦🇺', label: 'A$' },
];

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { currency, setCurrency } = useLanguage();

  const current = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];

  if (variant === 'header') {
    // Compact cycle button — matches the language toggle style in Layout.tsx
    return (
      <button
        id="btn-currency-switcher"
        onClick={() => {
          const idx = CURRENCIES.findIndex(c => c.code === currency);
          const next = CURRENCIES[(idx + 1) % CURRENCIES.length];
          setCurrency(next.code);
        }}
        className={`p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-95 relative ring-2 ring-slate-200 dark:ring-slate-700 ${className}`}
        title={`Currency: ${current.code} — click to switch`}
      >
        <span className="text-[11px] font-bold leading-none block tabular-nums">
          {current.label}
        </span>
      </button>
    );
  }

  // Full select variant — for Settings page
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {CURRENCIES.map(c => (
        <button
          key={c.code}
          onClick={() => setCurrency(c.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            currency === c.code
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
          }`}
        >
          <span>{c.flag}</span>
          <span>{c.code}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * Utility: format a number with the active currency symbol.
 * Usage: formatCurrency(1500, currency) → "R$ 1.500" / "$ 1,500" / "A$ 1,500"
 */
export function formatCurrency(value: number, currency: CurrencyCode): string {
  const localeMap: Record<CurrencyCode, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    AUD: 'en-AU',
  };

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
