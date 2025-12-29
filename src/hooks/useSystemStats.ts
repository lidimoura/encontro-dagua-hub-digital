import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface SystemStats {
    libraryAssets: number;
    dealsManaged: number;
    aiAgents: number;
    qrCodesGenerated: number;
}

export const useSystemStats = () => {
    const [stats, setStats] = useState<SystemStats>({
        libraryAssets: 0,
        dealsManaged: 0,
        aiAgents: 3, // PRECY, MAZÔ, JURY
        qrCodesGenerated: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch library assets count
            const { count: assetsCount, error: assetsError } = await supabase
                .from('library_assets')
                .select('*', { count: 'exact', head: true });

            if (assetsError) throw assetsError;

            // Fetch deals count
            const { count: dealsCount, error: dealsError } = await supabase
                .from('deals')
                .select('*', { count: 'exact', head: true });

            if (dealsError) throw dealsError;

            // Fetch QR codes count
            const { count: qrCount, error: qrError } = await supabase
                .from('qr_codes')
                .select('*', { count: 'exact', head: true });

            if (qrError) throw qrError;

            setStats({
                libraryAssets: assetsCount || 0,
                dealsManaged: dealsCount || 0,
                aiAgents: 3, // Hardcoded: PRECY, MAZÔ, JURY
                qrCodesGenerated: qrCount || 0,
            });
        } catch (err: any) {
            console.error('Error fetching system stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, error, refetch: fetchStats };
};
