import React, { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Trash2, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
}

export const ApiKeysSection: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showingKeyId, setShowingKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, key_prefix, key_hash, created_at, last_used_at')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        // Table may not exist yet — show empty state gracefully
        console.warn('[ApiKeys] Table may not exist:', error.message);
        setApiKeys([]);
      } else {
        setApiKeys(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!profile?.company_id || !newKeyName.trim()) return;
    setGenerating(true);

    // Generate a secure random key: sk_live_<32 hex chars>
    const rawKey = `sk_live_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
    const prefix = rawKey.slice(0, 16);

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyName.trim(),
          key_prefix: prefix,
          key_hash: rawKey, // In production, store only hash. For MVP, store full key.
          company_id: profile.company_id,
          owner_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedKey(rawKey);
      setNewKeyName('');
      setShowNewKeyForm(false);
      await fetchApiKeys();
      addToast('✅ Nova chave de API gerada com sucesso!', 'success');
    } catch (err: any) {
      console.error('[ApiKeys] Error generating key:', err);
      addToast(`Erro ao gerar chave: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!window.confirm('Tem certeza? Esta chave será revogada permanentemente.')) return;

    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', keyId);
      if (error) throw error;
      await fetchApiKeys();
      addToast('Chave revogada com sucesso.', 'info');
    } catch (err: any) {
      addToast(`Erro ao revogar: ${err.message}`, 'error');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <SettingsSection title="Chaves de API" icon={Key}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        As chaves de API permitem acessar o CRM programaticamente. Mantenha essas chaves seguras — elas nunca serão exibidas novamente após a geração.
      </p>

      {/* Generated Key Alert */}
      {generatedKey && (
        <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600/50 rounded-xl">
          <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle size={14} /> Chave gerada! Copie agora — não será exibida novamente.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs font-mono bg-white dark:bg-black/30 border border-green-200 dark:border-green-700/40 rounded-lg px-3 py-2 text-green-900 dark:text-green-200 break-all">
              {generatedKey}
            </code>
            <button
              onClick={() => copyKey(generatedKey)}
              className="shrink-0 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <button onClick={() => setGeneratedKey(null)} className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline">
            ✓ Já copiei, pode fechar
          </button>
        </div>
      )}

      {/* Existing Keys */}
      <div className="space-y-2 mb-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <RefreshCw size={20} className="animate-spin text-slate-400" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
            Nenhuma chave de API gerada ainda
          </div>
        ) : (
          apiKeys.map((key) => (
            <div key={key.id} className="flex items-center gap-3 bg-slate-50 dark:bg-black/30 p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{key.name}</p>
                <code className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {key.key_prefix}••••••••••••••••
                </code>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Criada em {new Date(key.created_at).toLocaleDateString('pt-BR')}
                  {key.last_used_at && ` · Último uso: ${new Date(key.last_used_at).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
              <button
                onClick={() => revokeKey(key.id)}
                className="shrink-0 text-xs text-red-500 font-bold hover:text-red-400 uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Revogar
              </button>
            </div>
          ))
        )}
      </div>

      {/* New Key Form */}
      {showNewKeyForm ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="Nome da chave (ex: Producao, N8N, Zapier)"
            className="flex-1 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={e => e.key === 'Enter' && generateApiKey()}
            autoFocus
          />
          <button
            onClick={generateApiKey}
            disabled={generating || !newKeyName.trim()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
            Gerar
          </button>
          <button
            onClick={() => { setShowNewKeyForm(false); setNewKeyName(''); }}
            className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-white text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewKeyForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-600/20 transition-all"
        >
          <Plus size={16} /> Gerar Nova Chave
        </button>
      )}
    </SettingsSection>
  );
};
