import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/hooks/useTranslation';

interface InviteGeneratorProps {
    onInviteGenerated?: () => void;
}

export const InviteGenerator: React.FC<InviteGeneratorProps> = ({ onInviteGenerated }) => {
    const { t } = useTranslation();
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    // useCallback prevents stale closure issues
    const generateInvite = useCallback(async (e?: React.MouseEvent | React.KeyboardEvent) => {
        // Stop any form submit / page navigation
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (generating) return;

        setGenerating(true);
        setError('');
        // NOTE: do NOT clear generatedLink here — keep old link visible while generating new one

        try {
            const token = crypto.randomUUID();

            const { error: dbError } = await supabase
                .from('company_invites')
                .insert({ token, email: null, offer_discount: false, expires_at: null });

            if (dbError) throw dbError;

            // Use current origin — works correctly on prova.encontrodagua.com and localhost
            const link = `${window.location.origin}/#/join?token=${token}`;

            // Set the link BEFORE anything else so the card appears even if clipboard fails
            setGeneratedLink(link);
            setCopied(false);

            // Auto-copy (best-effort — never throws)
            navigator.clipboard.writeText(link).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }).catch(() => { /* silently ignore — user can click Copy */ });

            onInviteGenerated?.();
        } catch (err: any) {
            setError('Falha ao gerar convite: ' + (err?.message || 'Erro desconhecido'));
        } finally {
            setGenerating(false);
        }
    }, [generating, onInviteGenerated]);

    const handleCopy = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!generatedLink) return;
        try {
            await navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback: select the text visually
        }
    }, [generatedLink]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            generateInvite(e);
        }
    }, [generateInvite]);

    return (
        // Isolated div — NOT a form — so no submit events can bubble up
        <div
            className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-solimoes-400/20 dark:border-solimoes-400/10 p-6 mb-6"
            onSubmit={(e) => e.preventDefault()} // belt-and-suspenders
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🔗</span>
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

            {/* Botão principal — type="button" EXPLÍCITO para nunca triggerar form submit */}
            <button
                type="button"
                onClick={generateInvite}
                onKeyDown={handleKeyDown}
                disabled={generating}
                aria-busy={generating}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-acai-900 hover:bg-acai-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors select-none"
            >
                {generating ? '⏳ Gerando link...' : t('generateInviteButton')}
            </button>

            {/* Erro */}
            {error && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            {/*
             * ── CARD ESTÁTICO DE SUCESSO ──────────────────────────────────────
             * Renderizado via state React puro — sem animação CSS, sem plugin.
             * Permanece visível até que o usuário gere outro link.
             * O estado generatedLink só é trocado quando um NOVO link é gerado.
             */}
            {generatedLink ? (
                <div
                    className="mt-4 rounded-xl p-4"
                    style={{
                        border: '2px solid #22c55e',
                        background: 'rgba(34,197,94,0.08)',
                    }}
                >
                    {/* Status */}
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#16a34a', marginBottom: 8 }}>
                        ✅ Link de Convite Gerado{copied ? ' — Copiado!' : ''}
                    </p>

                    {/* Link completo — seleciona tudo ao clicar */}
                    <div
                        style={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            background: 'rgba(0,0,0,0.08)',
                            borderRadius: 8,
                            padding: '8px 12px',
                            marginBottom: 10,
                            wordBreak: 'break-all',
                            userSelect: 'all',
                            cursor: 'text',
                        }}
                        onClick={(e) => {
                            const range = document.createRange();
                            range.selectNodeContents(e.currentTarget);
                            const sel = window.getSelection();
                            sel?.removeAllRanges();
                            sel?.addRange(range);
                        }}
                    >
                        {generatedLink}
                    </div>

                    {/* Copiar */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        style={{
                            width: '100%',
                            padding: '10px 0',
                            borderRadius: 8,
                            border: 'none',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: 'pointer',
                            background: copied ? '#16a34a' : '#1e3a5f',
                            color: 'white',
                            transition: 'background 0.15s',
                        }}
                    >
                        {copied ? '✅ Copiado!' : '📋 Copiar Link'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: 11, color: '#64748b', marginTop: 6 }}>
                        Envie este link para a Amanda pelo WhatsApp
                    </p>
                </div>
            ) : null}
        </div>
    );
};
