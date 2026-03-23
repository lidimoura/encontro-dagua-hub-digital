import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/hooks/useTranslation';

const STORAGE_KEY = 'crm_ultimo_convite';

interface InviteGeneratorProps {
    onInviteGenerated?: () => void;
}

export const InviteGenerator: React.FC<InviteGeneratorProps> = ({ onInviteGenerated }) => {
    const { t } = useTranslation();
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    // ref to avoid stale closure in async
    const generatingRef = useRef(false);

    // ── Recupera o último link ao montar (sobrevive a refresh/piscar) ──────
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setGeneratedLink(saved);
        } catch (_) { /* localStorage indisponível — sem problema */ }
    }, []);

    const generateInvite = async (e?: React.SyntheticEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (generatingRef.current) return;
        generatingRef.current = true;
        setGenerating(true);
        setError('');

        try {
            const token = crypto.randomUUID();

            const { error: dbError } = await supabase
                .from('company_invites')
                .insert({ token, email: null, offer_discount: false, expires_at: null });

            if (dbError) throw dbError;

            const link = `${window.location.origin}/#/join?token=${token}`;

            // ── Persiste no localStorage ANTES de atualizar o state ────────
            try { localStorage.setItem(STORAGE_KEY, link); } catch (_) {}

            setGeneratedLink(link);
            setCopied(false);

            // Auto-copy (best-effort)
            navigator.clipboard.writeText(link)
                .then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000); })
                .catch(() => {});

            onInviteGenerated?.();
        } catch (err: any) {
            setError('Falha: ' + (err?.message || 'Erro desconhecido'));
        } finally {
            setGenerating(false);
            generatingRef.current = false;
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink)
            .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
            .catch(() => {});
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        setGeneratedLink('');
        setCopied(false);
    };

    return (
        <div className="bg-white dark:bg-rionegro-900 rounded-2xl shadow-xl border border-solimoes-400/20 dark:border-solimoes-400/10 p-6 mb-6">
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

            {/* Botão principal — NUNCA dentro de um form */}
            <button
                type="button"
                onClick={generateInvite}
                disabled={generating}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-acai-900 hover:bg-acai-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
                {generating ? '⏳ Gerando...' : (generatedLink ? '🔄 Gerar Novo Link' : t('generateInviteButton'))}
            </button>

            {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            {/* CARD VERDE FIXO — persiste via localStorage mesmo após refresh */}
            {generatedLink && (
                <div
                    style={{
                        marginTop: 16,
                        border: '2px solid #22c55e',
                        borderRadius: 14,
                        padding: 16,
                        background: 'rgba(34,197,94,0.08)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#16a34a' }}>
                            ✅ Link de Convite {copied ? '— Copiado!' : 'Gerado'}
                        </span>
                        <button
                            type="button"
                            onClick={handleClear}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                            title="Descartar link"
                        >
                            ✕
                        </button>
                    </div>

                    <div
                        style={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            background: 'rgba(0,0,0,0.07)',
                            borderRadius: 8,
                            padding: '8px 12px',
                            marginBottom: 12,
                            wordBreak: 'break-all',
                            userSelect: 'all',
                            cursor: 'text',
                            color: '#1e293b',
                        }}
                        onClick={(e) => {
                            const range = document.createRange();
                            range.selectNodeContents(e.currentTarget);
                            window.getSelection()?.removeAllRanges();
                            window.getSelection()?.addRange(range);
                        }}
                    >
                        {generatedLink}
                    </div>

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
                        Envie este link para o novo usuário. Ele expirará assim que o cadastro for concluído.
                    </p>
                </div>
            )}
        </div>
    );
};
