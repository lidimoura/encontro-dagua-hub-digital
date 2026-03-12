/**
 * NotificationsSection — PWA Push Notification Settings
 * Allows the CEO to subscribe/unsubscribe her device from push alerts.
 * Uses the usePushNotifications hook (src/hooks/usePushNotifications.ts)
 * and sends a test push via the Supabase Edge Function.
 */
import React from 'react';
import { Bell, BellOff, Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/lib/supabase/client';

export const NotificationsSection: React.FC = () => {
  const { permission, isSubscribed, isLoading, error, subscribe, unsubscribe } = usePushNotifications();
  const [testStatus, setTestStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const isSupported = permission !== 'unsupported' && 'PushManager' in window;

  const handleTestPush = async () => {
    setTestStatus('sending');
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: '✅ Notificações Ativas!',
          notifBody: 'Novo lead da LP ou lembrete chegará aqui automaticamente.',
          url: '/boards',
        },
      });
      if (error) throw error;
      setTestStatus('sent');
    } catch {
      setTestStatus('error');
    } finally {
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-white/10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <Bell size={20} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notificações Push (PWA)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Receba alertas de novos leads e lembretes de atividades no celular.
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          isSupported
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          <Smartphone size={11} />
          {isSupported ? 'Navegador Compatível' : 'Navegador Incompatível'}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          permission === 'granted'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : permission === 'denied'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
        }`}>
          {permission === 'granted' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
          Permissão: {permission === 'granted' ? 'Concedida' : permission === 'denied' ? 'Negada' : 'Pendente'}
        </span>
        {isSubscribed && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
            <Bell size={11} /> Inscrita
          </span>
        )}
      </div>

      {/* Permission denied warning */}
      {permission === 'denied' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 dark:text-red-300">
            <p className="font-semibold">Permissão bloqueada pelo navegador.</p>
            <p>Para reativar: Configurações do Chrome → Privacidade → Configurações de Site → Notificações → Liberar para este site.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}

      {/* Action buttons */}
      {isSupported && permission !== 'denied' && (
        <div className="flex flex-wrap gap-3">
          {!isSubscribed ? (
            <button
              onClick={subscribe}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-violet-500/30"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
              {isLoading ? 'Ativando...' : 'Ativar Notificações Neste Dispositivo'}
            </button>
          ) : (
            <>
              <button
                onClick={handleTestPush}
                disabled={testStatus === 'sending'}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                {testStatus === 'sending' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : testStatus === 'sent' ? (
                  <CheckCircle size={16} />
                ) : (
                  <Bell size={16} />
                )}
                {testStatus === 'sent' ? 'Notificação Enviada!' : testStatus === 'sending' ? 'Enviando...' : '🛎️ Testar Push Agora'}
              </button>
              <button
                onClick={unsubscribe}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 font-semibold text-sm rounded-xl transition-all"
              >
                <BellOff size={16} /> Desativar Neste Dispositivo
              </button>
            </>
          )}
        </div>
      )}

      {/* What triggers notifications */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">O que dispara notificações:</p>
        <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            Novo lead capturado pela Landing Page
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
            Lembrete de atividade agendado pelo AI Hub (Mazô)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            Deal convertido para cliente (futuro)
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-400">
          <strong>VAPID:</strong> Configurada. Requer que o service worker esteja ativo no celular com o site instalado como PWA.
        </p>
      </div>
    </div>
  );
};
