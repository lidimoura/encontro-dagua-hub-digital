import React, { useState } from 'react';
import { Sparkles, Copy, Send, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

interface MazoInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactName: string;
    contactEmail: string;
    contactId: string;
}

export const MazoInviteModal: React.FC<MazoInviteModalProps> = ({
    isOpen,
    onClose,
    contactName,
    contactEmail,
    contactId,
}) => {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    // WhatsApp message template
    const whatsappMessage = `Oii ${contactName}! 🌀 Aqui é do Hub Encontro D'água. Liberei seu acesso ao Portal! Vai chegar um e-mail para você criar sua senha. Qualquer dúvida, me chama!`;

    const handleCopyWhatsApp = () => {
        navigator.clipboard.writeText(whatsappMessage);
        setCopied(true);
        addToast('Texto copiado! Cole no WhatsApp', 'success');
        setTimeout(() => setCopied(false), 3000);
    };

    const handleSendInvite = async () => {
        setSending(true);
        try {
            // Call invite-users Edge Function
            const { data, error } = await supabase.functions.invoke('invite-users', {
                body: {
                    contact_id: contactId,
                    role: 'cliente',
                },
            });

            if (error) throw error;

            // Log activity
            await supabase.from('activities').insert({
                type: 'NOTE',
                title: 'Convite Enviado via Mazô',
                description: `Mazô sugeriu e a Admin enviou convite de acesso para ${contactName}`,
                date: new Date().toISOString(),
                completed: true,
            });

            addToast('E-mail de convite enviado com sucesso!', 'success');
            onClose();
        } catch (error: any) {
            console.error('Error sending invite:', error);
            addToast('Erro ao enviar convite: ' + error.message, 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-white/10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mazô CS Copilot</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Onboarding de Cliente</p>
                    </div>
                </div>

                {/* Step 1: WhatsApp Copy */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center text-xs font-bold">1</span>
                        Copie e envie no WhatsApp
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap">
                            {whatsappMessage}
                        </p>
                        <button
                            onClick={handleCopyWhatsApp}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copiado!' : 'Copiar Texto'}
                        </button>
                    </div>
                </div>

                {/* Step 2: Send Email */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center text-xs font-bold">2</span>
                        Dispare o e-mail de acesso
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Enviaremos um e-mail para <strong>{contactEmail}</strong> com instruções para criar a senha.
                        </p>
                        <button
                            onClick={handleSendInvite}
                            disabled={sending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            {sending ? 'Enviando...' : 'Disparar E-mail de Acesso'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
