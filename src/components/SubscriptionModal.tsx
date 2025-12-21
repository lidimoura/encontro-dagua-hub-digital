import React from 'react';
import { X } from 'lucide-react';
import { PLANS, formatPrice, getIntervalLabel } from '@/lib/plans';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Payment link - can be configured here or moved to environment variables
const PAYMENT_LINK_MONTHLY = 'https://pay.kiwify.com.br/YOUR_MONTHLY_LINK'; // TODO: Replace with actual link
const PAYMENT_LINK_YEARLY = 'https://pay.kiwify.com.br/YOUR_YEARLY_LINK'; // TODO: Replace with actual link

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const monthlyPlan = PLANS.find(p => p.id === 'pro_monthly');
    const yearlyPlan = PLANS.find(p => p.id === 'pro_yearly');

    const handleSubscribe = (planType: 'monthly' | 'yearly') => {
        const link = planType === 'monthly' ? PAYMENT_LINK_MONTHLY : PAYMENT_LINK_YEARLY;
        window.open(link, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    aria-label="Fechar"
                >
                    <X size={20} className="text-slate-600 dark:text-slate-400" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-2">Escolha seu Plano</h2>
                    <p className="text-white/90">Desbloqueie todo o potencial do Hub</p>
                </div>

                {/* Plans */}
                <div className="p-8 grid md:grid-cols-2 gap-6">
                    {/* Monthly Plan */}
                    {monthlyPlan && (
                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-fuchsia-500 transition">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {monthlyPlan.name}
                                </h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-fuchsia-600">
                                        {formatPrice(monthlyPlan.price)}
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {getIntervalLabel(monthlyPlan.interval)}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {monthlyPlan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe('monthly')}
                                className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-bold transition shadow-lg"
                            >
                                Assinar Agora
                            </button>
                        </div>
                    )}

                    {/* Yearly Plan */}
                    {yearlyPlan && (
                        <div className="border-2 border-fuchsia-500 rounded-xl p-6 relative bg-fuchsia-50 dark:bg-fuchsia-900/10">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                RECOMENDADO
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {yearlyPlan.name}
                                </h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-fuchsia-600">
                                        {formatPrice(yearlyPlan.price)}
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {getIntervalLabel(yearlyPlan.interval)}
                                    </span>
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                                    Pague 10, Leve 12 meses!
                                </p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {yearlyPlan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe('yearly')}
                                className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-lg font-bold transition shadow-lg"
                            >
                                Assinar Agora
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="px-8 pb-8">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>💡 Ativação Manual:</strong> Após o pagamento, sua conta será ativada manualmente pela equipe em até 24h.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
