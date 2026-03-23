import { supabase } from './client';
import { Product } from '@/types';
import { IS_DEMO } from '@/lib/appConfig';

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
        // DEMO branch: return empty catalog — no real products shown in sandbox
        if (IS_DEMO) return { data: [], error: null };

        const BLOCKED_TYPES = ['tech_stack', 'infra', 'api_cost'];
        const BLOCKED_NAMES = ['openai', 'gemini', 'anthropic', 'vercel', 'supabase', 'aws', 'gcp', 'azure', 'antigravity'];

        const applyNameFilter = (data: any[]) =>
            data.filter((p: any) => {
                const n = (p.name || '').toLowerCase();
                return !BLOCKED_NAMES.some(b => n.includes(b));
            });

        // Primary: Use RPC for strict DB-level filtering (bypasses CDN cache)
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_crm_catalog_products');

        if (!rpcError && rpcData) {
            return { data: applyNameFilter(rpcData), error: null };
        }

        // Fallback: strict multi-column query when RPC not deployed
        console.warn('[productsService] RPC unavailable, using fallback:', rpcError?.message);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('is_internal', false)
            .not('product_type', 'in', `(${BLOCKED_TYPES.map(t => `"${t}"`).join(',')})`)
            .order('name');

        if (error) return { data: [], error };
        return { data: applyNameFilter(data || []), error: null };
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
