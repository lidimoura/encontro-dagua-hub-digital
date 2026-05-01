/**
 * SuperAdminKeyPanel.tsx
 * Painel exclusivo para lidimfc@gmail.com (is_super_admin = true)
 * Gerencia dois pools de chaves Gemini:
 *   Pool A — Uso exclusivo da Super Admin
 *   Pool B — Demo global para leads sem chave própria
 */

import React, { useState } from 'react';
import { Shield, Key, Plus, Trash2, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { useSettings } from '@/context/settings/SettingsContext';
import { useToast } from '@/context/ToastContext';

interface KeyEntry {
  id: string;
  label: string;
  key: string;
}

function maskKey(key: string): string {
  if (key.length < 12) return '••••••••';
  return key.slice(0, 6) + '••••••••••••' + key.slice(-4);
}

interface PoolPanelProps {
  title: string;
  subtitle: string;
  color: 'purple' | 'emerald';
  keys: KeyEntry[];
  onAdd: (label: string, key: string) => void;
  onRemove: (id: string) => void;
  isSaving: boolean;
}

function PoolPanel({ title, subtitle, color, keys, onAdd, onRemove, isSaving }: PoolPanelProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { addToast } = useToast();

  const ring = color === 'purple' ? 'ring-purple-500/30' : 'ring-emerald-500/30';
  const badge = color === 'purple'
    ? 'bg-purple-900/40 text-purple-300 border border-purple-700/40'
    : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40';
  const btn = color === 'purple'
    ? 'bg-purple-700 hover:bg-purple-600'
    : 'bg-emerald-700 hover:bg-emerald-600';

  const handleCopy = (entry: KeyEntry) => {
    navigator.clipboard.writeText(entry.key).then(() => {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const handleAdd = () => {
    if (!newKey.trim()) return;
    onAdd(newLabel.trim() || `Chave ${keys.length + 1}`, newKey.trim());
    setNewLabel('');
    setNewKey('');
  };

  return (
    <div className={`rounded-2xl bg-slate-900 ring-1 ${ring} p-5 space-y-4`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key size={14} className={color === 'purple' ? 'text-purple-400' : 'text-emerald-400'} />
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
          {keys.length} chave{keys.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de chaves */}
      <div className="space-y-2">
        {keys.length === 0 && (
          <p className="text-xs text-slate-500 italic py-2 text-center">Nenhuma chave cadastrada</p>
        )}
        {keys.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{entry.label}</p>
              <p className="text-xs font-mono text-slate-300 truncate">{maskKey(entry.key)}</p>
            </div>
            <button
              onClick={() => handleCopy(entry)}
              title="Copiar chave"
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              {copiedId === entry.id ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            <button
              onClick={() => onRemove(entry.id)}
              title="Remover chave"
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Adicionar nova chave */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          placeholder="Rótulo (ex: Produção #1)"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-600"
        />
        <input
          type="password"
          placeholder="AIza... (chave Gemini)"
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-600"
        />
        <button
          disabled={!newKey.trim() || isSaving}
          onClick={handleAdd}
          className={`w-full text-xs font-bold text-white rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-40 transition-colors ${btn}`}
        >
          {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
          Adicionar ao Pool
        </button>
      </div>
    </div>
  );
}

export function SuperAdminKeyPanel() {
  const {
    poolAKeys, poolBKeys,
    addPoolAKey, removePoolAKey,
    addPoolBKey, removePoolBKey,
    isSavingKeys,
  } = useSettings();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center">
          <Shield size={16} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Painel Exclusivo — Super Admin</h2>
          <p className="text-xs text-slate-500">
            Gerenciamento de pools de chaves de IA. Visível apenas para lidimfc@gmail.com.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PoolPanel
          title="Pool A — Super Admin"
          subtitle="Usado exclusivamente quando você estiver operando o CRM"
          color="purple"
          keys={poolAKeys}
          onAdd={addPoolAKey}
          onRemove={removePoolAKey}
          isSaving={isSavingKeys}
        />
        <PoolPanel
          title="Pool B — Demo Global"
          subtitle="Emprestado a leads que ainda não têm chave própria"
          color="emerald"
          keys={poolBKeys}
          onAdd={addPoolBKey}
          onRemove={removePoolBKey}
          isSaving={isSavingKeys}
        />
      </div>

      <p className="text-[10px] text-slate-600 text-center">
        Rodízio automático ativo · Fallback para próxima chave ao receber 429 · Pool B esgotado → toast para o lead
      </p>
    </div>
  );
}
