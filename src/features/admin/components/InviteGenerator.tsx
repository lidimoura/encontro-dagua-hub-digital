import React from 'react';
import { supabase } from '@/lib/supabase';

interface InviteGeneratorProps {
    onInviteGenerated?: () => void;
}

export const InviteGenerator: React.FC<InviteGeneratorProps> = ({ onInviteGenerated }) => {
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

            // Generate invite link
            const inviteLink = `${window.location.origin}/#/join?token=${token}`;

            // PURE WINDOW.PROMPT - Works on ANY mobile device
            window.prompt("✅ CONVITE CRIADO! COPIE ABAIXO:", inviteLink);

            onInviteGenerated?.();
        } catch (error: any) {
            document.body.style.cursor = 'default';
            alert("Erro ao gerar convite: " + error.message);
        }
    };

    return (
        <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-solimoes-400/20 dark:border-solimoes-400/10 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📧</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Gerar Link de Convite
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Convide novos usuários para o Hub
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
                className="cursor-pointer w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-acai-900/20 text-sm font-bold text-white bg-acai-900 hover:bg-acai-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acai-900 transition-all active:scale-[0.98] select-none"
            >
                GERAR CONVITE (ANTI-CRASH)
            </div>
        </div>
    );
};
