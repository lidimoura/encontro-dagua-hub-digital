import React, { useState } from 'react';
import { X, Sparkles, Mail, Building2, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: 'prompt_optimizer' | 'cta' | 'other';
    prefilledData?: {
        generatedPrompt?: string;
        userInput?: string;
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
        interest: 'hub_completo',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Save to waitlist
            const { error: waitlistError } = await supabase
                .from('waitlist')
                .insert([{
                    email: formData.email,
                    name: formData.name,
                    source: source,
                    interest: formData.interest,
                    metadata: prefilledData || {},
                }]);

            if (waitlistError) throw waitlistError;

            // Save to contacts as LEAD_QUENTE
            const { error: contactError } = await supabase
                .from('contacts')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    company_name: formData.company || null,
                    status: 'ACTIVE',
                    stage: 'LEAD',
                    source: source,
                    notes: `Lead capturado via ${source}. Interesse: ${formData.interest}`,
                }]);

            if (contactError) throw contactError;

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ name: '', email: '', company: '', interest: 'hub_completo' });
            }, 2000);
        } catch (error: any) {
            console.error('Error saving lead:', error);
            alert(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-rionegro-900 rounded-xl shadow-2xl max-w-md w-full p-6">
                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Obrigado!
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Entraremos em contato em breve.
                        </p>
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
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Preencha os dados abaixo para receber acesso ao Hub
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                    placeholder="Seu nome"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Empresa (opcional)
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                        placeholder="Nome da empresa"
                                    />
                                </div>
                            </div>

                            {/* Interest */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Interesse *
                                </label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        value={formData.interest}
                                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                    >
                                        <option value="qr_dagua">QR D'água</option>
                                        <option value="prompt_lab">Prompt Lab</option>
                                        <option value="hub_completo">Hub Completo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-acai-900 to-acai-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : 'Aplicar Agora'}
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
