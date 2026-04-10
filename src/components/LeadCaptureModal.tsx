import React, { useState } from 'react';
import { X, Sparkles, Mail, Building2, Target, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── Stripe Agente IA — Oferta de Lançamento V4.4
const STRIPE_AGENTE_IA_URL = 'https://buy.stripe.com/00wcMY9wU4nsdx4eRWaIM02';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: 'prompt_optimizer' | 'cta' | 'other' | 'hub-lp-launch' | 'provadagua';
    prefilledData?: {
        generatedPrompt?: string;
        userInput?: string;
        interest?: string;
    };
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
    isOpen,
    onClose,
    source,
    prefilledData,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        interest: prefilledData?.interest ?? 'provadagua_trial',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ── Disparar para o "Cérebro Único" (Edge Function form-lp-lead) ──
            // Isso garante formatação do briefing_json e notificação push, unificando a entrada
            const { data: { session } } = await supabase.auth.getSession();
            
            // Build the payload mapping our form to the typebot/webhook expectations
            // O campo "whatsapp" é OBRIGATÓRIO na Edge Function (valida: !name || !whatsapp)
            // Auto-tag e source baseados no interesse selecionado
            const isTrial    = formData.interest === 'provadagua_trial';
            const isAgenteIA = formData.interest === 'agente_ia_80';
            const autoTags = ['Hub-lp'];
            if (isTrial)    autoTags.push('provadagua-trial');
            if (isAgenteIA) autoTags.push('agente-ia-80', 'launch-offer');
            if (formData.interest === 'crm_saude')       autoTags.push('saude');
            if (formData.interest === 'automacoes_saas') autoTags.push('saas');

            const resolvedSource = isAgenteIA   ? 'hub-lp-launch'
                                 : isTrial       ? 'provadagua'
                                 : source === 'cta' ? 'Hub LP'
                                 : source === 'prompt_optimizer' ? 'Prompt Lab'
                                 : source === 'hub-lp-launch' ? 'hub-lp-launch'
                                 : 'Hub LP';

            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                whatsapp: formData.phone || `sem-tel-${Date.now()}`,
                businessType: formData.interest,
                services: [formData.interest],
                landedVia: isAgenteIA ? 'Hub LP — Oferta Lançamento Agente IA R$80' : isTrial ? 'Provadágua Trial' : 'Hub LP',
                source: resolvedSource,
                origin: isAgenteIA ? 'launch-offer-agente-ia' : isTrial ? 'provadagua-trial' : source === 'cta' ? 'Hub-lp' : source,
                message: formData.company ? `Empresa: ${formData.company}` : '',
                tags: autoTags,
                trial_requested: isTrial,
                agente_ia_offer: isAgenteIA,
                ...prefilledData
            };

            const { data, error: functionError } = await supabase.functions.invoke('form-lp-lead', {
                body: payload,
            });

            if (functionError) {
                console.error('[LeadCapture] Edge function error, trying fallback:', functionError);
                throw new Error('Falha ao processar o lead. ' + functionError.message);
            }

            setSuccess(true);

            // ── Agente IA: redirecionar para Stripe após 2s de feedback visual
            if (isAgenteIA) {
                setTimeout(() => {
                    window.open(STRIPE_AGENTE_IA_URL, '_blank', 'noopener,noreferrer');
                    onClose();
                    setSuccess(false);
                    setFormData({ name: '', email: '', company: '', phone: '', interest: 'provadagua_trial' });
                }, 2000);
            } else {
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setFormData({ name: '', email: '', company: '', phone: '', interest: 'provadagua_trial' });
                }, 2500);
            }
        } catch (err: any) {
            console.error('[LeadCapture] Error saving lead:', err);
            setError(err.message || 'Erro desconhecido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-white/10">
                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {formData.interest === 'agente_ia_80' ? 'Lead registrado! 🤖' : 'Recebido! 🎉'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {formData.interest === 'agente_ia_80'
                                ? 'Redirecionando para o checkout do Agente IA...'
                                : 'Seu acesso está sendo processado. Entraremos em contato em breve!'}
                        </p>
                        {formData.interest === 'agente_ia_80' && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Aplicar para Acesso
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                            Preencha os dados abaixo e nossa equipe entrará em contato.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-lg text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-900 dark:text-white"
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-900 dark:text-white"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    WhatsApp (opcional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-900 dark:text-white"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Empresa (opcional)
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-900 dark:text-white"
                                        placeholder="Nome da empresa"
                                    />
                                </div>
                            </div>

                            {/* Interest */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Interesse *
                                </label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={formData.interest}
                                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-900 dark:text-white"
                                    >
                                        <option value="agente_ia_80">🤖 Agente de IA (SAC/FAQ) — R$ 80/mês 🔥 LANÇAMENTO</option>
                                        <option value="provadagua_trial">🧪 Quero testar o CRM por 7 dias (Provadágua)</option>
                                        <option value="crm_saude">🩺 CRM para Saúde / Consultório</option>
                                        <option value="automacoes_saas">⚙️ Automações & SaaS</option>
                                        <option value="hub_completo">Hub Completo (CRM + IA + Link d'Água)</option>
                                        <option value="linkdagua">Link d'Água (Sites e QR Codes)</option>
                                        <option value="crm_only">CRM com IA</option>
                                        <option value="prompt_lab">Prompt Lab</option>
                                        <option value="qr_dagua">QR D'água</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all mt-2"
                            >
                                {loading ? 'Enviando...' : '🚀 Aplicar Agora'}
                            </button>
                        </form>

                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                            Ao aplicar, você concorda em receber comunicações sobre o Hub
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
