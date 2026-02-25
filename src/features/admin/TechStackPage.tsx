import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Server,
    Database,
    Zap,
    Brain,
    BarChart3,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    DollarSign,
    Clock,
    TrendingUp,
    Filter
} from 'lucide-react';

interface TechStackProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    product_type: string;
    is_internal: boolean;
    stack_category: string;
    pricing_model: string;
    pricing_tiers: any[];
    external_url: string;
    auto_update_pricing: boolean;
    last_price_update: string | null;
    metadata: any;
    created_at: string;
    updated_at: string;
}

// --- INTELLIGENT STACK MANAGEMENT ---
export interface TechStackMetadata {
    ai_managed?: boolean;
    credentials?: {
        clientId?: string;
        clientSecret?: string;
        apiKey?: string;
        [key: string]: any;
    };
    dev_program_status?: {
        status: 'active' | 'inactive' | 'pending';
        tier?: string;
        renewal_date?: string;
    };
    [key: string]: any;
}

interface TechStackProduct extends Omit<TechStackProduct, 'metadata'> {
    metadata: TechStackMetadata;
}

const CATEGORY_ICONS = {
    hosting: Server,
    database: Database,
    automation: Zap,
    ai: Brain,
    analytics: BarChart3,
    other: Server,
};

const CATEGORY_COLORS = {
    hosting: 'bg-blue-500',
    database: 'bg-green-500',
    automation: 'bg-purple-500',
    ai: 'bg-fuchsia-500',
    analytics: 'bg-orange-500',
    other: 'bg-slate-500',
};

