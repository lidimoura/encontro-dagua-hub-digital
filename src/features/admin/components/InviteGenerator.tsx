import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { Copy, Mail, Gift, ExternalLink } from 'lucide-react';

interface InviteGeneratorProps {
    onInviteGenerated?: () => void;
}

export const InviteGenerator: React.FC<InviteGeneratorProps> = ({ onInviteGenerated }) => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [offerDiscount, setOfferDiscount] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');

    const generateInvite = async () => {
        setGenerating(true);
        try {
            // Generate unique token
            const token = crypto.randomUUID();

            // Insert into company_invites table
            const { error } = await supabase
                .from('company_invites')
                .insert({
                    token,
                    email: email || null,
                    offer_discount: offerDiscount,
                    expires_at: null, // No expiration for now
                });

            if (error) throw error;

            // Generate invite link
            const inviteLink = `${window.location.origin}/#/join?token=${token}`;
            setGeneratedLink(inviteLink);

            showToast(
                offerDiscount
                    ? 'Link de convite com 20% OFF gerado!'
                    : 'Link de convite gerado!',
                'success'
            );

            onInviteGenerated?.();
        } catch (error: any) {
            console.error('Error generating invite:', error);
            showToast('Erro ao gerar convite. Tente novamente.', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        showToast('Link copiado!', 'success');
    };

    const sendViaWhatsApp = () => {
        const message = offerDiscount
            ? `Olá! Você foi convidado para o Encontro D'água Hub com 20% de desconto na primeira mensalidade! 🎉\n\nCadastre-se aqui: ${generatedLink}`
            : `Olá! Você foi convidado para o Encontro D'água Hub!\n\nCadastre-se aqui: ${generatedLink}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-solimoes-400/20 dark:border-solimoes-400/10 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
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

            <div className="space-y-4">
                {/* Email Input (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email (Opcional)
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@exemplo.com"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Se preenchido, o email será pré-preenchido no cadastro
                    </p>
                </div>

                {/* Discount Checkbox */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-solimoes-50 dark:from-amber-900/10 dark:to-solimoes-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={offerDiscount}
                            onChange={(e) => setOfferDiscount(e.target.checked)}
                            className="mt-1 w-4 h-4 text-amber-600 bg-white dark:bg-rionegro-950 border-amber-300 dark:border-amber-700 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
                                <Gift className="w-4 h-4" />
                                Oferecer 20% de desconto na 1ª mensalidade
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                O usuário receberá um cupom de 20% OFF ao se cadastrar
                            </p>
                        </div>
                    </label>
                </div>

                {/* Generate Button */}
                <button
                    onClick={generateInvite}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-acai-900 to-acai-700 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-acai-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Gerando...
                        </>
                    ) : (
                        <>
                            <Mail className="w-5 h-5" />
                            Gerar Link de Convite
                        </>
                    )}
                </button>

                {/* Generated Link Display */}
                {generatedLink && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-in fade-in duration-300">
                        <label className="block text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                            ✅ Link Gerado com Sucesso!
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-white dark:bg-rionegro-950 border border-green-200 dark:border-green-800 rounded-lg mb-3">
                            <input
                                type="text"
                                value={generatedLink}
                                readOnly
                                className="flex-1 bg-transparent border-none text-sm font-mono text-slate-900 dark:text-white focus:ring-0 p-0"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyToClipboard}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                            >
                                <Copy size={16} />
                                Copiar Link
                            </button>
                            <button
                                onClick={sendViaWhatsApp}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                            >
                                <ExternalLink size={16} />
                                Enviar no WhatsApp
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
