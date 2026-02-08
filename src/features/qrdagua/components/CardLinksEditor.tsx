/**
 * Card Digital Links Editor Component
 * 
 * Visual editor for managing multiple links in Card Digital (Mini-Linktree)
 */

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface CardLink {
    id: string;
    type: string;
    label: string;
    url: string;
    icon: string;
    active: boolean;
}

interface LinksEditorProps {
    links: CardLink[];
    onChange: (links: CardLink[]) => void;
}

const LINK_TYPES = [
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'link', label: 'Link/Site', icon: '🌐' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Telefone', icon: '📱' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'custom', label: 'Personalizado', icon: '⭐' },
];

export const CardLinksEditor: React.FC<LinksEditorProps> = ({ links, onChange }) => {
    const addLink = () => {
        const newLink: CardLink = {
            id: crypto.randomUUID(),
            type: 'link',
            label: '',
            url: '',
            icon: '🌐',
            active: true,
        };
        onChange([...links, newLink]);
    };

    const updateLink = (id: string, field: keyof CardLink, value: any) => {
        onChange(links.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        ));
    };

    const removeLink = (id: string) => {
        onChange(links.filter(link => link.id !== id));
    };

    const moveLink = (index: number, direction: 'up' | 'down') => {
        const newLinks = [...links];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= links.length) return;

        [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
        onChange(newLinks);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Links do Cartão Digital
                </h3>
                <button
                    type="button"
                    onClick={addLink}
                    className="flex items-center gap-2 px-3 py-1.5 bg-acai-900 text-white rounded-lg text-sm font-medium hover:bg-acai-800 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Link
                </button>
            </div>

            {links.length === 0 ? (
                <div className="bg-slate-50 dark:bg-rionegro-950 border-2 border-dashed border-slate-300 dark:border-rionegro-700 rounded-lg p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {t('noLinksAdded')}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {links.map((link, index) => (
                        <div
                            key={link.id}
                            className="bg-white dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg p-4"
                        >
                            <div className="flex items-start gap-3">
                                {/* Drag Handle */}
                                <div className="flex flex-col gap-1 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => moveLink(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Mover para cima"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                    <button
                                        type="button"
                                        onClick={() => moveLink(index, 'down')}
                                        disabled={index === links.length - 1}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Mover para baixo"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Type Selector */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            Tipo
                                        </label>
                                        <select
                                            value={link.type}
                                            onChange={(e) => {
                                                const selectedType = LINK_TYPES.find(t => t.value === e.target.value);
                                                updateLink(link.id, 'type', e.target.value);
                                                if (selectedType) {
                                                    updateLink(link.id, 'icon', selectedType.icon);
                                                }
                                            }}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg text-sm text-slate-900 dark:text-white"
                                        >
                                            {LINK_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.icon} {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Label */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            Texto do Botão
                                        </label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg text-sm text-slate-900 dark:text-white"
                                            placeholder="Ex: Falar no WhatsApp"
                                        />
                                    </div>

                                    {/* URL */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            URL / Número
                                        </label>
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg text-sm text-slate-900 dark:text-white"
                                            placeholder={
                                                link.type === 'whatsapp' ? '5511999999999' :
                                                    link.type === 'email' ? 'contato@exemplo.com' :
                                                        link.type === 'phone' ? '11999999999' :
                                                            'https://exemplo.com'
                                            }
                                        />
                                    </div>

                                    {/* Icon Picker */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            Ícone (Emoji)
                                        </label>
                                        <input
                                            type="text"
                                            value={link.icon}
                                            onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-rionegro-950 border border-slate-200 dark:border-rionegro-800 rounded-lg text-sm text-slate-900 dark:text-white text-center text-2xl"
                                            placeholder="😊"
                                            maxLength={2}
                                        />
                                    </div>

                                    {/* Active Toggle */}
                                    <div className="flex items-center gap-2 pt-5">
                                        <input
                                            type="checkbox"
                                            checked={link.active}
                                            onChange={(e) => updateLink(link.id, 'active', e.target.checked)}
                                            className="w-4 h-4 text-acai-900 bg-white dark:bg-rionegro-950 border-slate-300 dark:border-rionegro-700 rounded focus:ring-2 focus:ring-acai-900"
                                        />
                                        <label className="text-sm text-slate-700 dark:text-slate-300">
                                            Link ativo
                                        </label>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => removeLink(link.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Remover link"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {links.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                        💡 <strong>Dica:</strong> Use as setas para reordenar os links. A ordem aqui é a ordem que aparecerá no cartão digital.
                    </p>
                </div>
            )}
        </div>
    );
};