export const TechStackPage: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [products, setProducts] = useState<TechStackProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<TechStackProduct | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        stack_category: 'other',
        pricing_model: 'fixed',
        external_url: '',
        auto_update_pricing: false,
        metadata: {},
    });

    useEffect(() => {
        fetchTechStack();
    }, []);

    const fetchTechStack = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('product_type', 'tech_stack')
                .eq('is_internal', true)
                .order('stack_category', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            console.error('Error fetching tech stack:', error);
            addToast('Erro ao carregar tech stack', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const productData = {
                ...formData,
                product_type: 'tech_stack',
                is_internal: true,
                active: true,
            };

            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);

                if (error) throw error;
                addToast('Ferramenta atualizada com sucesso', 'success');
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);

                if (error) throw error;
                addToast('Ferramenta adicionada com sucesso', 'success');
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            resetForm();
            fetchTechStack();
        } catch (error: any) {
            console.error('Error saving product:', error);
            addToast('Erro ao salvar ferramenta', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta ferramenta?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            addToast('Ferramenta excluída com sucesso', 'success');
            fetchTechStack();
        } catch (error: any) {
            console.error('Error deleting product:', error);
            addToast('Erro ao excluir ferramenta', 'error');
        }
    };

    const openEditModal = (product: TechStackProduct) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stack_category: product.stack_category,
            pricing_model: product.pricing_model,
            external_url: product.external_url || '',
            auto_update_pricing: product.auto_update_pricing,
            metadata: product.metadata || {},
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            stack_category: 'other',
            pricing_model: 'fixed',
            external_url: '',
            auto_update_pricing: false,
            metadata: {},
        });
    };

    const filteredProducts = categoryFilter === 'all'
        ? products
        : products.filter(p => p.stack_category === categoryFilter);

    const totalMonthlyCost = products.reduce((sum, p) => sum + (p.price || 0), 0);

    const categoryCounts = products.reduce((acc, p) => {
        acc[p.stack_category] = (acc[p.stack_category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                            Tech Stack
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gerencie as ferramentas e custos da sua infraestrutura
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingProduct(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary-600/20"
                    >
                        <Plus size={20} />
                        Adicionar Ferramenta
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Custo Mensal Total</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ${totalMonthlyCost.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total de Ferramentas</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {products.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Custo Anual</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ${(totalMonthlyCost * 12).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex items-center gap-2">
                <Filter size={20} className="text-slate-400" />
                <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${categoryFilter === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                >
                    Todas ({products.length})
                </button>
                {Object.entries(categoryCounts).map(([category, count]) => (
                    <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${categoryFilter === category
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {category} ({count})
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-500 mt-4">Carregando...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10">
                    <Server className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">{t('noToolsFound')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => {
                        const Icon = CATEGORY_ICONS[product.stack_category as keyof typeof CATEGORY_ICONS] || Server;
                        const colorClass = CATEGORY_COLORS[product.stack_category as keyof typeof CATEGORY_COLORS] || 'bg-slate-500';

                        return (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-xl p-5 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="text-slate-400 hover:text-primary-600 transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                        {product.pricing_model}
                                    </span>
                                </div>

                                {product.external_url && (
                                    <a
                                        href={product.external_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        <ExternalLink size={14} />
                                        Ver documentação
                                    </a>
                                )}

                                {product.auto_update_pricing && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <Clock size={12} />
                                            Auto-update ativo
                                            {product.last_price_update && (
                                                <span>• {new Date(product.last_price_update).toLocaleDateString('pt-BR')}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-white/10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingProduct ? 'Editar Ferramenta' : 'Nova Ferramenta'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nome da Ferramenta
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Ex: Vercel Pro"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    rows={3}
                                    placeholder="Descrição da ferramenta"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Preço Mensal (USD)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Categoria
                                    </label>
                                    <select
                                        value={formData.stack_category}
                                        onChange={(e) => setFormData({ ...formData, stack_category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="hosting">Hosting</option>
                                        <option value="database">Database</option>
                                        <option value="automation">Automation</option>
                                        <option value="ai">AI</option>
                                        <option value="analytics">Analytics</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* --- INTELLIGENT STACK MANAGEMENT: KEY VALIDATOR --- */}
                            {formData.stack_category === 'ai' && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Brain size={16} className="text-fuchsia-500" />
                                        Intelligent Stack Management
                                    </h4>

                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            API Key / Service Account
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.metadata?.credentials?.apiKey || ''}
                                            onChange={(e) => {
                                                const key = e.target.value;
                                                // Heuristic: specific length or prefix check could go here
                                                const looksLikeCloud = key.includes('"type": "service_account"') || (key.startsWith('AIza') && key.length > 50); // Just a heuristic example

                                                setFormData({
                                                    ...formData,
                                                    metadata: {
                                                        ...formData.metadata,
                                                        credentials: { ...formData.metadata?.credentials, apiKey: key },
                                                        // Auto-detect based on input pattern (Basic Heuristic)
                                                        ai_detected_type: key.startsWith('AIza') ? 'ai_studio_free' : 'vertex_ai_cloud'
                                                    }
                                                });
                                            }}
                                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-fuchsia-500"
                                            placeholder="Paste API Key here..."
                                        />
                                    </div>

                                    {/* ALERTA VERMELHO - CLOUD DETECTED */}
                                    {formData.metadata?.ai_detected_type === 'vertex_ai_cloud' && (
                                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                                            <div className="text-red-500 mt-0.5"><Zap size={16} /></div>
                                            <div>
                                                <p className="text-red-500 font-bold text-xs uppercase tracking-wide">Cuidado: Cobrança GCP Detectada</p>
                                                <p className="text-red-400 text-xs mt-1">
                                                    Esta chave parece ser do <strong>Vertex AI (Google Cloud)</strong>. O uso contínuo pode gerar cobranças no seu cartão de crédito vinculado ao GCP.
                                                    <br /><br />
                                                    <span className="text-red-300">Recomendação: Use o <strong>AI Studio Free Tier</strong> para segurança financeira.</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.metadata?.ai_detected_type === 'ai_studio_free' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                        <span className="text-xs text-slate-500">
                                            {formData.metadata?.ai_detected_type === 'ai_studio_free'
                                                ? 'Free Tier (AI Studio) - Seguro'
                                                : formData.metadata?.ai_detected_type === 'vertex_ai_cloud'
                                                    ? 'Cloud Mode (Vertex AI) - Pago'
                                                    : 'Aguardando validação...'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Modelo de Preço
                                    </label>
                                    <select
                                        value={formData.pricing_model}
                                        onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="fixed">Fixo</option>
                                        <option value="per_user">Por Usuário</option>
                                        <option value="per_request">Por Requisição</option>
                                        <option value="tiered">Escalonado</option>
                                        <option value="free">Gratuito</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        URL Externa
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.external_url}
                                        onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="auto_update"
                                    checked={formData.auto_update_pricing}
                                    onChange={(e) => setFormData({ ...formData, auto_update_pricing: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <label htmlFor="auto_update" className="text-sm text-slate-700 dark:text-slate-300">
                                    Ativar atualização automática de preços (via Gemini)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingProduct(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
                            >
                                {editingProduct ? t('saveChanges') : t('addTool')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
