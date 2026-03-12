import { supabase } from './client';
import { Product } from '@/types';

export const productsService = {
    /**
     * Get all active catalog products (excludes tech_stack, infra and api_cost entries)
     * Used by the Deal products tab — Tech Stack has its own separate view.
     */
    /**
     * Get all active catalog products via strict Database RPC (excludes tech_stack, infra)
     * Used by the Deal products tab.
     */
    async getAll(options?: { timestamp?: number }) {
        const BLOCKED_NAMES = ['openai', 'gemini', 'anthropic', 'vercel', 'supabase', 'aws', 'gcp', 'azure'];

        // Core fix: Use RPC to guarantee DB-level strict filtering and bypass Edge caching
        let query = supabase.rpc('get_crm_catalog_products');
        
        const { data, error } = await query;
        
        // Fallback for local dev if RPC hasn't been pushed yet
        if (error) {
            console.warn('RPC failed, falling back to standard query', error);
            const fallbackQuery = supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .not('type', 'in', '("tech_stack", "infra", "api_cost")')
                .order('name');
            
            const fallbackRes = await fallbackQuery;
            if (fallbackRes.error || !fallbackRes.data) return fallbackRes;
            
            const filteredFallback = fallbackRes.data.filter((p: any) => {
                const nameLower = (p.name || '').toLowerCase();
                return !BLOCKED_NAMES.some(b => nameLower.includes(b));
            });
            return { data: filteredFallback, error: null };
        }

        if (!data) return { data: [], error: null };

        // Even with RPC, keep the safety JS filter just to be 100% immune
        const filtered = data.filter((p: any) => {
            const nameLower = (p.name || '').toLowerCase();
            return !BLOCKED_NAMES.some(b => nameLower.includes(b));
        });

        return { data: filtered, error: null };
    },

    /**
     * Get a single product by ID
     */
    async getById(id: string) {
        return await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
    },

    /**
     * Create a new product (Admin only)
     */
    async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
        return await supabase
            .from('products')
            .insert([{
                ...product,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
    },

    /**
     * Update an existing product (Admin only)
     */
    async update(id: string, updates: Partial<Product>) {
        return await supabase
            .from('products')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
    },

    /**
     * Soft delete a product by setting is_active to false
     */
    async softDelete(id: string) {
        return await supabase
            .from('products')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
    },

    /**
     * Hard delete a product (Admin only)
     */
    async delete(id: string) {
        return await supabase
            .from('products')
            .delete()
            .eq('id', id);
    }
};
