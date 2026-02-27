import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { templatesService, BridgeTemplate } from '@/lib/supabase/templates';
import { Plus, Edit2, Trash2, Save, X, Palette, Smartphone } from 'lucide-react';

export const TemplateManager: React.FC = () => {
    const { profile } = useAuth();
    const { addToast } = useToast();
    const [templates, setTemplates] = useState<BridgeTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const defaultFormData: Partial<BridgeTemplate> = {
        name: '',
        description: '',
        bg_color: '#f8fafc',
        card_bg_color: '#ffffff',
        text_color: '#0f172a',
        button_bg_color: '#3b82f6',
        button_text_color: '#ffffff',
    };

    const [formData, setFormData] = useState<Partial<BridgeTemplate>>(defaultFormData);

    useEffect(() => {
        if (profile?.company_id) {
            fetchTemplates(profile.company_id);
        }
    }, [profile?.company_id]);

    const fetchTemplates = async (companyId: string) => {
        setLoading(true);
        const { data, error } = await templatesService.getAll(companyId);
        if (error) {
            addToast('Erro ao carregar templates', 'error');
        } else {
            setTemplates(data || []);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!profile?.company_id) return;
        if (!formData.name) {
            addToast('O nome do template é obrigatório', 'warning');
            return;
        }

        try {
            if (formData.id) {
                const { error } = await templatesService.update(formData.id, formData);
                if (error) throw error;
                addToast('Template atualizado com sucesso!', 'success');
            } else {
                const { error } = await templatesService.create({
                    ...formData as Required<Omit<BridgeTemplate, 'id' | 'created_at'>>,
                    company_id: profile.company_id,
                });
                if (error) throw error;
                addToast('Template criado com sucesso!', 'success');
            }
            setIsEditing(false);
            setFormData(defaultFormData);
            fetchTemplates(profile.company_id);
        } catch (error) {
            console.error(error);
            addToast('Erro ao salvar template', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este template?')) return;

        const { error } = await templatesService.delete(id);
        if (error) {
            addToast('Erro ao excluir template. Pode ser um template global invisível.', 'error');
        } else {
            addToast('Template excluído!', 'success');
            if (profile?.company_id) fetchTemplates(profile.company_id);
        }
    };

    const handleEdit = (t: BridgeTemplate) => {
        setFormData(t);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette className="text-primary-500" />
                        Gerenciador de Templates
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Crie designs personalizados para seus Cartões Digitais.
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setFormData(defaultFormData);
                            setIsEditing(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-all"
                    >
                        <Plus size={18} />
                        Novo Template
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FORM */}
                    <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {formData.id ? 'Editar Template' : 'Novo Template'}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Template *</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    placeholder="Ex: Minimalista Dark"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    placeholder="Ex: Fundo escuro com CTAs azuis"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fundo da Página (bg_color)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.bg_color || '#f8fafc'}
                                        onChange={(e) => setFormData(p => ({ ...p, bg_color: e.target.value }))}
                                        className="h-10 w-12 cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.bg_color || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, bg_color: e.target.value }))}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fundo do Cartão (card_bg_color)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.card_bg_color || '#ffffff'}
                                        onChange={(e) => setFormData(p => ({ ...p, card_bg_color: e.target.value }))}
                                        className="h-10 w-12 cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.card_bg_color || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, card_bg_color: e.target.value }))}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cor do Texto (text_color)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.text_color || '#0f172a'}
                                        onChange={(e) => setFormData(p => ({ ...p, text_color: e.target.value }))}
                                        className="h-10 w-12 cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.text_color || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, text_color: e.target.value }))}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fundo do Botão (button_bg_color)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.button_bg_color || '#3b82f6'}
                                        onChange={(e) => setFormData(p => ({ ...p, button_bg_color: e.target.value }))}
                                        className="h-10 w-12 cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.button_bg_color || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, button_bg_color: e.target.value }))}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Texto do Botão (button_text_color)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.button_text_color || '#ffffff'}
                                        onChange={(e) => setFormData(p => ({ ...p, button_text_color: e.target.value }))}
                                        className="h-10 w-12 cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <input
                                        type="text"
                                        value={formData.button_text_color || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, button_text_color: e.target.value }))}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2"
                            >
                                <Save size={18} />
                                Salvar Template
                            </button>
                        </div>
                    </div>

                    {/* LIVE PREVIEW (Mockup) */}
                    <div className="lg:col-span-1 sticky top-6">
                        <div className="w-[300px] h-[600px] mx-auto bg-black rounded-[40px] p-2 shadow-2xl relative overflow-hidden ring-4 ring-slate-800 flex flex-col">
                            {/* Notch */}
                            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                                <div className="w-1/3 h-full bg-black rounded-b-xl"></div>
                            </div>

                            {/* Preview Area */}
                            <div
                                className="flex-1 w-full bg-slate-100 rounded-[32px] overflow-hidden relative"
                                style={{ background: formData.bg_color || '#f8fafc' }}
                            >
                                {/* Sample Bridge Page Content */}
                                <div className="p-4 pt-16 h-full flex flex-col items-center">
                                    {/* Glass Card */}
                                    <div
                                        className="w-full rounded-2xl p-6 text-center shadow-xl backdrop-blur-md"
                                        style={{ backgroundColor: formData.card_bg_color || '#ffffff' }}
                                    >
                                        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 border-2 border-white/20"></div>
                                        <h2
                                            className="text-lg font-bold mb-2"
                                            style={{ color: formData.text_color || '#000000' }}
                                        >
                                            Sua Empresa
                                        </h2>
                                        <p
                                            className="text-xs mb-6 opacity-80"
                                            style={{ color: formData.text_color || '#000000' }}
                                        >
                                            A melhor solução do mercado.
                                        </p>

                                        <button
                                            className="w-full py-3 rounded-xl font-bold text-sm shadow-md"
                                            style={{
                                                backgroundColor: formData.button_bg_color || '#3b82f6',
                                                color: formData.button_text_color || '#ffffff'
                                            }}
                                        >
                                            Acessar Produto
                                        </button>

                                        <div className="mt-4 flex flex-col gap-2">
                                            {[1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-full p-3 rounded-lg flex items-center gap-3 border"
                                                    style={{
                                                        borderColor: formData.button_bg_color || '#3b82f6',
                                                        color: formData.text_color || '#000000',
                                                        backgroundColor: 'transparent'
                                                    }}
                                                >
                                                    <div className="w-6 h-6 rounded-full opacity-50" style={{ backgroundColor: formData.button_bg_color || '#3b82f6' }}></div>
                                                    <span className="text-sm font-medium">Link Externo {i}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl h-64 border border-slate-200 dark:border-slate-700"></div>
                        ))
                    ) : templates.length === 0 ? (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <Smartphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Nenhum template ainda</h3>
                            <p className="text-slate-500 mb-6">Crie seu primeiro template para padronizar os cartões da sua empresa.</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-all"
                            >
                                Criar Primeiro Template
                            </button>
                        </div>
                    ) : (
                        templates.map((tpl) => (
                            <div key={tpl.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary-500/50 shadow-sm hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner"
                                        style={{ background: tpl.bg_color }}
                                    >
                                        <div
                                            className="w-6 h-6 rounded border"
                                            style={{ backgroundColor: tpl.card_bg_color, borderColor: tpl.button_bg_color }}
                                        />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(tpl)}
                                            className="p-1.5 text-slate-400 hover:text-primary-500 bg-slate-50 dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {!tpl.is_global && (
                                            <button
                                                onClick={() => handleDelete(tpl.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {tpl.name}
                                    {tpl.is_global && <span className="text-[10px] px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full font-bold uppercase tracking-wider">Default</span>}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                    {tpl.description || 'Sem descrição'}
                                </p>

                                {/* Swatches */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: tpl.bg_color }} title="Fundo de Página"></div>
                                    <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: tpl.card_bg_color }} title="Fundo de Cartão"></div>
                                    <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: tpl.text_color }} title="Cor de Texto"></div>
                                    <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: tpl.button_bg_color }} title="Fundo de Botão"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
