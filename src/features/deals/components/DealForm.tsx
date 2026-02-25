import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { INITIAL_PRODUCTS as initialProducts } from '@/services/mockData';
import { Modal } from '@/components/ui/Modal';
import { DealStatus, Product } from '@/types';
import { X, Plus, DollarSign, User, Building2 } from 'lucide-react';

interface DealFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
}

export const DealForm: React.FC<DealFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    const { t } = useTranslation();

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [value, setValue] = useState(initialData?.value || 0);
    const [stageId, setStageId] = useState(initialData?.status || DealStatus.LEAD);
    const [contactName, setContactName] = useState(initialData?.contactName || '');
    const [companyName, setCompanyName] = useState(initialData?.companyName || '');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium');

    // Filter products based on user requirement
    // Hide "OpenAI API" and "Vercel". Show ONLY "Consulting" and "Services".
    const availableProducts = initialProducts.filter((p: Product) =>
        ['Consulting', 'Services', 'Setup', 'Subscription'].includes(p.category || '') &&
        !['tech_stack', 'infra', 'api_cost'].includes(p.category || '') &&
        !p.name.toLowerCase().includes('openai') &&
        !p.name.toLowerCase().includes('vercel')
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            value: Number(value),
            status: stageId,
            contactName, // In a real app this would be an ID lookup
            companyName, // In a real app this would be an ID lookup
            priority,
            items: selectedProductId ? [{ productId: selectedProductId, quantity: 1 }] : [],
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? t('editDeal' as any) : t('newDeal' as any)}>
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t('dealName')}
                    </label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        placeholder="Ex: Contrato de Consultoria..."
                    />
                </div>

                {/* Value */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t('value')}
                    </label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="number"
                            min="0"
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                            className="w-full pl-9 px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                </div>

                {/* Contact & Company */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('contactName')}
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="w-full pl-9 px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                placeholder="Nome..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('company')}
                        </label>
                        <div className="relative">
                            <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full pl-9 px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                placeholder="Empresa..."
                            />
                        </div>
                    </div>
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('priority')}
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        >
                            <option value="low">{t('low')}</option>
                            <option value="medium">{t('medium')}</option>
                            <option value="high">{t('high')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Estágio
                        </label>
                        <select
                            value={stageId}
                            onChange={(e) => setStageId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        >
                            {Object.values(DealStatus).map((status) => (
                                <option key={status} value={status}>
                                    {t(status.toLowerCase() as any) || status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>


                {/* Product Select (Filtered) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Produto / Serviço
                    </label>
                    <select
                        value={selectedProductId}
                        onChange={(e) => {
                            setSelectedProductId(e.target.value);
                            // Auto-update value if product selected
                            const product = availableProducts.find(p => p.id === e.target.value);
                            if (product) setValue(product.basePrice);
                        }}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    >
                        <option value="">Selecione...</option>
                        {availableProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} - R$ {product.basePrice}
                            </option>
                        ))}
                    </select>
                    {availableProducts.length === 0 && (
                        <p className="text-xs text-amber-500 mt-1">
                            {t('noProductsAdded')}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
                    >
                        {initialData ? t('save') : t('createDeal')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
