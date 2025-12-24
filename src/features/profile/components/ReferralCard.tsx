import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Copy, Share2, Gift, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export const ReferralCard: React.FC = () => {
    const { profile } = useAuth();
    const { showToast } = useToast();
    const [referralStats, setReferralStats] = useState({ count: 0, credits: 0 });
    const [loading, setLoading] = useState(true);

    const referralLink = profile ? `${window.location.origin}/#/join?ref=${profile.id}` : '';

    useEffect(() => {
        const fetchReferralStats = async () => {
            if (!profile?.id) return;

            try {
                // Count how many users this person referred
                const { count, error } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('referred_by', profile.id);

                if (!error) {
                    setReferralStats({
                        count: count || 0,
                        credits: profile.discount_credits || 0,
                    });
                }
            } catch (error) {
                console.error('Error fetching referral stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferralStats();
    }, [profile]);

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        showToast('Link de indicação copiado!', 'success');
    };

    const shareWhatsApp = () => {
        const message = `Ei! 🌟 Entra no Encontro D'água Hub comigo e ganha 20% de desconto na primeira mensalidade!

Use meu link exclusivo: ${referralLink}

É um hub completo com QR Codes, CRM e IA para empreendedores. Vale muito a pena! 💜`;

        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!profile) return null;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-solimoes-50 dark:from-amber-900/10 dark:to-solimoes-900/10 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Indique e Ganhe
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        20% OFF para você e seu amigo!
                    </p>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Convide um amigo para o Hub! <strong>Ele ganha 20% de desconto</strong> na primeira mensalidade e <strong>você também ganha 20% OFF</strong> na próxima mensalidade.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white dark:bg-rionegro-900 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Indicações</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {loading ? '...' : referralStats.count}
                    </p>
                </div>
                <div className="bg-white dark:bg-rionegro-900 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Cupons</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {loading ? '...' : referralStats.credits}
                    </p>
                </div>
            </div>

            {/* Referral Link */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Seu Link Exclusivo:
                </label>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-rionegro-900 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-transparent border-none text-sm font-mono text-slate-900 dark:text-white focus:ring-0 p-0"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all"
                >
                    <Copy size={18} />
                    Copiar Link
                </button>
                <button
                    onClick={shareWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                >
                    <Share2 size={18} />
                    WhatsApp
                </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-white/50 dark:bg-rionegro-900/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    💡 <strong>Como funciona:</strong> Compartilhe seu link. Quando alguém se cadastrar usando ele, vocês dois ganham 20% de desconto!
                </p>
            </div>
        </div>
    );
};
