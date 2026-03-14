import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, RefreshCw, Globe, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface WebhookEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST';
  events: string[];
  is_active: boolean;
  created_at: string;
  last_triggered_at: string | null;
}

const AVAILABLE_EVENTS = [
  { value: 'lead.created', label: 'Lead Criado' },
  { value: 'deal.created', label: 'Negócio Criado' },
  { value: 'deal.won', label: 'Negócio Ganho' },
  { value: 'deal.lost', label: 'Negócio Perdido' },
  { value: 'deal.moved', label: 'Negócio Movido' },
  { value: 'activity.completed', label: 'Atividade Concluída' },
  { value: 'contact.updated', label: 'Contato Atualizado' },
];

export const WebhooksSection: React.FC = () => {
  const { profile } = useAuth();
  const { addToast } = useToast();
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newMethod, setNewMethod] = useState<'GET' | 'POST'>('POST');
  const [newEvents, setNewEvents] = useState<string[]>(['lead.created', 'deal.won']);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Webhooks] Table may not exist:', error.message);
        setEndpoints([]);
      } else {
        setEndpoints(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const addEndpoint = async () => {
    if (!profile?.company_id || !newUrl.trim()) return;
    if (!newUrl.startsWith('http')) {
      addToast('A URL deve começar com http:// ou https://', 'error');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('webhook_endpoints').insert({
        url: newUrl.trim(),
        method: newMethod,
        events: newEvents,
        is_active: true,
        company_id: profile.company_id,
        owner_id: profile.id,
      });

      if (error) throw error;

      addToast('✅ Endpoint adicionado com sucesso!', 'success');
      setShowAddForm(false);
      setNewUrl('');
      setNewMethod('POST');
      setNewEvents(['lead.created', 'deal.won']);
      await fetchEndpoints();
    } catch (err: any) {
      addToast(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleEndpoint = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('webhook_endpoints')
        .update({ is_active: !currentState })
        .eq('id', id);
      if (error) throw error;
      setEndpoints(prev => prev.map(e => e.id === id ? { ...e, is_active: !currentState } : e));
    } catch (err: any) {
      addToast(`Erro ao atualizar: ${err.message}`, 'error');
    }
  };

  const deleteEndpoint = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este endpoint?')) return;
    try {
      const { error } = await supabase.from('webhook_endpoints').delete().eq('id', id);
      if (error) throw error;
      setEndpoints(prev => prev.filter(e => e.id !== id));
      addToast('Endpoint removido.', 'info');
    } catch (err: any) {
      addToast(`Erro ao remover: ${err.message}`, 'error');
    }
  };

  const toggleEvent = (event: string) => {
    setNewEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  return (
    <SettingsSection title="Webhooks" icon={Webhook}>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        Configure endpoints para receber eventos em tempo real como <code className="bg-slate-100 dark:bg-white/10 px-1 rounded">lead.created</code>, <code className="bg-slate-100 dark:bg-white/10 px-1 rounded">deal.won</code>, ou <code className="bg-slate-100 dark:bg-white/10 px-1 rounded">activity.completed</code>.
      </p>

      {/* Existing Endpoints */}
      <div className="space-y-3 mb-5">
        {loading ? (
          <div className="flex justify-center py-6">
            <RefreshCw size={20} className="animate-spin text-slate-400" />
          </div>
        ) : endpoints.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
            Nenhum endpoint configurado ainda
          </div>
        ) : (
          endpoints.map(ep => (
            <div key={ep.id} className="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${ep.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ep.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                        {ep.method || 'POST'}
                      </span>
                      <p className="text-sm font-medium text-slate-900 dark:text-white font-mono truncate flex items-center gap-1.5">
                        <Globe size={12} className="text-slate-400 shrink-0" />
                        {ep.url}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ep.events?.map(ev => (
                        <span key={ev} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleEndpoint(ep.id, ep.is_active)}
                    className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide transition-colors ${ep.is_active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={ep.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {ep.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => deleteEndpoint(ep.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Endpoint Form */}
      {showAddForm ? (
        <div className="border border-primary-200 dark:border-primary-700/40 rounded-xl p-4 bg-primary-50/30 dark:bg-primary-900/10 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Novo Endpoint de Webhook</h4>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL do Endpoint *</label>
            <div className="flex gap-2">
              <select
                value={newMethod}
                onChange={e => setNewMethod(e.target.value as 'GET' | 'POST')}
                className="w-24 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://sua-aplicacao.com/webhooks/crm"
                className="flex-1 px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eventos a escutar</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EVENTS.map(ev => (
                <button
                  key={ev.value}
                  type="button"
                  onClick={() => toggleEvent(ev.value)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                    newEvents.includes(ev.value)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary-400'
                  }`}
                >
                  {ev.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={addEndpoint}
              disabled={saving || !newUrl.trim() || newEvents.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Salvar Endpoint
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewUrl(''); }}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-white text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
        >
          <Plus size={16} /> Adicionar Endpoint
        </button>
      )}
    </SettingsSection>
  );
};
