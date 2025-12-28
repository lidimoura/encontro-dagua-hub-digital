import React, { useState, useEffect } from 'react';
import { Users, Edit2, Shield, Building2, Mail, UserCog } from 'lucide-react';
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
    plan?: 'free' | 'pro' | 'enterprise'; // God Mode: Plan management
    status?: string; // God Mode: User status
    access_level?: string[]; // God Mode: Access permissions
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
        access_level: [] as string[], // GOD MODE: Access permissions
    });

    // Check if user is super admin
    if (!profile?.is_super_admin) {
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

    useEffect(() => {
        fetchUsers();
        fetchCompanies();
    }, []);

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

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            role: user.role,
            company_id: user.company_id,
            is_super_admin: user.is_super_admin,
            access_level: user.access_level || [], // GOD MODE
        });
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            // Update user via direct Supabase (includes access_level)
            const { error } = await supabase
                .from('profiles')
                .update({
                    email: formData.email,
                    first_name: formData.first_name || null,
                    last_name: formData.last_name || null,
                    role: formData.role,
                    company_id: formData.company_id,
                    is_super_admin: formData.is_super_admin,
                    access_level: formData.access_level, // GOD MODE
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

    // GOD MODE: Update user plan
    const handlePlanChange = async (userId: string, newPlan: 'free' | 'pro' | 'enterprise') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ plan: newPlan })
                .eq('id', userId);

            if (error) throw error;

            addToast(`Plano atualizado para ${newPlan.toUpperCase()}`, 'success');
            fetchUsers(); // Refresh list
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
                <h1 className="text-4xl font-black text-red-600 mb-4 border-4 border-red-600 p-4 bg-yellow-200">
                    ⚠️ ATUALIZAÇÃO CONFIRMADA - VERSÃO SEM MODAL ⚠️
                </h1>
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

            {/* INLINE INVITE GENERATOR - MOBILE FRIENDLY */}
            <div className="mb-8 bg-white dark:bg-rionegro-950 rounded-xl shadow-lg border border-slate-200 dark:border-rionegro-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">🔗 Gerar Convite</h3>

                <div className="space-y-4">
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            try {
                                // Generate unique token
                                const token = crypto.randomUUID();

                                // Insert into company_invites
                                const { error } = await supabase
                                    .from('company_invites')
                                    .insert({
                                        token,
                                        email: null,
                                        offer_discount: false,
                                        expires_at: null,
                                    });

                                if (error) throw error;

                                // Generate link
                                const inviteLink = `https://encontro-dagua-hub.vercel.app/#/join?token=${token}`;

                                // MOBILE-FRIENDLY: Use window.prompt (works 100% on mobile)
                                window.prompt("✅ CONVITE GERADO! Copie o link:", inviteLink);

                                addToast('Convite gerado com sucesso!', 'success');
                            } catch (error: any) {
                                addToast(`Erro: ${error.message}`, 'error');
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.currentTarget.click();
                            }
                        }}
                        className="cursor-pointer w-full px-6 py-3 bg-acai-900 hover:bg-acai-800 text-white text-center rounded-lg font-bold transition-colors select-none"
                    >
                        GERAR CONVITE (ANTI-REFRESH)
                    </div>
                </div>
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
                                    🎛️ Acessos
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
                                                        : 'Sem nome'}
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
                                    {/* GOD MODE: Plan Selector */}
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
                                    {/* GOD MODE: Access Badges */}
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" title="Prompt Lab">
                                                🤖
                                            </span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" title="QR Code">
                                                📱
                                            </span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" title="CRM">
                                                📊
                                            </span>
                                        </div>
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
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Sobrenome
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Role
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value as 'admin' | 'vendedor' })
                                    }
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                >
                                    <option value="vendedor">Vendedor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Empresa
                                </label>
                                <select
                                    value={formData.company_id}
                                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-rionegro-900 border border-slate-200 dark:border-rionegro-800 rounded-lg focus:ring-2 focus:ring-acai-900 focus:border-transparent text-slate-900 dark:text-white"
                                >
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Super Admin */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_super_admin"
                                    checked={formData.is_super_admin}
                                    onChange={(e) =>
                                        setFormData({ ...formData, is_super_admin: e.target.checked })
                                    }
                                    className="w-5 h-5 text-acai-900 bg-slate-50 dark:bg-rionegro-900 border-slate-300 dark:border-rionegro-700 rounded focus:ring-acai-900"
                                />
                                <label
                                    htmlFor="is_super_admin"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Super Admin (acesso global)
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
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
