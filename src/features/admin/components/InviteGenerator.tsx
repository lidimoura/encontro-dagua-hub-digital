import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/hooks/useTranslation';
import { Copy, Check } from 'lucide-react';

interface InviteGeneratorProps {
    onInviteGenerated?: () => void;
}

export const InviteGenerator: React.FC<InviteGeneratorProps> = ({ onInviteGenerated }) => {
    const { t } = useTranslation();
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const generateInvite = async () => {
        // LOBOTOMY: Pure JavaScript, NO React states, NO modal
        document.body.style.cursor = 'wait';

        try {
            // Generate unique token
            const token = crypto.randomUUID();

            // Insert into company_invites table
            const { error } = await supabase
                .from('company_invites')
                .insert({
                    token,
                    email: null,
                    offer_discount: false,
                    expires_at: null,
                });

            document.body.style.cursor = 'default';

            if (error) throw error;

            // Generate invite link (dynamic domain)
            const inviteLink = `${window.location.origin}/#/join?token=${token}`;
            
            setGeneratedLink(inviteLink);
            setCopied(false);

            onInviteGenerated?.();
        } catch (error: any) {
            document.body.style.cursor = 'default';
            alert('Falha ao gerar convite: ' + error.message);
        }
    };

    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-solimoes-400/20 dark:border-solimoes-400/10 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📧</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t('generateInviteLink')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('inviteUsersDesc')}
                    </p>
                </div>
            </div>

            {/* LOBOTOMY: Pure div button, NO form, NO modal */}
            <div
                role="button"
                tabIndex={0}
                onClick={generateInvite}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        generateInvite();
                    }
                }}
                className="cursor-pointer w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-acai-900/20 text-sm font-bold text-white bg-acai-900 hover:bg-acai-800 transition-all active:scale-[0.98] select-none"
            >
                {t('generateInviteButton')}
            </div>

            {generatedLink && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link de Convite</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="flex-1 bg-white dark:bg-rionegro-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                            onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                            onClick={handleCopy}
                            className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                                copied 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                    : 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800/40'
                            }`}
                            title="Copiar Link"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
