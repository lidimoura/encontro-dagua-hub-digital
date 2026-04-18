import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Users, RefreshCw, PlusCircle, Trash2, ShieldOff, ShieldCheck,
  Clock, Mail, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, X
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Lead {
  id: string;
  email: string;
  full_name: string | null;
  trial_expires_at: string | null;
  access_level: string | null;
  is_super_admin: boolean;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const isExpired = (d: string | null) => {
  if (!d) return false;
  return new Date(d) < new Date();
};

const statusBadge = (lead: Lead) => {
  if (lead.is_super_admin) return { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
  if (lead.access_level === 'suspended') return { label: 'Suspenso', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
  if (isExpired(lead.trial_expires_at)) return { label: 'Expirado', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
  return { label: 'Ativo', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
};

// ── Modal: Criar Usuário ──────────────────────────────────────────────────────
interface CreateModalProps {
  onClose: () => void;
  onCreated: () => void;
}
const CreateUserModal: React.FC<CreateModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Usa signUp nativo (admin não tem acesso ao admin.createUser no frontend)
      const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error: signUpError } = await supabase.auth.signUp({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        options:  { data: { full_name: form.name.trim(), user_type: 'lead_provadagua' } },
      });
      if (signUpError) throw signUpError;

      // Aguarda trigger criar o perfil (≈ 1s) e depois atualiza trial
      await new Promise(r => setTimeout(r, 1200));
      const { data: profiles } = await supabase
        .from('profiles').select('id').eq('email', form.email.trim().toLowerCase()).maybeSingle();
      if (profiles?.id) {
        await supabase.from('profiles').update({
          full_name: form.name.trim(),
          trial_expires_at: trialExpiry,
          access_level: 'trial',
        }).eq('id', profiles.id);
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><PlusCircle className="text-amber-400" size={20} /> Criar Usuário</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome completo</label>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Amanda Silva" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="amanda@empresa.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha inicial</label>
            <div className="relative">
              <input required type={showPw ? 'text' : 'password'} minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Mín. 6 caracteres" />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm flex items-center gap-1.5"><AlertCircle size={14} />{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Criando...</> : <><PlusCircle size={16} /> Criar + Trial 7 dias</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // lead id

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, trial_expires_at, access_level, is_super_admin, created_at')
      .order('created_at', { ascending: false });
    if (error) { showToast('Erro ao carregar perfis: ' + error.message, false); }
    else { setLeads(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Renovar +7 dias ──────────────────────────────────────────────────────
  const handleRenew = async (lead: Lead) => {
    setActionLoading(lead.id + '_renew');
    const base = lead.trial_expires_at && !isExpired(lead.trial_expires_at)
      ? new Date(lead.trial_expires_at)
      : new Date();
    const newExpiry = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from('profiles')
      .update({ trial_expires_at: newExpiry, access_level: 'trial' })
      .eq('id', lead.id);
    if (error) showToast('Erro: ' + error.message, false);
    else { showToast(`✅ Trial de ${lead.full_name || lead.email} renovado +7 dias`); await fetchLeads(); }
    setActionLoading(null);
  };

  // ── Suspender / Ativar ───────────────────────────────────────────────────
  const handleToggleSuspend = async (lead: Lead) => {
    const isSuspended = lead.access_level === 'suspended';
    setActionLoading(lead.id + '_suspend');
    const { error } = await supabase.from('profiles')
      .update({ access_level: isSuspended ? 'trial' : 'suspended' })
      .eq('id', lead.id);
    if (error) showToast('Erro: ' + error.message, false);
    else { showToast(isSuspended ? `✅ ${lead.email} reativado.` : `🔒 ${lead.email} suspenso.`); await fetchLeads(); }
    setActionLoading(null);
  };

  // ── Excluir permanentemente ───────────────────────────────────────────────
  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`⚠️ Excluir PERMANENTEMENTE ${lead.email}? Esta ação apaga Auth + Profile e não pode ser desfeita.`)) return;
    setActionLoading(lead.id + '_delete');
    // Deleta profile (Auth requer Admin Key — apenas pode ser feito via RPC ou Edge Function)
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', lead.id);
    if (profileErr) { showToast('Erro ao deletar perfil: ' + profileErr.message, false); setActionLoading(null); return; }
    // Tenta chamar RPC admin_delete_user se existir, senão avisa
    const { error: authErr } = await supabase.rpc('admin_delete_auth_user', { target_user_id: lead.id }).single();
    if (authErr) {
      showToast(`Profile excluído. ⚠️ Auth user precisa ser deletado manualmente no Supabase Dashboard (ID: ${lead.id.slice(0, 8)}...)`, false);
    } else {
      showToast(`🗑️ ${lead.email} excluído permanentemente.`);
    }
    await fetchLeads();
    setActionLoading(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#02040a] text-white p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border transition-all
          ${toast.ok ? 'bg-green-900/90 border-green-500/30 text-green-200' : 'bg-red-900/90 border-red-500/30 text-red-200'}`}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={fetchLeads} />}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={12} /> Admin · Gestão de Leads
            </div>
            <h1 className="text-3xl font-bold text-white">Painel de Leads — Provadágua</h1>
            <p className="text-slate-400 text-sm mt-1">{leads.length} usuários cadastrados</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
              <RefreshCw size={15} /> Atualizar
            </button>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all">
              <PlusCircle size={15} /> Criar Lead
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 size={32} className="animate-spin text-amber-400" /></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-24 text-slate-500"><Users size={48} className="mx-auto mb-4 opacity-30" /><p>Nenhum lead cadastrado.</p></div>
        ) : (
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-4 text-slate-400 font-medium">Usuário</th>
                  <th className="text-left px-5 py-4 text-slate-400 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-4 text-slate-400 font-medium hidden lg:table-cell">Trial expira</th>
                  <th className="text-left px-5 py-4 text-slate-400 font-medium hidden lg:table-cell">Cadastro</th>
                  <th className="text-right px-5 py-4 text-slate-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map(lead => {
                  const badge    = statusBadge(lead);
                  const isBusy   = actionLoading?.startsWith(lead.id);
                  const isSusp   = lead.access_level === 'suspended';
                  return (
                    <tr key={lead.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                            {(lead.full_name || lead.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{lead.full_name || '—'}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1"><Mail size={10} />{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-slate-400 text-xs">
                        <span className={isExpired(lead.trial_expires_at) ? 'text-orange-400' : ''}>
                          <Clock size={11} className="inline mr-1" />
                          {fmtDate(lead.trial_expires_at)}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-slate-400 text-xs">
                        {fmtDate(lead.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Renovar +7d */}
                          {!lead.is_super_admin && (
                            <button
                              onClick={() => handleRenew(lead)}
                              disabled={!!isBusy}
                              title="Renovar +7 dias"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-all disabled:opacity-40"
                            >
                              {actionLoading === lead.id + '_renew'
                                ? <Loader2 size={12} className="animate-spin" />
                                : <RefreshCw size={12} />}
                              +7d
                            </button>
                          )}

                          {/* Suspender / Reativar */}
                          {!lead.is_super_admin && (
                            <button
                              onClick={() => handleToggleSuspend(lead)}
                              disabled={!!isBusy}
                              title={isSusp ? 'Reativar' : 'Suspender'}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 border
                                ${isSusp
                                  ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                                  : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20'
                                }`}
                            >
                              {actionLoading === lead.id + '_suspend'
                                ? <Loader2 size={12} className="animate-spin" />
                                : isSusp ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
                              {isSusp ? 'Ativar' : 'Suspender'}
                            </button>
                          )}

                          {/* Excluir */}
                          {!lead.is_super_admin && (
                            <button
                              onClick={() => handleDelete(lead)}
                              disabled={!!isBusy}
                              title="Excluir permanentemente"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all disabled:opacity-40"
                            >
                              {actionLoading === lead.id + '_delete'
                                ? <Loader2 size={12} className="animate-spin" />
                                : <Trash2 size={12} />}
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <p className="text-xs text-slate-600 mt-4 text-center">
          ⚠️ Exclusão de Auth user requer a RPC <code>admin_delete_auth_user</code> ou acesso manual ao Supabase Dashboard.
          &nbsp;·&nbsp; Ações de renovação e suspensão são instantâneas.
        </p>
      </div>
    </div>
  );
};

export default AdminPage;
