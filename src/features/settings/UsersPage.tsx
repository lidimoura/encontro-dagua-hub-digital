import React from 'react';
import { Users, Shield, Mail } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
    isAdmin: boolean;
}

const TEAM_MEMBERS: TeamMember[] = [
    {
        id: '1',
        name: 'Lidi',
        role: 'Founder & Admin',
        email: 'lidimfc@gmail.com',
        isAdmin: true,
    },
    {
        id: '2',
        name: 'Encontro D\'água',
        role: 'Support / Team',
        email: 'contato@encontrodagua.com.br',
        isAdmin: false,
    },
];

export const UsersPage: React.FC = () => {
    const { t } = useTranslation();

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

            {/* Team Table */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
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
                            {TEAM_MEMBERS.map((member) => (
                                <tr
                                    key={member.id}
                                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    {/* Member Info */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {member.avatar ? (
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {member.name}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {member.role}
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
                                        {member.isAdmin ? (
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
            </div>

            {/* Info Card */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>ℹ️ {t('note')}:</strong> {t('teamMembersNote')}
                </p>
            </div>
        </div>
    );
};
