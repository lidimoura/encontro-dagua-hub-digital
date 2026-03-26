import React from 'react';
import { Sparkles, ArrowRight, X, DollarSign } from 'lucide-react';
import { IS_DEMO } from '@/lib/appConfig';
import { useLanguage, CurrencyCode } from '@/context/LanguageContext';

/**
 * Props for the OnboardingModal component
 */
interface OnboardingModalProps {
    isOpen: boolean;
    onStart: () => void;
    onSkip: () => void;
}

const CURRENCY_OPTIONS: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'BRL', label: 'Real Brasileiro', symbol: 'R$' },
];

/**
 * OnboardingModal - First-time user onboarding experience
 */
export const OnboardingModal: React.FC<OnboardingModalProps> = ({
    isOpen,
    onStart,
    onSkip
}) => {
    const { currency, setCurrency } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            <div className="relative z-10 w-full max-w-2xl mx-4">
                {/* Main Card */}
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Skip Button */}
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Content */}
                    <div className="p-12 text-center text-white">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Sparkles size={40} className="text-white" />
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold mb-4">
                            Welcome to your CRM! 👋
                        </h1>

                        {/* Description */}
                        <p className="text-xl text-white/90 mb-8 max-w-xl mx-auto">
                            Let's set up your <strong>first personalised board</strong> in under 30 seconds.
                        </p>

                        {/* Currency selector — Demo mode only */}
                        {IS_DEMO && (
                            <div className="mb-8">
                                <div className="flex items-center justify-center gap-2 mb-3 text-white/80">
                                    <DollarSign size={16} />
                                    <span className="text-sm font-semibold uppercase tracking-wide">Preferred Currency</span>
                                </div>
                                <div className="flex justify-center gap-3 flex-wrap">
                                    {CURRENCY_OPTIONS.map(opt => (
                                        <button
                                            key={opt.code}
                                            onClick={() => setCurrency(opt.code)}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                                currency === opt.code
                                                    ? 'bg-white text-primary-600 shadow-lg scale-105'
                                                    : 'bg-white/15 text-white hover:bg-white/25'
                                            }`}
                                        >
                                            {opt.symbol} {opt.code}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-white/55 mt-2">
                                    You can change this later in Settings
                                </p>
                            </div>
                        )}

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl mb-2">🎯</div>
                                <h3 className="font-semibold mb-1">Ready Templates</h3>
                                <p className="text-sm text-white/80">Sales, Onboarding, CS and more</p>
                            </div>

                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl mb-2">✨</div>
                                <h3 className="font-semibold mb-1">AI Creation</h3>
                                <p className="text-sm text-white/80">Describe your business in 1 sentence</p>
                            </div>

                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl mb-2">⚡</div>
                                <h3 className="font-semibold mb-1">Super Fast</h3>
                                <p className="text-sm text-white/80">Less than 30 seconds</p>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={onStart}
                                className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                            >
                                Get started
                                <ArrowRight size={20} />
                            </button>

                            <button
                                onClick={onSkip}
                                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
                            >
                                Explore on my own
                            </button>
                        </div>

                        {/* Small print */}
                        <p className="mt-6 text-sm text-white/60">
                            You can create as many boards as you like later 😊
                        </p>
                    </div>
                </div>

                {/* Bottom gradient decoration */}
                <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl -z-10" />
            </div>
        </div>
    );
};
