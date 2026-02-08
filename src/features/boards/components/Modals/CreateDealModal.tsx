import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { Deal, Product } from '@/types';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

interface CreateDealModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface DealItem {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export const CreateDealModal: React.FC<CreateDealModalProps> = ({ isOpen, onClose }) => {
    const { addDeal, activeBoard, activeBoardId, products } = useCRM();
    const { profile } = useAuth();
    const { t } = useTranslation();

    const [newDealData, setNewDealData] = useState({
        title: '',
        companyName: '',
        contactName: '',
        email: '',
        phone: ''
    });

    const [dealItems, setDealItems] = useState<DealItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    if (!isOpen) return null;

    const handleAddItem = () => {
        if (products.length === 0) return;

        const firstProduct = products[0];
        setDealItems([...dealItems, {
            productId: firstProduct.id,
            quantity: 1,
            unitPrice: firstProduct.base_price || 0
        }]);
    };

    const handleRemoveItem = (index: number) => {
        setDealItems(dealItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof DealItem, value: string | number) => {
        const updated = [...dealItems];
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                updated[index] = {
                    ...updated[index],
                    productId: value as string,
                    unitPrice: product.base_price || 0
                };
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setDealItems(updated);
    };

    const calculateTotalValue = () => {
        return dealItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!profile?.company_id) {
                throw new Error('Company ID not found');
            }

            // 1. Create or find contact
            let contactId: string | null = null;

            if (newDealData.email) {
                // Check if contact exists
                const { data: existingContact } = await supabase
                    .from('contacts')
                    .select('id')
                    .eq('email', newDealData.email)
                    .eq('company_id', profile.company_id)
                    .single();

                if (existingContact) {
                    contactId = existingContact.id;
                } else {
                    // Create new contact
                    const { data: newContact, error: contactError } = await supabase
                        .from('contacts')
                        .insert({
                            name: newDealData.contactName,
                            email: newDealData.email,
                            phone: newDealData.phone,
                            company_name: newDealData.companyName,
                            company_id: profile.company_id,
                            owner_id: profile.id,
                            stage: 'LEAD',
                            status: 'ACTIVE'
                        })
                        .select('id')
                        .single();

                    if (contactError) throw contactError;
                    contactId = newContact.id;
                }
            }

            // 2. Get first stage of active board
            const { data: stages } = await supabase
                .from('board_stages')
                .select('id')
                .eq('board_id', activeBoardId)
                .order('order', { ascending: true })
                .limit(1);

            const firstStageId = stages?.[0]?.id;

            // 3. Create deal
            const { data: newDeal, error: dealError } = await supabase
                .from('deals')
                .insert({
                    title: newDealData.title,
                    value: calculateTotalValue(),
                    contact_id: contactId,
                    board_id: activeBoardId,
                    stage_id: firstStageId,
                    company_id: profile.company_id,
                    owner_id: profile.id,
                    status: 'OPEN',
                    priority: 'medium',
                    probability: 10,
                    selected_products: dealItems.map(item => item.productId), // Array of product IDs
                    metadata: {
                        items: dealItems,
                        companyName: newDealData.companyName
                    }
                })
                .select()
                .single();

            if (dealError) throw dealError;

            addToast(t('dealCreated') || 'Deal created successfully!', 'success');
            onClose();
            setNewDealData({ title: '', companyName: '', contactName: '', email: '', phone: '' });
            setDealItems([]);

            // Refresh page to show new deal
            window.location.reload();
        } catch (error: any) {
            console.error('Error creating deal:', error);
            addToast(error.message || 'Failed to create deal', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-dark-card z-10">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">{t('newDeal')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleCreateDeal} className="p-5 space-y-4">
                    {/* Basic Info */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('dealName')}</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Ex: Contrato Anual - Acme"
                            value={newDealData.title}
                            onChange={e => setNewDealData({ ...newDealData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('company')}</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Empresa Ltd"
                                value={newDealData.companyName}
                                onChange={e => setNewDealData({ ...newDealData, companyName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('contactName')}</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Nome do Contato"
                                value={newDealData.contactName}
                                onChange={e => setNewDealData({ ...newDealData, contactName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="email@exemplo.com"
                                value={newDealData.email}
                                onChange={e => setNewDealData({ ...newDealData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                            <input
                                type="tel"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="(00) 00000-0000"
                                value={newDealData.phone}
                                onChange={e => setNewDealData({ ...newDealData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase">Produtos/Serviços</h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                disabled={products.length === 0}
                                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={14} />
                                Adicionar Produto
                            </button>
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-black/10 rounded-lg">
                                {t('noProductsAdminFirst')}
                            </div>
                        )}

                        {dealItems.map((item, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <select
                                    value={item.productId}
                                    onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - R$ {product.base_price?.toFixed(2) || '0.00'}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-20 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Qtd"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="w-28 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Preço"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {dealItems.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Valor Total:</span>
                                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                    R$ {calculateTotalValue().toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-lg mt-2 shadow-lg shadow-primary-600/20 transition-all">
                        {t('createDeal')}
                    </button>
                </form>
            </div>
        </div>
    );
};
