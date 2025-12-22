import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, Shield, Users, CheckCircle, XCircle, Loader2, Edit, X } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    role: string;
    plan_type?: string;
    status?: string;
    created_at: string;
}

interface EditModalProps {
    profile: Profile;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Profile>) => Promise<void>;
}

function EditUserModal({ profile, onClose, onSave }: EditModalProps) {
    const [formData, setFormData] = useState({
        plan_type: profile.plan_type || 'free',
        status: profile.status || 'active',
        phone: profile.phone || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(profile.id, formData);
            onClose();
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Editar Usuário</h3>
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
                            Plano
                        </label>
                        <select
                            value={formData.plan_type}
                            onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="free">Free</option>
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                            <option value="suspended">Suspenso</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Telefone
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
                            Cancelar
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
                                'Salvar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    // SECURITY CHECK: Only lidimfc@gmail.com can access
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.email !== 'lidimfc@gmail.com') {
            navigate('/dashboard');
            return;
        }

        fetchProfiles();
    }, [user, navigate]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setProfiles(data || []);
            setFilteredProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredProfiles(profiles);
            return;
        }

        const searchLower = term.toLowerCase();
        const filtered = profiles.filter(profile =>
            profile.email.toLowerCase().includes(searchLower) ||
            profile.full_name?.toLowerCase().includes(searchLower) ||
            profile.phone?.includes(term)
        );
        setFilteredProfiles(filtered);
    };

    const handleSaveUser = async (id: string, updates: Partial<Profile>) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setProfiles(prev =>
                prev.map(p => p.id === id ? { ...p, ...updates } : p)
            );
            setFilteredProfiles(prev =>
                prev.map(p => p.id === id ? { ...p, ...updates } : p)
            );
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar usuário. Verifique o console.');
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-primary-500" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Admin Panel 2.0
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Gerenciamento avançado de usuários e permissões
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar por email, nome ou telefone..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-4xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {profiles.length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Monthly</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {profiles.filter(p => p.plan_type === 'monthly').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Annual</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                        {profiles.filter(p => p.plan_type === 'annual').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Free</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-600">
                        {profiles.filter(p => !p.plan_type || p.plan_type === 'free').length}
                    </p>
                </div>
            </div>

            {/* Users List */}
            <div className="max-w-4xl mx-auto space-y-3">
                {filteredProfiles.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        Nenhum usuário encontrado.
                    </div>
                ) : (
                    filteredProfiles.map((profile) => (
                        <div
                            key={profile.id}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                        {profile.email}
                                    </p>
                                    {profile.full_name && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                            {profile.full_name}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {profile.role || 'user'}
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className={`text-xs font-bold ${profile.plan_type === 'annual' ? 'text-purple-600' :
                                                profile.plan_type === 'monthly' ? 'text-green-600' :
                                                    'text-slate-500'
                                            }`}>
                                            {profile.plan_type === 'annual' ? 'ANNUAL' :
                                                profile.plan_type === 'monthly' ? 'MONTHLY' : 'FREE'}
                                        </span>
                                        {profile.phone && (
                                            <>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {profile.phone}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setEditingProfile(profile)}
                                    className="px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Back Button */}
            <div className="max-w-4xl mx-auto mt-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full md:w-auto px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                    ← Voltar ao Dashboard
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
