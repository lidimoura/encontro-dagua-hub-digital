/**
 * usePushNotifications — PWA Web Push subscription management
 * Handles VAPID subscription, permission request, and saving to Supabase.
 * The Service Worker (public/sw.js) handles the actual push display.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// VAPID Public Key — set this in Vercel env as VITE_VAPID_PUBLIC_KEY
// Generate a pair: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as PushPermission;
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check existing subscription on mount
  useEffect(() => {
    if (!VAPID_PUBLIC_KEY || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setIsSubscribed(!!sub);
      });
    }).catch(() => {});
  }, []);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator)) throw new Error('Service Worker não suportado neste navegador.');
      if (!VAPID_PUBLIC_KEY) throw new Error('VITE_VAPID_PUBLIC_KEY não configurada. Adicione nas variáveis de ambiente do Vercel.');

      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== 'granted') throw new Error('Permissão de notificação negada pelo usuário.');

      // 2. Get service worker registration
      const reg = await navigator.serviceWorker.ready;

      // 3. Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Save subscription to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const subJson = sub.toJSON();
      const { error: dbErr } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: (subJson.keys as any)?.p256dh || '',
          auth: (subJson.keys as any)?.auth || '',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (dbErr) {
        // Table might not exist yet — still mark as subscribed locally
        console.warn('[Push] Could not save to DB (run migration 027):', dbErr.message);
      }

      setIsSubscribed(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao ativar notificações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
        }
      }
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permission, isSubscribed, isLoading, error, subscribe, unsubscribe };
}
