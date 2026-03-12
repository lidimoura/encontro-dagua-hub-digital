import { supabase } from './client';
import { Product } from '@/types';

export const productsService = {
    /**
     * Get all active catalog products (excludes tech_stack, infra and api_cost entries)
     * Used by the Deal products tab — Tech Stack has its own separate view.
     */
    async getAll(options?: { timestamp?: number }) {
        const BLOCKED_TYPES = ['tech_stack', 'infra', 'api_cost'];
        const BLOCKED_NAMES = ['openai', 'gemini', 'anthropic', 'vercel', 'supabase', 'aws', 'gcp', 'azure'];

        let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .not('type', 'in', `(${BLOCKED_TYPES.join(',')})`);

        // Cache buster for production
        if (options?.timestamp) {
            query = query.neq('created_at', new Date(options.timestamp).toISOString());
        }

        const { data, error } = await query.order('name');

        if (error || !data) return { data, error };

        // Secondary safety filter: block by name for NULL-type legacy tech records
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
