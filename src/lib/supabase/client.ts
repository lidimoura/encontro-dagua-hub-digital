import { createClient } from '@supabase/supabase-js';

// 🔍 DEBUG: Log environment variables to diagnose loading issues
console.log('========================================');
console.log('🔍 SUPABASE ENV DEBUG:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');
console.log('All env vars:', import.meta.env);
console.log('========================================');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if credentials are missing but don't crash
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Aviso: Chaves Supabase não configuradas. Verifique seu arquivo .env');
    console.warn('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
