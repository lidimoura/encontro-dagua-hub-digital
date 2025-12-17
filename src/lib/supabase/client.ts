import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if credentials are missing but don't crash
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Aviso: Chaves Supabase não configuradas. Verifique seu arquivo .env');
    console.warn('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

/**
 * Supabase client instance
 * 
 * Configured with environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * Falls back to placeholder values if credentials are missing (with console warning).
 * Used throughout the application for database operations, authentication, and storage.
 * 
 * @example
 * import { supabase } from '@/lib/supabase/client';
 * 
 * const { data, error } = await supabase
 *   .from('contacts')
 *   .select('*');
 */
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
