import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { QrCode, TrendingUp, Calendar, Eye } from 'lucide-react';

interface QRCodeStats {
    id: string;
    title: string;
    qr_type: string;
    scan_count: number;
    last_scan_at: string | null;
    created_at: string;
}

export const ClientPortalPage: React.FC = () => {
    const { user } = useAuth();
    const [qrCodes, setQrCodes] = useState<QRCodeStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalScans, setTotalScans] = useState(0);

    useEffect(() => {
        fetchClientQRCodes();
    }, [user]);

    const fetchClientQRCodes = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('qr_codes')
                .select('id, title, qr_type, scan_count, last_scan_at, created_at')
                .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setQrCodes(data || []);
            setTotalScans(data?.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) || 0);
        } catch (error: any) {
            console.error('Error fetching QR codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-primary">
            {/* Header */}
            <div className="bg-white dark:bg-dark-secondary border-b border-slate-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Meu Portal
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Acompanhe o desempenho dos seus QR Codes
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total QR Codes */}
                    <div className="bg-white dark:bg-dark-secondary/50 backdrop-blur-lg rounded-card border border-slate-200 dark:border-white/10 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <QrCode className="w-8 h-8 text-wine" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                QR Codes
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {qrCodes.length}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Total criados
                        </p>
                    </div>

                    {/* Total Scans */}
                    <div className="bg-white dark:bg-dark-secondary/50 backdrop-blur-lg rounded-card border border-slate-200 dark:border-white/10 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Eye className="w-8 h-8 text-gold" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                Visualizações
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {totalScans.toLocaleString()}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Total de scans
                        </p>
                    </div>

                    {/* Average Scans */}
                    <div className="bg-white dark:bg-dark-secondary/50 backdrop-blur-lg rounded-card border border-slate-200 dark:border-white/10 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-acai" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                Média
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {qrCodes.length > 0 ? Math.round(totalScans / qrCodes.length) : 0}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Scans por QR Code
                        </p>
                    </div>
                </div>

                {/* QR Codes List */}
                <div className="bg-white dark:bg-dark-secondary/50 backdrop-blur-lg rounded-card border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Seus QR Codes
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine mx-auto"></div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Carregando...</p>
                        </div>
                    ) : qrCodes.length === 0 ? (
                        <div className="p-12 text-center">
                            <QrCode className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">
                                Você ainda não tem QR Codes criados.
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                                Entre em contato com o administrador para criar seus QR Codes.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-white/10">
                            {qrCodes.map((qr) => (
                                <div
                                    key={qr.id}
                                    className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                {qr.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <QrCode className="w-4 h-4" />
                                                    {qr.qr_type}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Criado em {formatDate(qr.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-wine">
                                                {qr.scan_count || 0}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {qr.last_scan_at ? `Último: ${formatDate(qr.last_scan_at)}` : 'Sem scans'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-gradient-to-r from-wine/10 to-gold/10 dark:from-wine/20 dark:to-gold/20 rounded-card border border-wine/20 dark:border-wine/30 p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                        💡 Dica: Como aumentar seus scans
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li>• Compartilhe seus QR Codes nas redes sociais</li>
                        <li>• Adicione o QR Code em materiais impressos (cartões, flyers)</li>
                        <li>• Use em assinaturas de email</li>
                        <li>• Coloque em locais visíveis no seu estabelecimento</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
