import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose }) => {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        businessType: '',
        referralSource: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.whatsapp) {
            addToast('Por favor, preencha nome e WhatsApp', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Chamada para a Edge Function unificada que lida com leads da LP/Link d'água
            const { data, error: functionError } = await supabase.functions.invoke('form-lp-lead', {
                body: {
                    name: formData.name,
                    whatsapp: formData.whatsapp,
                    email: formData.email,
                    services: formData.businessType, // Mapeado para 'services' conforme esperado pela Edge Function
                    landedVia: formData.referralSource || 'Landing Page Hub', // Mapeia a origem
                    source: 'LP do Hub', // Garante a tag correta no Kanban
                    message: `Intenção/Diagnóstico: ${formData.businessType || 'Não informado'} | Referência: ${formData.referralSource || 'Nenhuma'}`
                }
            });

            if (functionError) {
                console.error('❌ Erro na Edge Function:', functionError);
                throw new Error(`Erro no servidor: ${functionError.message}`);
            }

            console.log('✅ Lead enviado com sucesso para a Edge Function', data);
            addToast('🎉 Aplicação enviada com sucesso!', 'success');

            // Reset form
            setFormData({
                name: '',
                whatsapp: '',
                email: '',
                businessType: '',
                referralSource: '',
            });

            // Show success screen instead of closing
            setIsSuccess(true);

        } catch (error: any) {
            console.error('Error submitting application:', error);
            addToast(`Erro ao enviar aplicação: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    // Success Screen
    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                <div className="bg-[#0f0518] border border-green-500/30 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Aplicação Recebida!</h2>
                    <p className="text-slate-300 mb-6">Entraremos em contato em até 24h.</p>

                    <a
                        href="https://wa.me/5592992943998?text=Olá! Gostaria de agendar uma consultoria gratuita."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold mb-4 hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg"
                    >
                        💬 Quero uma consultoria free
                    </a>

                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    // Form Screen
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f0518] border border-fuchsia-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6 text-fuchsia-400" />
                            <h2 className="text-2xl font-bold text-white">Quero ser cliente</h2>
                        </div>
                        <p className="text-sm text-slate-400">
                            Preencha os dados abaixo e entraremos em contato em até 24h
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            placeholder="Seu nome"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            WhatsApp *
                        </label>
                        <input
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            placeholder="(92) 99999-9999"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Email (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Email (Opcional)
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            placeholder="seu@email.com"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Diagnostic Intent */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            O que você precisa? (Diagnóstico)
                        </label>
                        <select
                            value={formData.businessType}
                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            disabled={isSubmitting}
                        >
                            <option value="">Selecione sua necessidade...</option>
                            <option value="mentoria">Quero aprender a criar (Mentoria/Consultoria)</option>
                            <option value="agentes-ia">Quero contratar Agentes de IA / Chatbots</option>
                            <option value="crm">Preciso de um CRM Personalizado</option>
                            <option value="automacoes">Automações Específicas</option>
                            <option value="qr-code">QR Code Dinâmico / Cartão Digital</option>
                            <option value="prompt-lab">Acesso Total ao Prompt Lab</option>
                            <option value="diagnostico">Não sei a solução (Quero Diagnóstico)</option>
                        </select>
                    </div>

                    {/* Referral Source */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Como conheceu o Hub?
                        </label>
                        <input
                            type="text"
                            value={formData.referralSource}
                            onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            placeholder="Ex: Instagram, indicação, busca no Google..."
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-fuchsia-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Enviar Aplicação
                            </>
                        )}
                    </button>

                    {/* Privacy Note */}
                    <p className="text-xs text-slate-500 text-center">
                        Seus dados estão seguros. Não compartilhamos com terceiros.
                    </p>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}} />
        </div>
    );
};
