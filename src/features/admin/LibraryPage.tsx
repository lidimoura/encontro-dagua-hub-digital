import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Copy, Search, Filter, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

interface LibraryAsset {
    id: string;
    title: string;
    description: string | null;
    asset_type: 'prompt' | 'contract' | 'business_logic' | 'saas_template' | 'other';
    category: string | null;
    content: string;
    variables: Record<string, any>;
    metadata: Record<string, any>;
    usage_count: number;
    last_used_at: string | null;
    tags: string[];
    is_template: boolean;
    is_public: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

const ASSET_TYPES = [
    { value: 'prompt', label: '📝 Prompt', color: 'bg-blue-500' },
    { value: 'contract', label: '📄 Contrato', color: 'bg-green-500' },
    { value: 'business_logic', label: '💡 Lógica de Negócio', color: 'bg-purple-500' },
    { value: 'saas_template', label: '🔧 Template SaaS', color: 'bg-orange-500' },
    { value: 'other', label: '📦 Outro', color: 'bg-gray-500' },
];

export const LibraryPage: React.FC = () => {
    const { profile } = useAuth();
    const { addToast } = useToast();
    const [assets, setAssets] = useState<LibraryAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [editingAsset, setEditingAsset] = useState<LibraryAsset | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        asset_type: 'prompt' as LibraryAsset['asset_type'],
        category: '',
        content: '',
        tags: [] as string[],
        is_template: false,
        is_public: false,
    });

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('library_assets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAssets(data || []);
        } catch (error: any) {
            console.error('Error fetching assets:', error);
            addToast('Erro ao carregar biblioteca', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleSave = async () => {
        try {
            if (!formData.title || !formData.content) {
                addToast('Preencha título e conteúdo', 'error');
                return;
            }

            const payload = {
                ...formData,
                created_by: profile?.id,
            };

            if (editingAsset) {
                const { error } = await supabase
                    .from('library_assets')
                    .update(payload)
                    .eq('id', editingAsset.id);

                if (error) throw error;
                addToast('Ativo atualizado!', 'success');
            } else {
                const { error } = await supabase
                    .from('library_assets')
                    .insert([payload]);

                if (error) throw error;
                addToast('Ativo criado!', 'success');
            }

            setShowModal(false);
            resetForm();
            fetchAssets();
        } catch (error: any) {
            console.error('Error saving asset:', error);
            addToast(`Erro: ${error.message}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este ativo?')) return;

        try {
            const { error } = await supabase
                .from('library_assets')
                .delete()
                .eq('id', id);

            if (error) throw error;
            addToast('Ativo excluído!', 'success');
            fetchAssets();
        } catch (error: any) {
            console.error('Error deleting asset:', error);
            addToast(`Erro: ${error.message}`, 'error');
        }
    };

    const handleEdit = (asset: LibraryAsset) => {
        setEditingAsset(asset);
        setFormData({
            title: asset.title,
            description: asset.description || '',
            asset_type: asset.asset_type,
            category: asset.category || '',
            content: asset.content,
            tags: asset.tags || [],
            is_template: asset.is_template,
            is_public: asset.is_public,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            asset_type: 'prompt',
            category: '',
            content: '',
            tags: [],
            is_template: false,
            is_public: false,
        });
        setEditingAsset(null);
    };

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content);
        addToast('Copiado para área de transferência!', 'success');
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || asset.asset_type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl shadow-lg">
                        <BookOpen className="w-6 h-6 text-solimoes-400" />
                    </div>
                    <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-solimoes-400 to-solimoes-500 bg-clip-text text-transparent">
                        Biblioteca & Ativos
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    Gerencie prompts, contratos, lógicas de negócio e templates SaaS
                </p>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-rionegro-900 rounded-xl shadow-lg border border-solimoes-400/20 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar ativos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                    >
                        <option value="all">Todos os Tipos</option>
                        {ASSET_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>

                    {/* New Asset Button */}
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-acai-900 to-acai-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Ativo
                    </button>
                </div>
            </div>

            {/* Assets Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acai-900 mx-auto"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando biblioteca...</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-rionegro-900 rounded-xl border border-dashed border-slate-300 dark:border-rionegro-700">
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                        {searchTerm || filterType !== 'all' ? 'Nenhum ativo encontrado' : 'Nenhum ativo criado ainda'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssets.map(asset => {
                        const typeInfo = ASSET_TYPES.find(t => t.value === asset.asset_type);
                        return (
                            <div
                                key={asset.id}
                                className="bg-white dark:bg-rionegro-900 rounded-xl shadow-lg border border-solimoes-400/20 p-6 hover:shadow-xl transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 ${typeInfo?.color} text-white text-xs rounded-full`}>
                                                {typeInfo?.label}
                                            </span>
                                            {asset.is_template && (
                                                <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                                                    Template
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {asset.title}
                                        </h3>
                                        {asset.description && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {asset.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Content Preview */}
                                <div className="bg-slate-50 dark:bg-rionegro-950 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                                        {asset.content}
                                    </p>
                                </div>

                                {/* Tags */}
                                {asset.tags && asset.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {asset.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-200 dark:bg-rionegro-800 text-xs rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    Usado {asset.usage_count} vezes
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(asset.content)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-rionegro-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-rionegro-700 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copiar
                                    </button>
                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-rionegro-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
                        </h2>

                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                    placeholder="Ex: Prompt para Geração de PRD"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Tipo *
                                </label>
                                <select
                                    value={formData.asset_type}
                                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value as any })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                >
                                    {ASSET_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                    placeholder="Breve descrição do ativo"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Conteúdo *
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent font-mono text-sm"
                                    placeholder="Cole aqui o prompt, contrato, lógica ou template..."
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Categoria
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                    placeholder="Ex: Sales, Legal, Finance"
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_template}
                                        onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
                                        className="w-4 h-4 text-acai-900 rounded focus:ring-acai-900"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">É Template</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_public}
                                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                        className="w-4 h-4 text-acai-900 rounded focus:ring-acai-900"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Público (visível para todos)</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-rionegro-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-rionegro-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-acai-900 to-acai-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                                {editingAsset ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
