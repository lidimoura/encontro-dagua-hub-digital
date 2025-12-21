import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, Shield, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    role: string;
    plan?: string;
    created_at: string;
}

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // SECURITY CHECK: Only lidifmfc@gmail.com can access
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.email !== 'lidifmfc@gmail.com') {
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

        const filtered = profiles.filter(profile =>
            profile.email.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredProfiles(filtered);
    };

    const togglePlan = async (profileId: string, currentPlan: string) => {
        try {
            setUpdating(profileId);

            const newPlan = currentPlan === 'pro' ? 'free' : 'pro';

            const { error } = await supabase
                .from('profiles')
                .update({ plan: newPlan })
                .eq('id', profileId);

            if (error) throw error;

            // Update local state
            setProfiles(prev =>
                prev.map(p => p.id === profileId ? { ...p, plan: newPlan } : p)
            );
            setFilteredProfiles(prev =>
                prev.map(p => p.id === profileId ? { ...p, plan: newPlan } : p)
            );
        } catch (error) {
            console.error('Error updating plan:', error);
            alert('Erro ao atualizar plano. Verifique o console.');
        } finally {
            setUpdating(null);
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
                        Admin Panel
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Gerenciamento manual de planos (Mobile First)
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
                        placeholder="Buscar por email..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-4xl mx-auto mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        <span className="text-xs text-slate-500 dark:text-slate-400">Pro</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {profiles.filter(p => p.plan === 'pro').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Free</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-600">
                        {profiles.filter(p => !p.plan || p.plan === 'free').length}
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
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {profile.role || 'user'}
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className={`text-xs font-bold ${profile.plan === 'pro'
                                                ? 'text-green-600'
                                                : 'text-slate-500'
                                            }`}>
                                            {profile.plan === 'pro' ? 'PRO' : 'FREE'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => togglePlan(profile.id, profile.plan || 'free')}
                                    disabled={updating === profile.id}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 ${profile.plan === 'pro'
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {updating === profile.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {profile.plan === 'pro' ? (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    Remover Pro
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Ativar Pro
                                                </>
                                            )}
                                        </>
                                    )}
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
        </div>
    );
}
