import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Edit, Trash2, X, Package } from 'lucide-react';
import { Product } from '@/types';

interface ProductFormData {
    name: string;
    price: number;
    description: string;
    unit: string;
    category: string;
    is_active: boolean;
}

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (data: ProductFormData, id?: string) => Promise<void>;
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: product?.name || '',
        price: product?.price || 0,
        description: product?.description || '',
        unit: product?.unit || 'un',
        category: product?.category || 'service',
        is_active: product?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData, product?.id);
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Erro ao salvar produto. Verifique o console.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {product ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nome do Produto/Serviço *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Ex: Consultoria em IA"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Preço (R$) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                required
                                placeholder="0.00"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Unidade
                            </label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="un, h, mês"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Categoria
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="service">Serviço</option>
                            <option value="product">Produto</option>
                            <option value="subscription">Assinatura</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Descrição / Features / Links de Pagamento
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={6}
                            placeholder="Cole aqui os links de pagamento (Asaas/Pix), features do produto, etc."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            💡 Dica: Cole links de pagamento, features e qualquer informação relevante
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-primary-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Produto Ativo
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                { t('save') }
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default function CatalogTab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (formData: ProductFormData, id?: string) => {
        try {
            if (id) {
                // Update existing product
                const { error } = await supabase
                    .from('products')
                    .update(formData)
                    .eq('id', id);

                if (error) {
                    console.error('Erro detalhado ao atualizar:', error.message || error);
                    throw error;
                }

                setProducts(prev =>
                    prev.map(p => p.id === id ? { ...p, ...formData } : p)
                );
            } else {
                // Create new product
                // Note: company_id is automatically set by the database trigger
                // but we log the payload for debugging
                console.log('Creating product with payload:', formData);

                const { data, error } = await supabase
                    .from('products')
                    .insert([formData])
                    .select()
                    .single();

                if (error) {
                    console.error('Erro detalhado ao criar produto:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    throw error;
                }

                setProducts(prev => [data, ...prev]);
            }
        } catch (error: any) {
            console.error('Error saving product:', error);
            throw error;
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este produto?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Erro ao deletar produto. Verifique o console.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Catálogo de Produtos</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Gerencie os produtos e serviços da sua loja
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    Novo Produto
                </button>
            </div>

            {/* Products List */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Package className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{t('noProductsRegistered')}</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition"
                    >
                        Criar Primeiro Produto
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                            {product.name}
                                        </h3>
                                        {!product.is_active && (
                                            <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                                                Inativo
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            / {product.unit}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                                            {product.category === 'service' ? 'Serviço' :
                                                product.category === 'product' ? 'Produto' : 'Assinatura'}
                                        </span>
                                    </div>

                                    {product.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 whitespace-pre-wrap">
                                            {product.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Deletar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <ProductModal
                    product={null}
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleSaveProduct}
                />
            )}

            {editingProduct && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
}
