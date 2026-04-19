import React, { useState, useEffect } from 'react';
import { Users, Shield, Mail, UserPlus, Crown, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────
interface TeamMember {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    avatar_url?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const UsersPage: React.FC = () => {
    const { t, language } = useTranslation();
    const { profile: currentUser } = useAuth();
    const isEn = language === 'en';

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    // ── Fetch ONLY users from the same company_id (privacy wall) ────────────
    useEffect(() => {
        if (!currentUser?.company_id) return;
        const fetch = async () => {
            setLoading(true);
            const { data, error: err } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, avatar_url')
                // PRIVACY: implacável — filtro por company_id do usuário logado
                .eq('company_id', currentUser.company_id!)
                .order('role', { ascending: true });
            if (err) {
                // full_name column may not exist — fallback: select without it
                const { data: data2, error: err2 } = await supabase
                    .from('profiles')
                    .select('id, email, role, avatar_url')
                    .eq('company_id', currentUser.company_id!)
                    .order('role', { ascending: true });
                if (err2) setError(err2.message);
                else setMembers((data2 || []).map((m: any) => ({ ...m, full_name: null })));
            } else {
                setMembers(data || []);
            }
            setLoading(false);
        };
        fetch();
    }, [currentUser?.company_id]);

    // ── Invite teammate (uses InviteGenerator flow) ──────────────────────────
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim() || !currentUser?.company_id) return;
        setInviting(true);

        const origin = window.location.origin;
        const showcaseUrl = `${origin}/#/provadagua`;

        const msg = encodeURIComponent(
            isEn
                ? `You have been invited to experience Provadágua, the free 7-day demo of the custom CRM by Encontro d’água Hub! 🌊\n\nAccess the link and use the keyword to enter:\n${showcaseUrl}\n\nSee you there! 🚀`
                : `Você foi convidada para experimentar a Provadágua, a demo gratuita de 7 dias do CRM personalizado do Encontro d’Água Hub! 🌊\n\nAcesse o link e use a palavra-chave para entrar:\n${showcaseUrl}\n\nTe espero lá! 🚀`
        );
        window.open(`https://wa.me/?text=${msg}`, '_blank');
        setInviteEmail('');
        setInviting(false);
    };

    const roleLabel = (role: string) => {
        if (role === 'admin' || role === 'super_admin') return isEn ? 'Admin' : 'Admin';
        if (role === 'vendedor') return isEn ? 'Sales Rep' : 'Vendedor(a)';
        return isEn ? 'Member' : 'Membro';
    };

    const isOwner = (member: TeamMember) =>
        member.role === 'admin' || member.role === 'super_admin';

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-acai-900 to-acai-700 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-solimoes-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {t('teamMembers')}
                    </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('teamMembersDesc')}
                </p>
            </div>

            {/* Invite Form */}
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-500/20 rounded-xl">
                <h2 className="text-sm font-bold text-primary-700 dark:text-primary-400 mb-3 flex items-center gap-2">
                    <UserPlus size={16} />
                    {isEn ? 'Invite a Teammate' : 'Convidar Sócia / Membro'}
                </h2>
                <form onSubmit={handleInvite} className="flex gap-3">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder={isEn ? 'colleague@company.com' : 'socia@empresa.com'}
                        className="flex-1 px-3 py-2 rounded-lg border border-primary-200 dark:border-primary-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button type="submit" disabled={inviting || !inviteEmail.trim()}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2 transition-all">
                        {inviting
                            ? <Loader2 size={14} className="animate-spin" />
                            : <UserPlus size={14} />}
                        {isEn ? 'Send Invite' : 'Enviar Convite'}
                    </button>
                </form>
            </div>

            {/* Team Table */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 p-6 text-red-500 text-sm">
                        <AlertCircle size={16} />{error}
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                        {isEn ? 'No team members yet. Invite someone above!' : 'Nenhum membro ainda. Convide alguém acima!'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        {t('member')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        {t('role')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        {t('email')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        {t('access')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        {/* Member Info */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt={member.full_name || ''} className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800">
                                                        {(member.full_name || member.email).substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {member.full_name || member.email.split('@')[0]}
                                                    {/* Mark current user */}
                                                    {member.id === currentUser?.id && (
                                                        <span className="ml-2 text-xs text-primary-500 font-bold">{isEn ? '(You)' : '(Você)'}</span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                                {isOwner(member) && <Crown size={12} className="text-amber-500" />}
                                                {roleLabel(member.role)}
                                            </span>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Mail className="w-4 h-4" />
                                                {member.email}
                                            </div>
                                        </td>

                                        {/* Access Level */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isOwner(member) ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-acai-900/10 text-acai-900 dark:bg-acai-400/10 dark:text-acai-400 border border-acai-900/20 dark:border-acai-400/20">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                                    <Users className="w-3 h-3" />
                                                    {t('teamMember')}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Privacy Note */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>ℹ️ {t('note')}:</strong>{' '}
                    {isEn
                        ? 'Only members of your workspace are shown here. Your data is isolated from other companies.'
                        : 'Apenas membros do seu espaço de trabalho são exibidos aqui. Seus dados são isolados de outras empresas.'}
                </p>
            </div>
        </div>
    );
};
