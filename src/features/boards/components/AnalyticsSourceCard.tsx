import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Bot, Globe, TrendingUp } from 'lucide-react';

interface SourceCount {
    sdr: number;
    lp: number;
}

/**
 * AnalyticsSourceCard — Dashboard widget
 * Shows two separate counters: Amazô SDR leads vs Hub LP leads.
 * Uses Supabase Realtime so counters update live as leads arrive.
 */
export const AnalyticsSourceCard: React.FC = () => {
    const [counts, setCounts] = useState<SourceCount>({ sdr: 0, lp: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchCounts = async () => {
        // Count contacts by source — two separate queries for clarity
        const [sdrRes, lpRes] = await Promise.all([
            supabase
                .from('contacts')
                .select('id', { count: 'exact', head: true })
                .eq('source', 'Amazô SDR'),
            supabase
                .from('contacts')
                .select('id', { count: 'exact', head: true })
                .eq('source', 'Hub LP'),
        ]);

        setCounts({
            sdr: sdrRes.count ?? 0,
            lp: lpRes.count ?? 0,
        });
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCounts();

        // Realtime: recount whenever a contact is inserted or updated
        const channel = supabase
            .channel('analytics_source_realtime')
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'contacts',
            }, () => fetchCounts())
            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public', table: 'contacts',
            }, () => fetchCounts())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const total = counts.sdr + counts.lp;

    return (
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Origem dos Leads
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Realtime · {isLoading ? '…' : total} total
                    </p>
                </div>
            </div>

            {/* Two counters */}
            <div className="grid grid-cols-2 gap-3">
                {/* Amazô SDR */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-blue-950 to-indigo-900 border border-blue-800/40">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-4 translate-x-4" />
                    <div className="flex items-center gap-2 mb-2">
                        <Bot size={14} className="text-blue-300" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                            Amazô SDR
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white leading-none">
                        {isLoading ? (
                            <span className="inline-block w-8 h-7 bg-blue-800/60 rounded animate-pulse" />
                        ) : counts.sdr}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">
                        {total > 0 ? Math.round((counts.sdr / total) * 100) : 0}% do total
                    </p>
                </div>

                {/* Hub LP */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-950 to-teal-900 border border-emerald-800/40">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full -translate-y-4 translate-x-4" />
                    <div className="flex items-center gap-2 mb-2">
                        <Globe size={14} className="text-emerald-300" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                            Hub LP
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white leading-none">
                        {isLoading ? (
                            <span className="inline-block w-8 h-7 bg-emerald-800/60 rounded animate-pulse" />
                        ) : counts.lp}
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">
                        {total > 0 ? Math.round((counts.lp / total) * 100) : 0}% do total
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            {total > 0 && !isLoading && (
                <div className="mt-4">
                    <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700"
                            style={{ width: `${(counts.sdr / total) * 100}%` }}
                        />
                        <div
                            className="bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-700"
                            style={{ width: `${(counts.lp / total) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-blue-500 font-semibold">🤖 SDR</span>
                        <span className="text-[10px] text-emerald-500 font-semibold">🌐 LP</span>
                    </div>
                </div>
            )}
        </div>
    );
};
