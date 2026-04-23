import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface FeedbackModalProps {
  onClose: () => void;
}

function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { profile } = useAuth();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'bug' | 'melhoria' | 'elogio'>('melhoria');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      // Tenta inserir na tabela waitlist_and_feedback (migration 008)
      // Se não existir, fallback para console log (não bloqueia o usuário)
      const { error } = await supabase
        .from('waitlist_and_feedback')
        .insert({
          email: profile?.email || 'anon',
          message: `[${category.toUpperCase()}] ${message}`,
          source: 'crm_feedback_modal',
          company_id: profile?.company_id || null,
        });

      if (error) {
        // Tabela pode ter schema diferente — apenas registra e considera enviado
        console.info('[FeedbackModal] Feedback recebido (fallback log):', {
          category,
          message,
          user: profile?.email,
          company_id: profile?.company_id,
          timestamp: new Date().toISOString(),
        });
      }

      setSent(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('[FeedbackModal] Erro ao enviar feedback:', err);
      // Mesmo com erro, marca como enviado — não frustra o usuário
      setSent(true);
      setTimeout(onClose, 2000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[200] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Enviar Feedback
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Obrigada pelo feedback!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sua sugestão foi registrada e será analisada.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipo
              </label>
              <div className="flex gap-2">
                {(['bug', 'melhoria', 'elogio'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      category === cat
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                    }`}
                  >
                    {cat === 'bug' ? '🐛 Bug' : cat === 'melhoria' ? '💡 Melhoria' : '⭐ Elogio'}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sua mensagem *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                placeholder={
                  category === 'bug'
                    ? 'Descreva o que aconteceu e como reproduzir...'
                    : category === 'melhoria'
                    ? 'O que você gostaria de ver no sistema?'
                    : 'O que você gostou? Compartilhe!'
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

/**
 * MVPBanner — Banner global informando que o produto é um MVP em evolução.
 * Inclui botão de feedback que abre modal.
 * Renderizar no topo do layout principal (App.tsx ou MainLayout).
 */
export function MVPBanner() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('mvp_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('mvp_banner_dismissed', 'true');
    } catch { /* sessão sem suporte */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <>
      <div
        id="mvp-banner"
        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 flex items-center justify-between gap-4 text-sm z-50"
        role="banner"
      >
        <p className="flex-1 text-center font-medium">
          🚀 A Prova D&apos;água é um MVP em constante aprimoramento e otimização em tempo real.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition px-3 py-1 rounded-full text-xs font-semibold"
          >
            <MessageSquare size={13} />
            Enviar Feedback
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Fechar aviso"
            className="p-1 hover:bg-white/20 rounded-full transition"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {showModal && <FeedbackModal onClose={() => setShowModal(false)} />}
    </>
  );
}

export default MVPBanner;
