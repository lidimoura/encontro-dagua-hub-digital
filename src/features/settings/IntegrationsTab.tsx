import React, { useState, useEffect } from 'react';
import { Link, Copy, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface WebhookLog {
    id: string;
    payload: any;
    status: 'success' | 'error';
    error_message: string | null;
    created_at: string;
}

export const IntegrationsTab: React.FC = () => {
    const { profile } = useAuth();
    const { language } = useLanguage();
    const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

    const webhookUrl = `https://encontro-dagua-hub.vercel.app/api/webhooks/${profile?.company_id}`;

    useEffect(() => {
        fetchWebhookLogs();

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchWebhookLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchWebhookLogs = async () => {
        if (!profile?.company_id) return;

        try {
            const { data, error } = await supabase
                .from('webhook_logs')
                .select('*')
                .eq('company_id', profile.company_id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setWebhookLogs(data || []);
        } catch (error: any) {
            console.error('Error fetching webhook logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const truncatePayload = (payload: any) => {
        const str = JSON.stringify(payload);
        return str.length > 50 ? str.substring(0, 50) + '...' : str;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {language === 'en' ? 'Integrations' : 'Integrações'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'en'
                        ? 'Connect external tools like n8n, Make, or Zapier to your CRM'
                        : 'Conecte ferramentas externas como n8n, Make ou Zapier ao seu CRM'}
                </p>
            </div>

            {/* Webhook URL Card */}
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-dark-card dark:to-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
                        <Link className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {language === 'en' ? 'Webhook URL' : 'URL do Webhook'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {language === 'en' ? 'Use this URL in your automation tools' : 'Use esta URL nas suas ferramentas de automação'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={webhookUrl}
                        readOnly
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <button
                        onClick={copyWebhookUrl}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20"
                    >
                        {copied ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                {language === 'en' ? 'Copied!' : 'Copiado!'}
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                {language === 'en' ? 'Copy' : 'Copiar'}
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                            {language === 'en'
                                ? '💡 Paste this URL in n8n, Make, or Zapier to send data to your CRM. Ask AiFlow for setup guidance!'
                                : '💡 Cole esta URL no n8n, Make ou Zapier para enviar dados ao seu CRM. Peça ajuda ao AiFlow para configurar!'}
                        </span>
                    </p>
                </div>
            </div>

            {/* Webhook Logs Table */}
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {language === 'en' ? 'Recent Webhook Calls' : 'Chamadas Recentes'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {language === 'en' ? 'Last 20 webhook events' : 'Últimos 20 eventos de webhook'}
                        </p>
                    </div>
                    <button
                        onClick={fetchWebhookLogs}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {language === 'en' ? 'Refresh' : 'Atualizar'}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Timestamp' : 'Data/Hora'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Status' : 'Status'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Payload' : 'Dados'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Actions' : 'Ações'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {language === 'en' ? 'Loading logs...' : 'Carregando logs...'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : webhookLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {language === 'en' ? 'No webhook calls yet' : 'Nenhuma chamada de webhook ainda'}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                {language === 'en'
                                                    ? 'Test your webhook URL to see logs here'
                                                    : 'Teste sua URL de webhook para ver os logs aqui'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                webhookLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${log.status === 'success'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}
                                            >
                                                {log.status === 'success' ? '✓ Success' : '✗ Error'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                                            {truncatePayload(log.payload)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                                            >
                                                {language === 'en' ? 'View' : 'Ver'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {language === 'en' ? 'Webhook Log Details' : 'Detalhes do Log'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Timestamp' : 'Data/Hora'}
                                </label>
                                <p className="text-sm text-slate-900 dark:text-white">
                                    {new Date(selectedLog.created_at).toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Status' : 'Status'}
                                </label>
                                <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${selectedLog.status === 'success'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        }`}
                                >
                                    {selectedLog.status}
                                </span>
                            </div>
                            {selectedLog.error_message && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        {language === 'en' ? 'Error Message' : 'Mensagem de Erro'}
                                    </label>
                                    <p className="text-sm text-red-600 dark:text-red-400">{selectedLog.error_message}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {language === 'en' ? 'Payload' : 'Dados'}
                                </label>
                                <pre className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                                    {JSON.stringify(selectedLog.payload, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-white/10">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
                            >
                                {language === 'en' ? 'Close' : 'Fechar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
