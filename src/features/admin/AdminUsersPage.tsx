import React, { useState, useEffect } from 'react';
import { Users, Edit2, Shield, Building2, Mail, UserCog, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

interface User {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: 'admin' | 'vendedor';
    company_id: string;
    company_name?: string;
    is_super_admin: boolean;
    created_at: string;
    plan?: 'free' | 'pro' | 'enterprise';
    status?: string;
    access_level?: string[];
}

interface Company {
    id: string;
    name: string;
}

export const AdminUsersPage: React.FC = () => {
    const { profile } = useAuth();
    const { addToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        role: 'vendedor' as 'admin' | 'vendedor',
        company_id: '',
        is_super_admin: false,
        access_level: [] as string[],
    });

    // ── Cadastro Direto de Usuário ─────────────────────────────────────────
    const [showNewUserForm, setShowNewUserForm] = useState(false);
    const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);

    // ── Todos os hooks ANTES de qualquer return condicional ────────────────
    useEffect(() => {
        // Guard inside the effect — never before it
        if (!profile?.is_super_admin) return;
        fetchUsers();
        fetchCompanies();
    }, [profile?.is_super_admin]);

    // ─────────────────────────────────────────────────────────────────────────
    // Now it's safe to conditionally return — all hooks have been called above
    // ─────────────────────────────────────────────────────────────────────────
    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-acai-900" />
            </div>
        );
    }

    if (!profile.is_super_admin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Acesso Negado
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Apenas Super Admins podem acessar esta página.
                    </p>
                </div>
            </div>
        );
    }

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          company_id,
          is_super_admin,
          created_at,
          plan,
          status,
          access_level,
          companies:company_id (name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const usersWithCompany = (data || []).map((user: any) => ({
                ...user,
                company_name: user.companies?.name || 'Sem empresa',
            }));

            setUsers(usersWithCompany);
        } catch (error: any) {
            addToast('Erro ao carregar usuários', 'error');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setCompanies(data || []);
        } catch (error: any) {
            console.error('Error fetching companies:', error);
        }
    };

    // ── Cadastro Direto: Criar usuário via Supabase Auth + Profile ──────────
    const handleCreateDirectUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserData.email || !newUserData.password || !newUserData.name) {
            addToast('Preencha todos os campos', 'error');
            return;
        }
        if (newUserData.password.length < 6) {
            addToast('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        setCreatingUser(true);
        try {
            // Simplified signUp: only send full_name in metadata.
            // The handle_new_user trigger will create the profile row automatically.
            // We do NOT send company_id here — the trigger now uses NULLIF to handle null safely.
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: newUserData.email,
                password: newUserData.password,
                options: {
                    data: {
                        full_name: newUserData.name.trim(),
                    },
                    emailRedirectTo: `${window.location.origin}/#/login`,
                },
            });

            if (signUpError) throw signUpError;

            const userId = signUpData.user?.id;
            if (!userId) throw new Error('Usuário criado mas ID não retornado');

            // Profile row is created by the DB trigger (handle_new_user).
            // This manual upsert is a safety net in case the trigger ran before migration.
            const [firstName, ...rest] = newUserData.name.trim().split(' ');
            const lastName = rest.join(' ') || null;

            await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: newUserData.email,
                    first_name: firstName,
                    last_name: lastName,
                    name: newUserData.name.trim(),
                    role: 'user',
                }, { onConflict: 'id', ignoreDuplicates: false });

            addToast(`✅ Usuário ${newUserData.name} criado! Um e-mail de confirmação foi enviado para ${newUserData.email}.`, 'success');
            setNewUserData({ name: '', email: '', password: '' });
            setShowNewUserForm(false);
            await fetchUsers();
        } catch (error: any) {
            console.error('[AdminUsersPage] Erro ao criar usuário:', error);
            addToast(`Erro: ${error.message}`, 'error');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: user.role,
            company_id: user.company_id,
            is_super_admin: user.is_super_admin,
            access_level: user.access_level || [],
        });
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    email: formData.email,
                    first_name: formData.first_name || null,
                    last_name: formData.last_name || null,
                    role: formData.role,
                    company_id: formData.company_id,
                    is_super_admin: formData.is_super_admin,
                    access_level: formData.access_level,
                })
                .eq('id', editingUser.id);

            if (error) throw error;

            addToast('Usuário atualizado com sucesso', 'success');
            setEditingUser(null);
            fetchUsers();
        } catch (error: any) {
            addToast(`Erro ao atualizar usuário: ${error.message}`, 'error');
            console.error('Error updating user:', error);
        }
    };

    const handlePlanChange = async (userId: string, newPlan: 'free' | 'pro' | 'enterprise') => {
        try {
            let validUntil: string | null = null;
            const today = new Date();

            if (newPlan === 'pro') {
                const monthlyDate = new Date(today);
                monthlyDate.setDate(monthlyDate.getDate() + 30);
                validUntil = monthlyDate.toISOString();
            } else if (newPlan === 'enterprise') {
                const annualDate = new Date(today);
                annualDate.setDate(annualDate.getDate() + 365);
                validUntil = annualDate.toISOString();
            }

            const { error } = await supabase
                .from('profiles')
                .update({ plan: newPlan, valid_until: validUntil })
                .eq('id', userId);

            if (error) throw error;

            const dateMsg = validUntil
                ? ` até ${new Date(validUntil).toLocaleDateString('pt-BR')}`
                : ' (sem expiração)';
            addToast(`Plano atualizado para ${newPlan.toUpperCase()}${dateMsg}`, 'success');
            fetchUsers();
        } catch (error: any) {
            addToast(`Erro ao atualizar plano: ${error.message}`, 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acai-900"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <UserCog className="w-8 h-8 text-acai-900" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Gestão de Usuários
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    Gerencie todos os usuários do sistema (Super Admin)
                </p>
            </div>

            {/* ── CADASTRO DIRETO ─────────────────────────────────────────── */}
            <div className="mb-8 bg-white dark:bg-rionegro-950 rounded-xl shadow-lg border border-slate-200 dark:border-rionegro-800 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowNewUserForm(v => !v)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-rionegro-900 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-slate-900 dark:text-white">Cadastro Direto de Usuário</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Crie uma conta de usuário diretamente, sem precisar de link de convite</p>
                        </div>
                    </div>
                    <span className="text-2xl text-slate-400">{showNewUserForm ? '−' : '+'}</span>
                </button>

                {showNewUserForm && (
                    <div className="px-6 pb-6 border-t border-slate-100 dark:border-rionegro-800">
                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mt-4 mb-4">
                            ⚠️ Um e-mail de confirmação será enviado. O usuário deve clicar no link antes de fazer login.
                        </p>
                        <form onSubmit={handleCreateDirectUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    value={newUserData.name}
                                    onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                                    placeholder="Ex: João Silva"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    E-mail
                                </label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <input
                                        type="email"
                                        value={newUserData.email}
                                        onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                                        placeholder="usuario@email.com"
                                        required
                                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Senha temporária
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newUserData.password}
                                        onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-2 pr-10 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={creatingUser}
                                className="w-full py-3 px-4 bg-acai-900 hover:bg-acai-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                {creatingUser ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Criando usuário...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Criar Usuário
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Users Grid */}
            <div className="bg-white dark:bg-rionegro-950 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-rionegro-900 border-b border-slate-200 dark:border-rionegro-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    💎 Plano
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-rionegro-800">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50 dark:hover:bg-rionegro-900 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-acai-900 to-acai-700 flex items-center justify-center text-white font-semibold">
                                                {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">
                                                    {user.first_name && user.last_name
                                                        ? `${user.first_name} ${user.last_name}`
                                                        : user.first_name || 'Sem nome'}
                                                </div>
                                                {user.is_super_admin && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                                        <Shield className="w-3 h-3" />
                                                        Super Admin
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Mail className="w-4 h-4" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}
                                        >
                                            {user.role === 'admin' ? 'Admin' : 'Vendedor'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Building2 className="w-4 h-4" />
                                            {user.company_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.plan || 'free'}
                                            onChange={(e) => handlePlanChange(user.id, e.target.value as 'free' | 'pro' | 'enterprise')}
                                            className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-rionegro-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-acai-900 focus:border-transparent"
                                        >
                                            <option value="free">Free</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-acai-900 hover:bg-acai-50 dark:text-acai-400 dark:hover:bg-acai-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-rionegro-950 rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Editar Usuário
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sobrenome</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'vendedor' })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                >
                                    <option value="vendedor">Vendedor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Empresa</label>
                                <select
                                    value={formData.company_id}
                                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                >
                                    <option value="">— Sem empresa —</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_super_admin"
                                    checked={formData.is_super_admin}
                                    onChange={(e) => setFormData({ ...formData, is_super_admin: e.target.checked })}
                                    className="w-5 h-5 text-acai-900 bg-slate-50 dark:bg-rionegro-900 border-slate-300 dark:border-rionegro-700 rounded focus:ring-acai-900"
                                />
                                <label htmlFor="is_super_admin" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Super Admin (acesso global)
                                </label>
                            </div>

                            {/* ── Tags / Access Level ────────────────────────── */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tags de Acesso
                                    <span className="ml-1 text-xs text-slate-400 font-normal">(Enter para adicionar)</span>
                                </label>
                                <div className="bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg p-3">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(formData.access_level || []).map(tag => (
                                            <span key={tag} className="flex items-center gap-1 bg-acai-900/10 dark:bg-acai-900/30 text-acai-700 dark:text-acai-400 px-2 py-0.5 rounded-full text-xs font-bold border border-acai-900/20">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        access_level: formData.access_level.filter(t => t !== tag)
                                                    })}
                                                    className="hover:text-red-500 transition-colors ml-0.5"
                                                    title="Remover tag"
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                        {(formData.access_level || []).length === 0 && (
                                            <span className="text-xs text-slate-400 italic">Nenhuma tag adicionada</span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nova tag + Enter (ex: beta, saude, psi)..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim().toLowerCase();
                                                if (val && !formData.access_level?.includes(val)) {
                                                    setFormData({
                                                        ...formData,
                                                        access_level: [...(formData.access_level || []), val]
                                                    });
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                        className="w-full text-xs bg-transparent outline-none text-slate-700 dark:text-white border-t border-slate-100 dark:border-white/5 pt-2 placeholder-slate-400"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Tags pré-definidas: <button type="button" onClick={() => {
                                        const tags = ['beta', 'saude', 'psi', 'empreendedor', 'impacto-social', 'pro', 'trial'];
                                        const currentTags = formData.access_level || [];
                                        const first = tags.find(t => !currentTags.includes(t));
                                        if (first) setFormData({ ...formData, access_level: [...currentTags, first] });
                                    }} className="text-acai-600 hover:underline">+ sugestão</button>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-rionegro-900 hover:bg-slate-200 dark:hover:bg-rionegro-800 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 text-white bg-acai-900 hover:bg-acai-800 rounded-lg font-medium transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

