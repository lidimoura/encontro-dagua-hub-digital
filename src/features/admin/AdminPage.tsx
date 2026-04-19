import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Shield, Users, Package, Search, Edit, User, Building2, DollarSign, X, CheckCircle, XCircle, Loader2, ShieldOff, RefreshCw, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { InviteGenerator } from './components/InviteGenerator';
import CatalogTab from './CatalogTab';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/types';
import { useToast } from '@/context/ToastContext';

// ── Helpers ──────────────────────────────────────────────────────────────────────
const fmtDate = (d: string | null | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};
const isExpired = (d: string | null | undefined) => !!d && new Date(d) < new Date();

export interface EditModalProps {
    profile: Profile;
    onClose: () => void;
    onSave: (data: Partial<Profile>) => Promise<void>;
}

function EditUserModal({ profile, onClose, onSave }: EditModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        plan_type: profile.plan_type || 'free',
        status: profile.status || 'active',
        phone: profile.phone || '',
        role: profile.role || 'user'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('editUser')}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.email}</p>
                    {profile.full_name && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{profile.full_name}</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('plan')}
                        </label>
                        <select
                            value={formData.plan_type}
                            onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="free">Free</option>
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('status')}
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="active">{t('active')}</option>
                            <option value="inactive">{t('inactive')}</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('phone')}
                        </label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
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
                                    {t('saving')}
                                </>
                            ) : (
                                t('save')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default function AdminPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profile: currentUserProfile, loading: authLoading } = useAuth();
    const { addToast } = useToast();

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'catalog'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    useEffect(() => {
        if (!authLoading) {
            checkAdminAccess();
        }
    }, [authLoading, currentUserProfile]);

    const checkAdminAccess = () => {
        if (!currentUserProfile || (currentUserProfile.role !== 'admin' && currentUserProfile.role !== 'super_admin')) {
            addToast('Acesso negado. Apenas administradores.', 'error');
            navigate('/dashboard');
            return;
        }
        fetchProfiles();
    };

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            addToast('Erro ao carregar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term: string) => setSearchTerm(term);

    // ── Extend trial +7 days ────────────────────────────────────────────
    const handleExtendTrial = async (prof: Profile) => {
        setActionLoading(prof.id + '_extend');
        const current = (prof as any).trial_expires_at;
        const base = current && !isExpired(current) ? new Date(current) : new Date();
        const newExpiry = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase.from('profiles')
            .update({ trial_expires_at: newExpiry, access_level: 'trial' } as any)
            .eq('id', prof.id);
        if (error) addToast('Erro: ' + error.message, 'error');
        else { addToast(`✅ Trial de ${prof.email} renovado +7 dias`, 'success'); await fetchProfiles(); }
        setActionLoading(null);
    };

    // ── Toggle suspend ─────────────────────────────────────────────────
    const handleToggleSuspend = async (prof: Profile) => {
        const isSusp = (prof as any).access_level === 'suspended';
        setActionLoading(prof.id + '_suspend');
        const { error } = await supabase.from('profiles')
            .update({ access_level: isSusp ? 'trial' : 'suspended' } as any)
            .eq('id', prof.id);
        if (error) addToast('Erro: ' + error.message, 'error');
        else { addToast(isSusp ? `✅ ${prof.email} reativado` : `🔒 ${prof.email} suspenso`, 'success'); await fetchProfiles(); }
        setActionLoading(null);
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async (prof: Profile) => {
        if (!window.confirm(`⚠️ Excluir PERMANENTEMENTE ${prof.email}? Esta ação não pode ser desfeita.`)) return;
        setActionLoading(prof.id + '_delete');
        const { error } = await supabase.from('profiles').delete().eq('id', prof.id);
        if (error) addToast('Erro ao excluir: ' + error.message, 'error');
        else { addToast(`🗑️ ${prof.email} excluído.`, 'success'); await fetchProfiles(); }
        setActionLoading(null);
    };

    const handleSaveUser = async (data: Partial<Profile>) => {
        if (!editingProfile) return;
        try {
            const { error } = await supabase.from('profiles').update(data).eq('id', editingProfile.id);
            if (error) throw error;
            setProfiles(profiles.map(p => p.id === editingProfile.id ? { ...p, ...data } : p));
            addToast('Usuário atualizado com sucesso', 'success');
            setEditingProfile(null);
        } catch (error) {
            console.error('Error updating user:', error);
            addToast('Erro ao atualizar usuário', 'error');
        }
    };

    const filteredProfiles = profiles.filter(p =>
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-primary-500" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {t('adminPanelTitle')}
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {t('adminPanelSubtitle')}
                </p>
            </div>

            {/* Invite Generator - Always visible for Admin */}
            <div className="max-w-4xl mx-auto mb-6">
                <InviteGenerator onInviteGenerated={fetchProfiles} />
            </div>

            {/* Tabs Navigation */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <Users size={18} />
                        {t('users')}
                    </button>
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'catalog'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <Package size={18} />
                        {t('catalog')}
                    </button>
                </div>
            </div>

            {/* Search Bar - Only for Users Tab */}
            {activeTab === 'users' && (
                <div className="max-w-4xl mx-auto mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Stats - Only for Users Tab */}
            {activeTab === 'users' && (
                <div className="max-w-4xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{t('totalUsers')}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {profiles.length}
                        </p>
                    </div>
                    {/* ... other stats ... */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{t('planMonthly')}</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {profiles.filter(p => p.plan_type === 'monthly').length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{t('planAnnual')}</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                            {profiles.filter(p => p.plan_type === 'annual').length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{t('planFree')}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-600">
                            {profiles.filter(p => !p.plan_type || p.plan_type === 'free').length}
                        </p>
                    </div>
                    {/* V6.3: Leads Provadágua counter */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-purple-500/40">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-purple-500 text-sm">🌿</span>
                            <span className="text-xs text-purple-400 font-bold">Lead Provadágua</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                            {profiles.filter(p => p.role === 'user' || p.user_type === 'lead_provadagua').length}
                        </p>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto">
                {activeTab === 'users' ? (
                    <div className="overflow-x-auto">
                        {filteredProfiles.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('noUsersFound')}</div>
                        ) : (
                            <table className="w-full min-w-[900px] text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="px-4 py-3 text-left">Usuário</th>
                                        <th className="px-4 py-3 text-left">Role / Plano</th>
                                        <th className="px-4 py-3 text-left">
                                            <Clock size={12} className="inline mr-1" />Cadastro
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <Clock size={12} className="inline mr-1" />Expiração Trial
                                        </th>
                                        <th className="px-4 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredProfiles.map((profile) => {
                                        const isSusp = (profile as any).access_level === 'suspended';
                                        const trialDate = (profile as any).trial_expires_at;
                                        const expired = isExpired(trialDate);
                                        const busy = actionLoading?.startsWith(profile.id);
                                        return (
                                            <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{profile.email}</p>
                                                    {profile.full_name && <p className="text-xs text-slate-500">{profile.full_name}</p>}
                                                    {(profile.role === 'user' || (profile as any).user_type === 'lead_provadagua') && (
                                                        <span className="text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                                                            🌿 LEAD
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-500">{profile.role || 'user'}</span>
                                                    <span className={`ml-2 text-xs font-bold ${
                                                        profile.plan_type === 'annual' ? 'text-purple-600' :
                                                        profile.plan_type === 'monthly' ? 'text-green-600' : 'text-slate-500'
                                                    }`}>{profile.plan_type?.toUpperCase() || 'FREE'}</span>
                                                    {isSusp && <span className="ml-2 text-xs text-red-400 font-bold">🔴 SUSP</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                    {fmtDate((profile as any).created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <span className={expired ? 'text-orange-400 font-bold' : 'text-slate-500'}>
                                                        {fmtDate(trialDate)}
                                                        {expired && ' ⚠️'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        {/* WA */}
                                                        {profile.email && (profile.role === 'user' || (profile as any).user_type === 'lead_provadagua') && (
                                                            <a href={`https://wa.me/5541992557600?text=${encodeURIComponent(`Oi Lidi! Lead: ${profile.email}`)}`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="px-2 py-1.5 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-500 text-white transition">
                                                                💬 WA
                                                            </a>
                                                        )}
                                                        {/* +7d */}
                                                        <button onClick={() => handleExtendTrial(profile)} disabled={!!busy}
                                                            className="px-2 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-40 flex items-center gap-1">
                                                            {actionLoading === profile.id + '_extend'
                                                                ? <Loader2 size={11} className="animate-spin" />
                                                                : <RefreshCw size={11} />}
                                                            +7d
                                                        </button>
                                                        {/* Suspend/Activate */}
                                                        <button onClick={() => handleToggleSuspend(profile)} disabled={!!busy}
                                                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-40 flex items-center gap-1 border ${
                                                                isSusp
                                                                    ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                                                                    : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20'
                                                            }`}>
                                                            {actionLoading === profile.id + '_suspend'
                                                                ? <Loader2 size={11} className="animate-spin" />
                                                                : isSusp ? <CheckCircle size={11} /> : <ShieldOff size={11} />}
                                                            {isSusp ? 'Ativar' : 'Suspender'}
                                                        </button>
                                                        {/* Edit */}
                                                        <button onClick={() => setEditingProfile(profile)}
                                                            className="px-2 py-1.5 rounded-lg text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white transition flex items-center gap-1">
                                                            <Edit size={11} />{t('editUser')}
                                                        </button>
                                                        {/* Delete */}
                                                        {profile.role !== 'admin' && (
                                                            <button onClick={() => handleDelete(profile)} disabled={!!busy}
                                                                className="px-2 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-40 flex items-center gap-1">
                                                                {actionLoading === profile.id + '_delete'
                                                                    ? <Loader2 size={11} className="animate-spin" />
                                                                    : <Trash2 size={11} />}
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
                        )}
                    </div>
                ) : (
                    /* Catalog Tab */
                    <CatalogTab />
                )}
            </div>

            {/* Back Button */}
            <div className="max-w-4xl mx-auto mt-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full md:w-auto px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                    ← {t('backToDashboard')}
                </button>
            </div>

            {/* Edit Modal */}
            {editingProfile && (
                <EditUserModal
                    profile={editingProfile}
                    onClose={() => setEditingProfile(null)}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
}
